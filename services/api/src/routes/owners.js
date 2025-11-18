// services/api/src/routes/owners.js
const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ownerController = require('../controllers/ownerController');
const upload = require('../middleware/upload'); // Ensure this imports your multer config

// --- VERIFY THIS LINE ---
// It MUST have upload.array('images', 5)
router.post('/places', authenticate, requireRole(['owner']), upload.array('images', 5), ownerController.createPlace);

// --- VERIFY THIS LINE ---
router.put('/places/:placeId', authenticate, requireRole(['owner']), upload.array('images', 5), ownerController.updateOwnerPlace);

router.get('/places', authenticate, requireRole(['owner']), ownerController.getOwnerPlaces);
router.get('/places/:placeId', authenticate, requireRole(['owner']), ownerController.getOwnerPlaceById);
router.get('/bookings', authenticate, requireRole(['owner']), ownerController.getOwnerBookings);
router.put('/bookings/:bookingId/status', authenticate, requireRole(['owner']), ownerController.updateBookingStatus);
router.post('/bookings/check-in', authenticate, requireRole(['owner']), ownerController.checkInByTicketId);
router.post('/places/:placeId/menu', authenticate, requireRole(['owner']), ownerController.addMenuItem);
router.post('/places/:placeId/bundles', authenticate, requireRole(['owner']), ownerController.addBundle);

module.exports = router;