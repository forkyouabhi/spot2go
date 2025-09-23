const { Place, Booking } = require('../models');

// List all places (can later filter by proximity)
const listNearbyPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      attributes: ['id', 'name', 'type', 'amenities', 'location'],
    });
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch places' });
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
      order: [['createdAt', 'DESC']],
    });
    res.json(userBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

module.exports = {
    listNearbyPlaces,
    createBooking,
    listBookings
};
