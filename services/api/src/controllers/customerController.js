// services/api/src/controllers/customerController.js
const { Op } = require('sequelize');
const { Place, Booking, MenuItem, User, UserBookmark, Review, sequelize } = require('../models');
const { sendEmail } = require('../utils/emailService');
// 1. Import the push notification sender
const { sendToUser } = require('./notificationController');

const listNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const findOptions = {
      where: { status: 'approved' },
      attributes: {
        include: [
          [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('reviews.rating')), 0), 'rating'],
          [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount']
        ]
      },
      include: [
        { model: User, as: 'owner', attributes: ['name', 'id'] },
        { model: Review, as: 'reviews', attributes: [] }
      ],
      group: ['Place.id', 'owner.id'],
      subQuery: false,
    };

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const haversine = `
        ( 6371 * acos(
            cos( radians(${latitude}) )
            * cos( radians( CAST(location->>'lat' AS double precision) ) )
            * cos( radians( CAST(location->>'lng' AS double precision) ) - radians(${longitude}) )
            + sin( radians(${latitude}) )
            * sin( radians( CAST(location->>'lat' AS double precision) ) )
        ) )
      `;
      findOptions.attributes.include.push(
        [sequelize.literal(haversine), 'distance']
      );
      findOptions.order = [
        [sequelize.literal('distance'), 'ASC']
      ];
    } else {
      findOptions.order = [['created_at', 'DESC']];
    }

    const places = await Place.findAll(findOptions);
    res.json(places);
  } catch (err) {
    console.error('Error fetching places for customer:', err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    const placeData = await Place.findOne({
       where: { id: placeId, status: 'approved' },
       include: [
        { model: MenuItem, as: 'menuItems', attributes: ['id', 'name', 'price'] },
        { model: User, as: 'owner', attributes: ['name', 'email'] },
        { 
          model: Review, 
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['name', 'id'] }]
        }
      ],
      order: [
        [{ model: Review, as: 'reviews' }, 'created_at', 'DESC']
      ],
    });

    if (!placeData) {
      return res.status(404).json({ error: 'Place not found or not approved' });
    }

    const place = placeData.toJSON();

    if (place.reviews && place.reviews.length > 0) {
      const sum = place.reviews.reduce((acc, review) => acc + review.rating, 0);
      place.rating = parseFloat((sum / place.reviews.length).toFixed(1));
    } else {
      place.rating = 0;
    }
    place.reviewCount = place.reviews ? place.reviews.length : 0;

    if (place.reservable && place.reservableHours?.start && place.reservableHours?.end) {
      const today = new Date();
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
        attributes: ['date', 'startTime']
      });

      const bookedSlots = new Set(bookings.map(b => `${b.date}T${b.startTime}`));
      
      place.availableSlots = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        let currentHour = parseInt(place.reservableHours.start.split(':')[0], 10);
        const closingHour = parseInt(place.reservableHours.end.split(':')[0], 10);
        
        while(currentHour < closingHour) {
            const nextHour = currentHour + 2;
            if (nextHour <= closingHour) {
                const startTime = `${String(currentHour).padStart(2, '0')}:00`;
                const slotId = `${dateString}T${startTime}`;
                place.availableSlots.push({
                    id: `${place.id}-${slotId}`,
                    date: dateString,
                    startTime: startTime,
                    endTime: `${String(nextHour).padStart(2, '0')}:00`,
                    available: !bookedSlots.has(slotId),
                });
            }
            currentHour += 2;
        }
      }
    }

    res.json(place);
  } catch (err) {
    console.error('Error fetching place by ID:', err);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
};
const createBooking = async (req, res) => {
  try {
    const { placeId, amount, date, startTime, endTime } = req.body;
    const userId = req.user.id; 

    const [user, place] = await Promise.all([
       User.findByPk(userId),
       Place.findByPk(placeId, {
         include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
       })
    ]);

    if (!user) {
       return res.status(404).json({ error: 'User not found.' });
    }
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    if (!place.owner) {
      console.error(`CRITICAL: Place ${place.id} has no owner. Booking cannot notify owner.`);
    }
    if (place.status !== 'approved' || !place.reservable) {
        return res.status(400).json({ error: 'This place is not available for booking.' });
    }

    const existingBooking = await Booking.findOne({
      where: {
        placeId,
        date,
        startTime,
        status: { [Op.in]: ['confirmed', 'pending'] }
      }
    });

    if (existingBooking) {
      return res.status(409).json({ error: 'This time slot is no longer available.' });
    }

    const booking = await Booking.create({
      userId,
      placeId,
      amount, 
      date,
      startTime,
      endTime,
      status: 'confirmed', 
      ticketId: `SPOT2GO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // --- START NOTIFICATION LOGIC ---
    const bookingTime = `${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`;

    // 3. Send confirmation email to CUSTOMER
    try {
      await sendEmail(user.email, 'bookingConfirmation', {
        name: user.name,
        placeName: place.name,
        date: booking.date,
        startTime: booking.startTime.slice(0, 5),
        endTime: booking.endTime.slice(0, 5),
        ticketId: booking.ticketId,
      });
    } catch (emailError) {
      console.error(`Failed to send booking confirmation email to ${user.email}:`, emailError);
    }
    
    // 4. Send notification email and push to OWNER
    if (place.owner) {
      if (place.owner.email) {
        try {
          await sendEmail(place.owner.email, 'newBookingForOwner', {
            ownerName: place.owner.name,
            customerName: user.name,
            customerEmail: user.email,
            customerPhone: user.phone,
            placeName: place.name,
            date: booking.date,
            startTime: booking.startTime.slice(0, 5),
            endTime: booking.endTime.slice(0, 5),
            ticketId: booking.ticketId,
          });
        } catch (emailError) {
          console.error(`Failed to send new booking notification email to owner ${place.owner.email}:`, emailError);
        }
      }
      
      try {
        await sendToUser(place.owner.id, {
          notification: {
            title: `🎉 New Booking at ${place.name}!`,
            body: `${user.name} has booked for ${booking.date} at ${bookingTime}.`
          },
          data: {
            type: 'NEW_BOOKING',
            bookingId: booking.id.toString(),
            placeId: place.id.toString(),
          }
        });
      } catch (pushError) {
        console.error(`Failed to send push notification to owner ${place.owner.id}:`, pushError);
      }
    }
    // --- END NOTIFICATION LOGIC ---

    res.status(201).json({ message: 'Booking created successfully!', booking });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const listBookings = async (req, res) => {
  try {
    const userBookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Place, as: 'place', attributes: ['name', 'location'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(userBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
  
};

const listBookmarks = async (req, res) => {
  try {
    const bookmarks = await UserBookmark.findAll({
      where: { userId: req.user.id },
      attributes: ['placeId'],
    });
    const placeIds = bookmarks.map(b => b.placeId.toString());
    res.json(placeIds);
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

const addBookmark = async (req, res) => {
  try {
    const { placeId } = req.body;
    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required.' });
    }
    const bookmark = await Bookmark.create({
      userId: req.user.id,
      placeId: placeId
    });
    res.status(201).json({ message: 'Bookmark added.', placeId: bookmark.placeId });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ message: 'Already bookmarked.' });
    }
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const { placeId } = req.params;
    const result = await Bookmark.destroy({
      where: {
        userId: req.user.id,
        placeId: placeId
      }
    });
    if (result === 0) {
      return res.status(200).json({ message: 'Bookmark not found or already removed.' });
    }
    res.json({ message: 'Bookmark removed.', placeId: placeId });
  } catch (err) {
    console.error('Error removing bookmark:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};

const createReview = async (req, res) => {
  try {
    const { placeId, rating, comment } = req.body;
    const userId = req.user.id;

    const pastBooking = await Booking.findOne({
      where: {
        userId,
        placeId,
        status: 'confirmed',
        date: { [Op.lt]: new Date() }
      }
    });

    if (!pastBooking) {
      return res.status(403).json({ error: 'You can only review places you have previously booked.' });
    }

    const existingReview = await Review.findOne({ where: { userId, placeId } });
    if (existingReview) {
      return res.status(409).json({ error: 'You have already submitted a review for this place.' });
    }

    const newReview = await Review.create({
      userId,
      placeId,
      rating,
      comment
    });

    const reviewWithUser = await Review.findOne({
      where: { id: newReview.id },
      include: [{ model: User, as: 'user', attributes: ['name', 'id'] }]
    });

    res.status(201).json(reviewWithUser);

  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to create review.' });
  }
};
const getBookingByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id; // Get user ID from authenticated request

    const booking = await Booking.findOne({
      where: {
        ticketId: ticketId,
        userId: userId // Ensures a user can only get their own booking
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
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      attributes: ['placeId']
    });
    // The frontend expects an array of strings
    res.json(bookmarks.map(b => b.placeId.toString()));
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

module.exports = {
    listNearbyPlaces,
    getPlaceById,
    createBooking,
    listBookings,
    listBookmarks,
    getBookingByTicketId,
    getUserBookmarks,     
    addBookmark,
    removeBookmark,
    createReview
};