// services/api/src/routes/admin.js
const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes in this file require the user to be an admin
// Corrected: Ensure authenticate middleware runs first, then requireRole
router.use(authenticate);
router.use(requireRole(['admin'])); // Ensure role check takes an array

// Get statistics for all places
router.get('/places/stats', adminController.getPlaceStats);

// Get all places awaiting approval
router.get('/places/pending', adminController.getPendingPlaces);

// Approve or reject a place
router.put('/places/:placeId/status', adminController.updatePlaceStatus);

// --- NEW ROUTES for Owner Verification ---
// Get all owners awaiting verification
router.get('/owners/pending', adminController.getPendingOwners);

// Approve or reject an owner account
router.put('/owners/:userId/status', adminController.updateOwnerStatus);
// --- END NEW ROUTES ---

module.exports = router;