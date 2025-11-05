// services/api/src/routes/owners.js
const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ownerController = require('../controllers/ownerController');
const upload = require('../middleware/upload');

// Create a new place
router.post('/places', authenticate, requireRole('owner'), upload.array('images', 5), ownerController.createPlace);

// Update an existing place
router.put('/places/:placeId', authenticate, requireRole('owner'), upload.array('images', 5), ownerController.updateOwnerPlace);

// Get all places owned by current user
router.get('/places', authenticate, requireRole('owner'), ownerController.getOwnerPlaces);

// Get a single place owned by the current user
router.get('/places/:placeId', authenticate, requireRole('owner'), ownerController.getOwnerPlaceById);

// Get all bookings for the owner's places
router.get('/bookings', authenticate, requireRole('owner'), ownerController.getOwnerBookings);

// --- NEW ROUTE FOR CHECK-IN ---
router.put('/bookings/:bookingId/status', authenticate, requireRole('owner'), ownerController.updateBookingStatus);
// --- END NEW ROUTE ---
router.post('/bookings/check-in', authenticate, requireRole('owner'), ownerController.checkInByTicketId);
// Add a menu item
router.post('/places/:placeId/menu', authenticate, requireRole('owner'), ownerController.addMenuItem);

// Add a bundle
router.post('/places/:placeId/bundles', authenticate, requireRole('owner'), ownerController.addBundle);

module.exports = router;