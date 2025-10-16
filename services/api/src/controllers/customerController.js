const { Place, Booking, MenuItem, User } = require('../models');
const { Op } = require('sequelize'); // FIX: Import Sequelize operators

// Lists all approved places
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

// Gets details for a single approved place, including menu items and generated time slots
const getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    const placeData = await Place.findOne({
       where: { id: placeId, status: 'approved' },
       include: [
        {
          model: MenuItem,
          as: 'menuItems',
          attributes: ['id', 'name', 'price'],
        },
        { model: User, as: 'owner', attributes: ['name'] }
      ],
    });

    if (!placeData) {
      return res.status(404).json({ error: 'Place not found or not approved' });
    }

    const place = placeData.toJSON();

    // Dynamically generate available slots if the place is reservable
    if (place.reservable && place.reservableHours?.start && place.reservableHours?.end) {
      place.availableSlots = [];
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      // Fetch all confirmed bookings for this place within the next 7 days to check against
      const bookings = await Booking.findAll({
        where: {
          placeId: place.id,
          status: 'confirmed',
          date: {
            [Op.gte]: today.toISOString().split('T')[0],
            [Op.lt]: sevenDaysFromNow.toISOString().split('T')[0],
          }
        },
        attributes: ['date', 'startTime'],
      });

      // Create a lookup Set for efficient checking of booked slots
      const bookedSlots = new Set(
        bookings.map(b => `${b.date}T${b.startTime}`)
      );

      // Generate slots for the next 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        let currentHour = parseInt(place.reservableHours.start.split(':')[0], 10);
        const closingHour = parseInt(place.reservableHours.end.split(':')[0], 10);
        
        while(currentHour < closingHour) {
            const nextHour = currentHour + 2;
            if (nextHour <= closingHour) {
                const startTime = `${String(currentHour).padStart(2, '0')}:00:00`;
                const slotIdentifier = `${dateString}T${startTime}`;

                // Check against the lookup Set to determine real-time availability
                place.availableSlots.push({
                    id: `${place.id}-${dateString}-${currentHour}`,
                    date: dateString,
                    startTime: `${String(currentHour).padStart(2, '0')}:00`,
                    endTime: `${String(nextHour).padStart(2, '0')}:00`,
                    available: !bookedSlots.has(slotIdentifier), 
                });
            }
            currentHour += 2; // Move to the next 2-hour block
        }
      }
    }

    res.json(place);
  } catch (err) {
    console.error('Error fetching place by ID:', err);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
};

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { placeId, amount, date, startTime, endTime } = req.body;
    const userId = req.user.id;

    const place = await Place.findByPk(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // Check if the slot is already booked
    const existingBooking = await Booking.findOne({
      where: {
        placeId,
        date,
        startTime,
        status: 'confirmed'
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

    res.status(201).json({ message: 'Booking created successfully!', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// List bookings for current user
const listBookings = async (req, res) => {
  try {
    const userBookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Place, as: 'place', attributes: ['name', 'location'] }],
      order: [['created_at', 'DESC']],
    });
    // Format the response to match what the frontend expects
    res.json(userBookings.map(b => ({
        id: b.id,
        placeId: b.placeId,
        placeName: b.place.name,
        date: b.date,
        startTime: b.startTime.slice(0, 5), // Format time to HH:MM
        endTime: b.endTime.slice(0, 5),
        status: b.status,
        ticketId: b.ticketId
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

module.exports = {
    listNearbyPlaces,
    getPlaceById,
    createBooking,
    listBookings
};

