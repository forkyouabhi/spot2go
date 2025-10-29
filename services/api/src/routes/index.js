// services/api/src/routes/index.js
const { Router } = require('express');
const authRoutes = require('./auth');
const notificationRoutes = require('./notification');
const ownerRoutes = require('./owners');
const customerRoutes = require('./customers');
const paymentRoutes = require('./payments');
const userRoutes = require('./users');
const adminRoutes = require('./admin'); // This was added
const { authenticate } = require('../middleware/auth.js');
const { generateCalendarFile } = require('../controllers/bookingController');

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/owners', ownerRoutes);
router.use('/customers', customerRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes); // This was added

// New route for generating calendar files
router.get('/bookings/:bookingId/calendar', authenticate, generateCalendarFile);

module.exports = router;