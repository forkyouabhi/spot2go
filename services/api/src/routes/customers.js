const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// Browse places near location
router.get('/places', authenticate, requireRole('customer'), customerController.listNearbyPlaces);

// NEW: Get details for a single place by ID
router.get('/places/:placeId', authenticate, requireRole('customer'), customerController.getPlaceById);

// Create a booking
router.post('/bookings', authenticate, requireRole('customer'), customerController.createBooking);

// Get my bookings
router.get('/bookings', authenticate, requireRole('customer'), customerController.listBookings);

module.exports = router;
