// services/api/src/routes/customers.js
const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// --- PUBLIC ROUTES (No Authentication Required) ---
// This allows the Homepage (SSR) and visitors to see the places.
router.get('/places', customerController.listNearbyPlaces);
router.get('/places/:placeId', customerController.getPlaceById);

// --- PROTECTED ROUTES (Login Required) ---
// Bookings, Bookmarks, and Reviews still require a logged-in user.

router.post('/bookings', authenticate, requireRole(['customer']), customerController.createBooking);
router.get('/bookings', authenticate, requireRole(['customer']), customerController.listBookings);
router.get('/bookings/ticket/:ticketId', authenticate, requireRole(['customer']), customerController.getBookingByTicketId);

router.get('/bookmarks', authenticate, requireRole(['customer']), customerController.getUserBookmarks);
router.get('/bookmarks/places', authenticate, requireRole(['customer']), customerController.getBoookmarkedPlaces);
router.post('/bookmarks', authenticate, requireRole(['customer']), customerController.addBookmark);
router.delete('/bookmarks/:placeId', authenticate, requireRole(['customer']), customerController.removeBookmark);

router.post('/reviews', authenticate, requireRole(['customer']), customerController.createReview);
router.get('/reviews', authenticate, requireRole(['customer']), customerController.getUserReviews);

module.exports = router;