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

// --- BOOKMARK ROUTES ---
router.get('/bookmarks', authenticate, requireRole(['customer']), customerController.getUserBookmarks);
router.post('/bookmarks', authenticate, requireRole(['customer']), customerController.addBookmark);
router.delete('/bookmarks/:placeId', authenticate, requireRole(['customer']), customerController.removeBookmark);
// --- NEW: EFFICIENTLY GET BOOKMARKED PLACES ---
router.get('/bookmarks/places', authenticate, requireRole(['customer']), customerController.getUserBookmarkedPlaces);

// --- NEW: REVIEW ROUTE ---
router.post('/reviews', authenticate, requireRole(['customer']), customerController.createReview);
router.get('/reviews', authenticate, requireRole(['customer']), customerController.getUserReviews);

module.exports = router;
