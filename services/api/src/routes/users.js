// services/api/src/routes/users.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.js');
const validate = require('../middleware/validate');
const { updateProfileSchema, updateSettingsSchema } = require('../middleware/validationSchemas');
const userController = require('../controllers/userController.js');

// Route to get current user profile
router.get('/profile', authenticate, userController.getProfile);

// Route to update profile (name, phone)
router.put(
  '/profile', 
  authenticate, 
  validate(updateProfileSchema), 
  userController.updateProfile
);

// Route to update settings (notifications)
router.put(
  '/settings', 
  authenticate, 
  validate(updateSettingsSchema), 
  userController.updateSettings
);

module.exports = router;