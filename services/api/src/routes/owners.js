const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ownerController = require('../controllers/ownerController');
const upload = require('../middleware/upload');

// Create a new place
router.post('/places', authenticate, requireRole('owner'), upload.array('images', 5), ownerController.createPlace);

// NEW ROUTE: Update an existing place
router.put('/places/:placeId', authenticate, requireRole('owner'), upload.array('images', 5), ownerController.updateOwnerPlace);

// Get all places owned by current user
router.get('/places', authenticate, requireRole('owner'), ownerController.getOwnerPlaces);

// Get a single place owned by the current user
router.get('/places/:placeId', authenticate, requireRole('owner'), ownerController.getOwnerPlaceById);

// Add a menu item
router.post('/places/:placeId/menu', authenticate, requireRole('owner'), ownerController.addMenuItem);

// Add a bundle
router.post('/places/:placeId/bundles', authenticate, requireRole('owner'), ownerController.addBundle);

module.exports = router;