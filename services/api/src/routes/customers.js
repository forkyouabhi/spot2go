const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// Browse places near location
router.get('/places', authenticate, requireRole('customer'), customerController.listNearbyPlaces);

// Create a booking
router.post('/bookings', authenticate, requireRole('customer'), customerController.createBooking);

// Get my bookings
router.get('/bookings', authenticate, requireRole('customer'), customerController.listBookings);

module.exports = router;
