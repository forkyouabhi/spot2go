const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ownerController = require('../controllers/ownerController');

// Create a new place
router.post('/places', authenticate, requireRole('owner'), ownerController.createPlace);

// Get all places owned by current user
router.get('/places', authenticate, requireRole('owner'), ownerController.getOwnerPlaces);

// Add a menu item
router.post('/places/:placeId/menu', authenticate, requireRole('owner'), ownerController.addMenuItem);

// Add a bundle
router.post('/places/:placeId/bundles', authenticate, requireRole('owner'), ownerController.addBundle);

module.exports = router;
