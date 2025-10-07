const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes in this file require the user to be an admin
router.use(authenticate, requireRole('admin'));

// NEW ROUTE: Get statistics for all places
router.get('/places/stats', adminController.getPlaceStats);

// Get all places awaiting approval
router.get('/places/pending', adminController.getPendingPlaces);

// Approve or reject a place
router.put('/places/:placeId/status', adminController.updatePlaceStatus);

module.exports = router;