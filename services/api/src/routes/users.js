const router = require('express').Router();
const { authenticate } = require('../middleware/auth.js');
const userController = require('../controllers/userController.js');

// Route to update a user's profile information (name, email, phone)
// The user can only update their own profile.
router.put('/:userId', authenticate, userController.updateUserProfile);

// Route to change a user's password
// This is a separate, dedicated route for security.
router.put('/:userId/password', authenticate, userController.changePassword);

module.exports = router;
