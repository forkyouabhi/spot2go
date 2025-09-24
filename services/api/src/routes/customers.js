const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// Allow ANY authenticated user (customers, owners, admins) to see approved places.
router.get('/places', authenticate, customerController.listNearbyPlaces);
router.get('/places/:placeId', authenticate, customerController.getPlaceById);

// Keep booking actions restricted to ONLY customers.
router.post('/bookings', authenticate, requireRole(['customer']), customerController.createBooking);
router.get('/bookings', authenticate, requireRole(['customer']), customerController.listBookings);

module.exports = router;

