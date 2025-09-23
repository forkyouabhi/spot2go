// src/controllers/customerController.js
let bookings = []; // in-memory bookings

exports.listNearbyPlaces = (req, res) => {
  // ignoring lat/lng for now, just return all
  res.json([{ id: 1, name: 'Demo Cafe', distance: '0.5 km' }]);
};

exports.createBooking = (req, res) => {
  const { placeId, time } = req.body;
  const booking = { id: bookings.length + 1, userId: req.user.id, placeId, time };
  bookings.push(booking);
  res.json({ message: 'Booking created', booking });
};

exports.listBookings = (req, res) => {
  const userBookings = bookings.filter(b => b.userId === req.user.id);
  res.json(userBookings);
};
