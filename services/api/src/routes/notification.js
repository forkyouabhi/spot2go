const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { saveDevice } = require('../controllers/notificationController');

// Save FCM token
router.post('/devices', authenticate, saveDevice);

module.exports = router;
