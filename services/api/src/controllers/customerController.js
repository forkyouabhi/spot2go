const { Op } = require('sequelize');

const { Place, Booking, MenuItem, User, Bookmark } = require('../models');
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

const getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    const placeData = await Place.findOne({
       where: { id: placeId, status: 'approved' },
       include: [
        { model: MenuItem, as: 'menuItems', attributes: ['id', 'name', 'price'] },
        { model: User, as: 'owner', attributes: ['name', 'email'] }
      ],
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

// --- NEW FUNCTION: GET USER BOOKMARKS ---
const getUserBookmarks = async (req, res) => {
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

// --- NEW FUNCTION: ADD BOOKMARK ---
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

// --- NEW FUNCTION: REMOVE BOOKMARK ---
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

module.exports = {
    listNearbyPlaces,
    getPlaceById,
    createBooking,
    listBookings,
    getBookingByTicketId, // <-- ADDED
    getUserBookmarks,     // <-- ADDED
    addBookmark,          // <-- ADDED
    removeBookmark        // <-- ADDED
};