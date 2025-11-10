// services/api/src/controllers/customerController.js
const { Op } = require('sequelize');
const { Place, Booking, MenuItem, User, UserBookmark, Review, sequelize } = require('../models');
const { sendEmail } = require('../utils/emailService');

// --- NEW HELPER FUNCTIONS ---
// Converts "HH:MM" to minutes since midnight
const timeToMinutes = (time) => {
  if (typeof time !== 'string') return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// --- FIX: Modified to return HH:MM:SS for SQL compatibility ---
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}:00`; // Returns HH:MM:SS
};
// --- END FIX ---

// Generates an array of time strings in 30-minute intervals
const generateTimeSlots = (start, end) => {
  const slots = [];
  let current = timeToMinutes(start);
  const endTime = timeToMinutes(end);

  while (current < endTime) {
    slots.push(minutesToTime(current).substring(0, 5)); // Return HH:MM for frontend
    current += 30; // 30-minute increments
  }
  return slots;
};
// --- END HELPER FUNCTIONS ---

const listNearbyPlaces = async (req, res) => {
  try {
    // --- FIX: Optimized attributes and used explicit aliasing ---
    const places = await Place.findAll({
      attributes: [
        'id', 'name', 'type', 'amenities', 'location', 'images', 
        'description', 'rating', 
        ['review_count', 'reviewCount'], 
        ['price_per_hour', 'pricePerHour'], 
        'reservable'
      ],
      where: { status: 'approved' },
      order: [['created_at', 'DESC']],
    });
    // --- END FIX ---
    res.json(places);
  } catch (err) {
    console.error('Error fetching places for customer:', err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

const createReview = async (req, res) => {
  // ... (unchanged)
  const t = await sequelize.transaction();
  try {
    const { bookingId, rating, comment } = req.body; 
    const userId = req.user.id;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'Booking ID and rating are required.' });
    }

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId: userId
      },
      transaction: t
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or you are not the owner.' });
    }
    if (booking.reviewed) {
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

    const newReviewCount = parseInt(results.count, 10);
    const newRating = parseFloat(results.avg).toFixed(1);

    await place.update({
      rating: newRating,
      reviewCount: newReviewCount
    }, { transaction: t });

    await t.commit();

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['name'] }]
    });

    res.status(201).json({ message: 'Review created successfully!', review: fullReview });

  } catch (err) {
    await t.rollback();
    console.error('Error creating review:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
       return res.status(409).json({ error: 'This booking has already been reviewed.' });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const getUserReviews = async (req, res) => {
  // ... (unchanged)
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Place, as: 'place', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// --- MODIFIED: getPlaceById for Capacity and DB Error Fix ---
const getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    // --- FIX: Optimized attributes and used explicit aliasing ---
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
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ],
      order: [[{ model: Review, as: 'reviews' }, 'created_at', 'DESC']],
    });
    // --- END FIX ---

    if (!placeData) {
      return res.status(404).json({ error: 'Place not found or not approved' });
    }

    const place = placeData.toJSON();

    if (place.reservable && place.reservableHours?.start && place.reservableHours?.end) {
      const today = new Date(new Date().setHours(0,0,0,0));
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const bookings = await Booking.findAll({
        where: {
          placeId: place.id,
          status: 'confirmed',
          date: {
            [Op.gte]: today.toISOString().split('T')[0],
            [Op.lt]: nextWeek.toISOString().split('T')[0],
          }
        },
        attributes: ['date', 'startTime', 'endTime', 'partySize']
      });

      // Create a map of occupied capacity for each 30-min slot
      const occupiedCapacity = new Map();
      bookings.forEach(b => {
        const date = b.date;
        let current = timeToMinutes(b.startTime);
        const end = timeToMinutes(b.endTime);
        while (current < end) {
          const slotKey = `${date}T${minutesToTime(current).substring(0, 5)}`; // Use HH:MM key
          const currentOccupancy = occupiedCapacity.get(slotKey) || 0;
          occupiedCapacity.set(slotKey, currentOccupancy + b.partySize);
          current += 30;
        }
      });
      
      place.availableSlots = [];
      const allPossibleSlots = generateTimeSlots(place.reservableHours.start, place.reservableHours.end);
      const maxCapacity = place.maxCapacity || 1;

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        allPossibleSlots.forEach(startTime => { // startTime is HH:MM
            const slotKey = `${dateString}T${startTime}`;
            const currentOccupancy = occupiedCapacity.get(slotKey) || 0;
            const remainingCapacity = maxCapacity - currentOccupancy;
            
            place.availableSlots.push({
                date: dateString,
                startTime: startTime,
                remainingCapacity: remainingCapacity > 0 ? remainingCapacity : 0, // Don't go below 0
            });
        });
      }
    }

    res.json(place);
  } catch (err) {
    console.error('Error fetching place by ID:', err);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
};
// --- END MODIFICATION ---

// --- MODIFIED: createBooking for Capacity and DB Error Fix ---
const createBooking = async (req, res) => {
  try {
    const { placeId, amount, date, startTime, duration, partySize = 1 } = req.body;
    const userId = req.user.id;

    if (!duration || duration <= 0) {
      return res.status(400).json({ error: 'Invalid duration.' });
    }

    const [user, place] = await Promise.all([
       User.findByPk(userId),
       Place.findByPk(placeId)
    ]);

    if (!user) {
       return res.status(404).json({ error: 'User not found.' });
    }
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    if (place.status !== 'approved' || !place.reservable) {
        return res.status(400).json({ error: 'This place is not available for booking.' });
    }

    const startMinutes = timeToMinutes(startTime);
    const durationMinutes = duration * 60;
    const endMinutes = startMinutes + durationMinutes;
    
    // --- FIX: Convert minutes back to HH:MM:SS for SQL comparison ---
    const newEndTime = minutesToTime(endMinutes);
    const newStartTime = minutesToTime(startMinutes);
    const endTimeForDB = newEndTime.substring(0, 5); // Use HH:MM for DB storage
    // --- END FIX ---

    const maxCapacity = place.maxCapacity || 1;

    // --- FIX: Use direct time comparison instead of time_to_minutes ---
    const conflictingBookings = await Booking.findAll({
      where: {
        placeId,
        date,
        status: 'confirmed',
        // Find bookings where:
        // (Existing Start < New End) AND (Existing End > New Start)
        startTime: {
          [Op.lt]: newEndTime // Compare as HH:MM:SS
        },
        endTime: {
          [Op.gt]: newStartTime // Compare as HH:MM:SS
        }
      }
    });
    // --- END FIX ---

    // Check capacity for all overlapping 30-min slots
    for (let t = startMinutes; t < endMinutes; t += 30) {
      const slotTime = minutesToTime(t); // HH:MM:SS
      
      const occupiedCapacity = conflictingBookings.reduce((sum, b) => {
        if (timeToMinutes(b.startTime) < t + 30 && timeToMinutes(b.endTime) > t) {
          return sum + b.partySize;
        }
        return sum;
      }, 0);

      if (occupiedCapacity + (partySize || 1) > maxCapacity) {
        return res.status(409).json({ error: `The time slot at ${slotTime.substring(0,5)} does not have enough capacity for ${partySize || 1} people. Please try a different time or smaller group.` });
      }
    }

    // Create Booking
    const booking = await Booking.create({
      userId,
      placeId,
      amount,
      date,
      startTime,
      endTime: endTimeForDB, // Use calculated endTime (HH:MM)
      duration,
      partySize, // <-- Save partySize
      status: 'confirmed', 
      ticketId: `SPOT2GO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // Send Confirmation Email
    try {
      await sendEmail(user.email, 'bookingConfirmation', {
        name: user.name,
        placeName: place.name,
        date: booking.date,
        startTime: booking.startTime.slice(0, 5),
        endTime: booking.endTime.slice(0, 5),
        ticketId: booking.ticketId,
        partySize: booking.partySize, 
      });
    } catch (emailError) {
      console.error(`Failed to send booking confirmation email to ${user.email}:`, emailError);
    }

    res.status(201).json({ message: 'Booking created successfully!', booking });
  } catch (err) {
    console.error('Error creating booking:', err); 
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
// --- END MODIFICATION ---

// --- THIS IS THE FIX ---
const listBookings = async (req, res) => {
  try {
    const userBookings = await Booking.findAll({
      where: { userId: req.user.id },
      // Explicitly ask for the attributes we need
      attributes: [
        'id', 'placeId', 'date', 'startTime', 'endTime', 'status', 
        'ticketId', 'partySize', 'reviewed'
      ],
      // Include the associated Place model to get its name
      include: [{ model: Place, as: 'place', attributes: ['id', 'name', 'location'] }],
      order: [['date', 'DESC'], ['startTime', 'DESC']], // Order by date, then time
    });
    res.json(userBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};
// --- END FIX ---

const getBookingByTicketId = async (req, res) => {
  
  try {
    const { ticketId } = req.params;
    const userId = req.user.id; 

    const booking = await Booking.findOne({
      where: {
        ticketId: ticketId,
        userId: userId 
      },
      include: [
        {
          model: Place,
          as: 'place',
          attributes: ['id', 'name', 'location', 'images']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

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

    if (!userWithBookmarks) {
      return res.json([]);
    }

    res.json(userWithBookmarks.bookmarkedPlaces || []);
  } catch (err) {
    console.error('Error fetching bookmarked places:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarked places' });
  }
};

const addBookmark = async (req, res) => {
  
  try {
    const { placeId } = req.body;
    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required.' });
    }
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
      where: {
        userId: req.user.id,
        placeId: placeId
      }
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