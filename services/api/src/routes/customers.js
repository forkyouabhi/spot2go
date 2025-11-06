// services/api/src/routes/customers.js
const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// Allow ANY authenticated user (customers, owners, admins) to see approved places.
router.get('/places', authenticate, customerController.listNearbyPlaces);
router.get('/places/:placeId', authenticate, customerController.getPlaceById);

// Keep booking actions restricted to ONLY customers.
router.post('/bookings', authenticate, requireRole(['customer']), customerController.createBooking);
router.get('/bookings', authenticate, requireRole(['customer']), customerController.listBookings);
router.get('/bookings/ticket/:ticketId', authenticate, requireRole(['customer']), customerController.getBookingByTicketId);

// Use `requireRole` to ensure only customers can bookmark
router.get('/bookmarks', authenticate, requireRole(['customer']), customerController.getUserBookmarks);
// --- FIX: Add route for getting full bookmarked place data ---
router.get('/bookmarks/places', authenticate, requireRole(['customer']), customerController.getBoookmarkedPlaces);
router.post('/bookmarks', authenticate, requireRole(['customer']), customerController.addBookmark);
router.delete('/bookmarks/:placeId', authenticate, requireRole(['customer']), customerController.removeBookmark);

// --- FIX: Add routes for reviews ---
router.post('/reviews', authenticate, requireRole(['customer']), customerController.createReview);
router.get('/reviews', authenticate, requireRole(['customer']), customerController.getUserReviews);

module.exports = router;