// services/api/src/controllers/customerController.js
const { Op, Sequelize } = require('sequelize');
const { Place, Booking, MenuItem, User, UserBookmark, Review, sequelize } = require('../models');
const { sendEmail } = require('../utils/emailService');

// --- HELPER FUNCTIONS ---
const timeToMinutes = (time) => {
  if (typeof time !== 'string') return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}:00`;
};

const generateTimeSlots = (start, end) => {
  const slots = [];
  let current = timeToMinutes(start);
  const endTime = timeToMinutes(end);
  while (current < endTime) {
    slots.push(minutesToTime(current).substring(0, 5));
    current += 30;
  }
  return slots;
};
// --- END HELPER FUNCTIONS ---

const listNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    let attributes = [
      'id', 'name', 'type', 'amenities', 'location', 'images', 
      'description', 'rating', 
      ['review_count', 'reviewCount'], 
      ['price_per_hour', 'pricePerHour'], 
      'reservable'
    ];
    let order = [['created_at', 'DESC']];

    if (lat && lng) {
      const distanceLiteral = Sequelize.literal(`(
          6371 * acos(
            cos(radians(${parseFloat(lat)})) * cos(radians(CAST("Place"."location"->>'lat' AS DOUBLE PRECISION))) * cos(radians(CAST("Place"."location"->>'lng' AS DOUBLE PRECISION)) - radians(${parseFloat(lng)})) + 
            sin(radians(${parseFloat(lat)})) * sin(radians(CAST("Place"."location"->>'lat' AS DOUBLE PRECISION)))
          )
      )`);
      attributes.push([distanceLiteral, 'distance']);
      order = [[Sequelize.col('distance'), 'ASC']];
    }

    const places = await Place.findAll({
      attributes: attributes,
      where: { status: 'approved' },
      order: order,
    });

    const formattedPlaces = places.map(place => {
      const p = place.toJSON();
      return {
        ...p,
        distance: p.distance ? parseFloat(p.distance).toFixed(1) : null
      };
    });

    res.json(formattedPlaces);
  } catch (err) {
    console.error('Error fetching places for customer:', err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

const createReview = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bookingId, rating, comment } = req.body; 
    const userId = req.user.id;

    if (!bookingId || !rating) {
      await t.rollback();
      return res.status(400).json({ error: 'Booking ID and rating are required.' });
    }

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
      transaction: t
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).json({ error: 'Booking not found or you are not the owner.' });
    }
    if (booking.reviewed) {
      await t.rollback();
      return res.status(409).json({ error: 'This booking has already been reviewed.' });
    }
    
    const review = await Review.create({
      userId,
      placeId: booking.placeId,
      bookingId,
      rating,
      comment
    }, { transaction: t });

    await booking.update({ reviewed: true }, { transaction: t });

    // Update aggregate rating
    const place = await Place.findByPk(booking.placeId, { transaction: t, lock: true });
    
    const [results] = await Review.findAll({
      where: { placeId: booking.placeId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg']
      ],
      raw: true,
      transaction: t
    });

    await place.update({
      rating: parseFloat(results[0]?.avg || 0).toFixed(1),
      reviewCount: parseInt(results[0]?.count || 0, 10)
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Review created successfully!', review });

  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
       return res.status(409).json({ error: 'This booking has already been reviewed.' });
    }
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    // --- FIX: Use separate: true to safely fetch limited reviews ---
    const placeData = await Place.findOne({
       attributes: [
         'id', 'name', 'type', 'description', 'amenities', 'images', 
         'location', 'status', 'reservable', 
         ['reservable_hours', 'reservableHours'], 
         ['max_capacity', 'maxCapacity'], 
         'rating', 
         ['review_count', 'reviewCount'], 
         ['price_per_hour', 'pricePerHour']
       ],
       where: { id: placeId, status: 'approved' },
       include: [
        { model: MenuItem, as: 'menuItems', attributes: ['id', 'name', 'price'] },
        { 
          model: Review, 
          as: 'reviews',
          attributes: ['id', 'rating', 'comment', 'created_at', 'userId'],
          include: [{ model: User, as: 'user', attributes: ['name'] }],
          limit: 5,
          order: [['created_at', 'DESC']], // Order belongs inside the separate query
          separate: true // <--- Runs a second query for reviews, fixing the JOIN error
        }
      ],
      // Removed top-level 'order' that was causing the SQL error
    });

    if (!placeData) return res.status(404).json({ error: 'Place not found' });

    const place = placeData.toJSON();

    if (place.reservable && place.reservableHours?.start && place.reservableHours?.end) {
      const today = new Date(new Date().setHours(0,0,0,0));
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const bookings = await Booking.findAll({
        where: {
          placeId: place.id,
          status: 'confirmed',
          date: { [Op.gte]: today, [Op.lt]: nextWeek }
        },
        attributes: ['date', 'startTime', 'endTime', 'partySize']
      });

      const occupiedCapacity = new Map();
      bookings.forEach(b => {
        const dateStr = typeof b.date === 'string' ? b.date : b.date.toISOString().split('T')[0];
        let current = timeToMinutes(b.startTime);
        const end = timeToMinutes(b.endTime);
        while (current < end) {
          const slotKey = `${dateStr}T${minutesToTime(current).substring(0, 5)}`;
          occupiedCapacity.set(slotKey, (occupiedCapacity.get(slotKey) || 0) + b.partySize);
          current += 30;
        }
      });
      
      place.availableSlots = [];
      const allSlots = generateTimeSlots(place.reservableHours.start, place.reservableHours.end);
      const maxCap = place.maxCapacity || 1;

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dString = d.toISOString().split('T')[0];

        allSlots.forEach(time => {
            const key = `${dString}T${time}`;
            const remaining = maxCap - (occupiedCapacity.get(key) || 0);
            place.availableSlots.push({
                date: dString,
                startTime: time,
                remainingCapacity: Math.max(0, remaining),
            });
        });
      }
    }

    res.json(place);
  } catch (err) {
    console.error('Error fetching place:', err);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
};

// --- SECURITY UPGRADE: TRANSACTIONAL BOOKING ---
const createBooking = async (req, res) => {
  const t = await sequelize.transaction(); // 1. Start Transaction
  
  try {
    const { placeId, amount, date, startTime, duration, partySize = 1 } = req.body;
    const userId = req.user.id;

    if (!duration || duration <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid duration.' });
    }

    // 2. Lock the Place row for update. This serializes bookings for this place.
    const place = await Place.findByPk(placeId, { 
      transaction: t, 
      lock: t.LOCK.UPDATE 
    });

    if (!place || place.status !== 'approved' || !place.reservable) {
        await t.rollback();
        return res.status(400).json({ error: 'Place not available.' });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
        await t.rollback();
        return res.status(404).json({ error: 'User not found.' });
    }

    const startMinutes = timeToMinutes(startTime);
    const durationMinutes = duration * 60;
    const endMinutes = startMinutes + durationMinutes;
    const newEndTime = minutesToTime(endMinutes);
    const newStartTime = minutesToTime(startMinutes);
    const endTimeForDB = newEndTime.substring(0, 5);

    // 3. Check Capacity within the transaction scope
    const conflictingBookings = await Booking.findAll({
      where: {
        placeId,
        date,
        status: 'confirmed',
        startTime: { [Op.lt]: newEndTime },
        endTime: { [Op.gt]: newStartTime }
      },
      transaction: t // IMPORTANT: Read inside transaction
    });

    const maxCapacity = place.maxCapacity || 1;

    // Check 30-min slots
    for (let time = startMinutes; time < endMinutes; time += 30) {
      const slotOccupancy = conflictingBookings.reduce((sum, b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        // If booking overlaps this 30min slot
        if (bStart < time + 30 && bEnd > time) {
          return sum + b.partySize;
        }
        return sum;
      }, 0);

      if (slotOccupancy + partySize > maxCapacity) {
        await t.rollback(); // 4. Rollback on conflict
        return res.status(409).json({ 
          error: `Time slot ${minutesToTime(time).substring(0,5)} is full.` 
        });
      }
    }

    // 5. Create Booking
    const booking = await Booking.create({
      userId,
      placeId,
      amount,
      date,
      startTime,
      endTime: endTimeForDB,
      duration,
      partySize,
      status: 'confirmed', 
      ticketId: `SPOT2GO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }, { transaction: t });

    // 6. Commit Transaction
    await t.commit();

    // Email (outside transaction)
    sendEmail(user.email, 'bookingConfirmation', {
        name: user.name,
        placeName: place.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        ticketId: booking.ticketId
    }).catch(e => console.error("Email failed", e));

    res.status(201).json({ message: 'Booking created successfully!', booking });
    
  } catch (err) {
    await t.rollback();
    console.error('Error creating booking:', err); 
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const listBookings = async (req, res) => {
  try {
    const userBookings = await Booking.findAll({
      where: { userId: req.user.id },
      attributes: [
        'id', 'placeId', 'date', 'startTime', 'endTime', 'status', 
        'ticketId', 'partySize', 'reviewed'
      ],
      include: [{ model: Place, as: 'place', attributes: ['id', 'name', 'location'] }],
      order: [['date', 'DESC'], ['startTime', 'DESC']], 
    });
    res.json(userBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getBookingByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id; 

    const booking = await Booking.findOne({
      where: { ticketId: ticketId, userId: userId },
      include: [
        { model: Place, as: 'place', attributes: ['id', 'name', 'location', 'images'] },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
      ]
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking by ticket ID:', err);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const bookmarks = await UserBookmark.findAll({
      where: { userId: req.user.id },
      attributes: ['placeId']
    });
    res.json(bookmarks.map(b => b.placeId.toString()));
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

const getBoookmarkedPlaces = async (req, res) => {
  try {
    const userWithBookmarks = await User.findByPk(req.user.id, {
      include: {
        model: Place,
        as: 'bookmarkedPlaces',
        through: { attributes: [] },
        where: { status: 'approved' }, 
        required: false,
      },
      order: [[{ model: Place, as: 'bookmarkedPlaces' }, 'created_at', 'DESC']],
    });
    res.json(userWithBookmarks?.bookmarkedPlaces || []);
  } catch (err) {
    console.error('Error fetching bookmarked places:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarked places' });
  }
};

const addBookmark = async (req, res) => {
  try {
    const { placeId } = req.body;
    if (!placeId) return res.status(400).json({ error: 'placeId is required.' });
    
    const bookmark = await UserBookmark.create({
      userId: req.user.id,
      placeId: placeId
    });
    res.status(201).json({ message: 'Bookmark added.', placeId: bookmark.placeId });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ message: 'Already bookmarked.', placeId: req.body.placeId });
    }
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const { placeId } = req.params;
    const result = await UserBookmark.destroy({
      where: { userId: req.user.id, placeId: placeId }
    });
    if (result === 0) {
      return res.status(200).json({ message: 'Bookmark not found or already removed.', placeId: placeId });
    }
    res.json({ message: 'Bookmark removed.', placeId: placeId });
  } catch (err) {
    console.error('Error removing bookmark:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [{ model: Place, as: 'place', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = {
    listNearbyPlaces,
    getPlaceById,
    createBooking, 
    listBookings,
    getBookingByTicketId,
    getUserBookmarks,
    getBoookmarkedPlaces,
    addBookmark,
    removeBookmark,
    createReview,
    getUserReviews
};