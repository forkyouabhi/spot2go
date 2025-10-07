const { Place,Booking, MenuItem, User } = require('../models');
const listNearbyPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: 'approved' },
      // We don't need to include menuItems here to keep the initial load light
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
    const place = await Place.findOne({
       where: { id: placeId, status: 'approved' },
       include: [
        {
          model: MenuItem,
          as: 'menuItems',
          attributes: ['id', 'name', 'price'],
        }
      ],
    });

    if (!place) {
      return res.status(404).json({ error: 'Place not found or not approved' });
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
    const { placeId, amount } = req.body;
    const userId = req.user.id;

    const place = await Place.findByPk(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const booking = await Booking.create({
      userId,
      placeId,
      amount,
      status: 'pending',
    });

    res.status(201).json({ message: 'Booking created', booking });
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
    res.json(userBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// IMPORTANT: All functions must be exported in this single object.
module.exports = {
    listNearbyPlaces,
    getPlaceById,
    createBooking,
    listBookings
};

