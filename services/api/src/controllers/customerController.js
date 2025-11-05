const { Op } = require('sequelize');
const { Place, Booking, MenuItem, User, Bookmark, Review } = require('../models'); // <-- Added Review
const { sendEmail } = require('../utils/emailService');

const listNearbyPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: 'approved' },
      order: [['created_at', 'DESC']],
      // Note: You would add location-based querying here in production
    });
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
        // --- ADDED REVIEW LOADING ---
        {
          model: Review,
          as: 'reviews',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name'] }
          ],
          order: [['created_at', 'DESC']]
        }
        // --- END REVIEW LOADING ---
      ],
    });

    if (!placeData) {
      return res.status(404).json({ error: 'Place not found or not approved' });
    }

    const place = placeData.toJSON();

    // Recalculate rating/reviewCount on the fly from the included data
    // This is more accurate than a potentially stale column
    if (place.reviews && place.reviews.length > 0) {
      const sum = place.reviews.reduce((acc, review) => acc + review.rating, 0);
      place.rating = parseFloat((sum / place.reviews.length).toFixed(1));
      place.reviewCount = place.reviews.length;
    } else {
      place.rating = 0;
      place.reviewCount = 0;
    }

    // (Your existing slot generation logic)
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
  // (This function remains unchanged from your file)
  try {
    const { placeId, amount, date, startTime, endTime } = req.body;
    const userId = req.user.id; 

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
    
    res.status(201).json({ message: 'Booking created successfully!', booking });
  } catch (err) {
    console.error('Error creating booking:', err); 
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const listBookings = async (req, res) => {
  // (This function remains unchanged from your file)
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

const getBookingByTicketId = async (req, res) => {
  // (This function remains unchanged from your file)
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

// --- NEW REVIEW FUNCTION ---
const createReview = async (req, res) => {
  try {
    const { placeId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user has already reviewed this place
    const existingReview = await Review.findOne({
      where: { userId, placeId }
    });

    if (existingReview) {
      return res.status(409).json({ error: 'You have already submitted a review for this place.' });
    }

    // Create the new review
    const review = await Review.create({
      userId,
      placeId,
      rating: parseInt(rating, 10),
      comment
    });

    // Fetch the newly created review with the user's name
    const newReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }]
    });

    // We can also trigger an update for the place's average rating here (omitted for brevity)

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
};

// --- NEW EFFICIENT BOOKMARK FUNCTION ---
const getUserBookmarkedPlaces = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Bookmark,
        as: 'bookmarks',
        attributes: ['placeId'] // Only need the placeId from the join table
      }]
    });

    if (!user || !user.bookmarks) {
      return res.json([]);
    }

    const placeIds = user.bookmarks.map(b => b.placeId);

    if (placeIds.length === 0) {
      return res.json([]);
    }

    // Now fetch all places matching those IDs
    const bookmarkedPlaces = await Place.findAll({
      where: {
        id: { [Op.in]: placeIds },
        status: 'approved' // Only show approved places
      },
      // Optionally include reviews/ratings here too if needed on account page
      // For now, keeping it simple as per the BookmarkCard component
    });
    
    // Simple mapping to add rating/reviewCount stubs if they don't exist
    const placesWithRatings = await Promise.all(bookmarkedPlaces.map(async (place) => {
        const placeJSON = place.toJSON();
        const reviewCount = await Review.count({ where: { placeId: place.id } });
        const reviewSum = await Review.sum('rating', { where: { placeId: place.id } });
        
        placeJSON.reviewCount = reviewCount;
        placeJSON.rating = reviewCount > 0 ? (reviewSum / reviewCount).toFixed(1) : '0.0';
        return placeJSON;
    }));

    res.json(bookmarkedPlaces);
  } catch (err) {
    console.error('Error fetching bookmarked places:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarked places' });
  }
};

const getUserBookmarks = async (req, res) => {
  // (This function remains unchanged from your file)
  try {
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      attributes: ['placeId']
    });
    res.json(bookmarks.map(b => b.placeId.toString()));
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

const addBookmark = async (req, res) => {
  // (This function remains unchanged from your file)
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
  // (This function remains unchanged from your file)
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

module.exports = {
    listNearbyPlaces,
    getPlaceById,
    createBooking,
    listBookings,
    getBookingByTicketId,
    getUserBookmarks,
    addBookmark,
    removeBookmark,
    createReview, // <-- ADDED
    getUserBookmarkedPlaces, // <-- ADDED
};