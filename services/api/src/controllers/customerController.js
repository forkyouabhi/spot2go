// services/api/src/controllers/customerController.js
const { Op } = require('sequelize');
// --- FIX: Added 'sequelize' to the import ---
const { Place, Booking, MenuItem, User, UserBookmark, Review, sequelize } = require('../models');
const { sendEmail } = require('../utils/emailService');

const listNearbyPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: 'approved' },
      order: [['created_at', 'DESC']],
    });
    res.json(places);
  } catch (err) {
    console.error('Error fetching places for customer:', err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};
const createReview = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bookingId, rating, comment } = req.body; // <-- FIX: Changed from placeId to bookingId
    const userId = req.user.id;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'Booking ID and rating are required.' });
    }

    // 1. Find the booking and check ownership/status
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
    // Optional: Check if the booking date is in the past
    // if (new Date(booking.date) > new Date()) {
    //    return res.status(400).json({ error: 'You can only review past bookings.' });
    // }
    
    // 2. Create the review
    const review = await Review.create({
      userId,
      placeId: booking.placeId,
      bookingId,
      rating,
      comment
    }, { transaction: t });

    // 3. Update the booking to mark it as reviewed
    await booking.update({ reviewed: true }, { transaction: t });

    // 4. Update the Place's average rating and review count
    const place = await Place.findByPk(booking.placeId, { transaction: t, lock: true });
    
    const [results] = await Review.findAll({
      where: { placeId: booking.placeId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'], // <-- This now works
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg'] // <-- This now works
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

    // 5. Commit the transaction
    await t.commit();

    // 6. Return the full review object with user info
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
const getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    const placeData = await Place.findOne({
       where: { id: placeId, status: 'approved' },
       include: [
        { model: MenuItem, as: 'menuItems', attributes: ['id', 'name', 'price'] },
        { model: User, as: 'owner', attributes: ['name', 'email'] },
        // --- FIX: Include reviews with user info ---
        { 
          model: Review, 
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ],
      // Order reviews by newest first
      order: [[{ model: Review, as: 'reviews' }, 'created_at', 'DESC']],
    });

    if (!placeData) {
      return res.status(404).json({ error: 'Place not found or not approved' });
    }

    const place = placeData.toJSON();

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
            const nextHour = currentHour + 2; // Assuming 2-hour slots
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
            currentHour += 2; // Increment by slot length
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
    const userId = req.user.id; // Get user ID from authenticated request

    // --- Find User and Place ---
    const [user, place] = await Promise.all([
       User.findByPk(userId),
       Place.findByPk(placeId)
    ]);

    if (!user) {
       return res.status(404).json({ error: 'User not found.' }); // Should not happen if authenticated
    }
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    if (place.status !== 'approved' || !place.reservable) {
        return res.status(400).json({ error: 'This place is not available for booking.' });
    }

    // Check if the slot is already booked
    const existingBooking = await Booking.findOne({
      where: {
        placeId,
        date,
        startTime,
        status: { [Op.in]: ['confirmed', 'pending'] } // Check pending too
      }
    });

    if (existingBooking) {
      return res.status(409).json({ error: 'This time slot is no longer available.' });
    }

    // --- Create Booking ---
    const booking = await Booking.create({
      userId,
      placeId,
      amount, // You might want to calculate this server-side based on place.pricePerHour
      date,
      startTime,
      endTime,
      status: 'confirmed', // Assuming direct confirmation for now
      ticketId: `SPOT2GO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // --- Send Confirmation Email ---
    try {
      await sendEmail(user.email, 'bookingConfirmation', {
        name: user.name,
        placeName: place.name,
        date: booking.date,
        startTime: booking.startTime.slice(0, 5), // Format HH:MM
        endTime: booking.endTime.slice(0, 5),     // Format HH:MM
        ticketId: booking.ticketId,
      });
    } catch (emailError) {
      // Log the error but don't fail the booking if email fails
      console.error(`Failed to send booking confirmation email to ${user.email}:`, emailError);
    }
    // -----------------------------

    res.status(201).json({ message: 'Booking created successfully!', booking });
  } catch (err) {
    console.error('Error creating booking:', err); // Log the specific error
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
const listBookings = async (req, res) => {
  try {
    const userBookings = await Booking.findAll({
      where: { userId: req.user.id },
      // FIX: Include the 'reviewed' field
      include: [{ model: Place, as: 'place', attributes: ['name', 'location'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(userBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// --- NEW FUNCTION: GET BOOKING BY TICKET ID ---
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

// --- FIX: USE UserBookmark MODEL ---
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

// --- NEW CONTROLLER: Get Full Bookmarked Places ---
const getBoookmarkedPlaces = async (req, res) => {
  try {
    const userWithBookmarks = await User.findByPk(req.user.id, {
      include: {
        model: Place,
        as: 'bookmarkedPlaces',
        through: { attributes: [] }, // Don't include the join table data
        where: { status: 'approved' }, // Only show approved places
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

// --- FIX: USE UserBookmark MODEL ---
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
      // Return the placeId so the frontend can still update state
      return res.status(200).json({ message: 'Already bookmarked.', placeId: req.body.placeId });
    }
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

// --- FIX: USE UserBookmark MODEL ---
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
    getBoookmarkedPlaces, // <-- EXPORT NEW CONTROLLER
    addBookmark,
    removeBookmark,
    createReview,
    getUserReviews
};