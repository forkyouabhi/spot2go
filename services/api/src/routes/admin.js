// services/api/src/routes/admin.js
const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply admin protection to ALL routes in this file
router.use(authenticate, requireRole(['admin']));

// Dashboard Stats
router.get('/places/stats', adminController.getDashboardStats);

// Pending Places
router.get('/places/pending', adminController.getPendingPlaces);
router.put('/places/:placeId/status', adminController.updatePlaceStatus);

// Pending Owners
router.get('/owners/pending', adminController.getPendingOwners);
router.put('/owners/:userId/status', adminController.updateOwnerStatus);

module.exports = router;