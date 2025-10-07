const { Router } = require('express');
const authRoutes = require('./auth');
const notificationRoutes = require('./notification');
const ownerRoutes = require('./owners');
const customerRoutes = require('./customers');
const paymentRoutes = require('./payments');
const userRoutes = require('./users');
const adminRoutes = require('./admin');
const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/owners', ownerRoutes);
router.use('/api/customers', customerRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/users', userRoutes);
router.use('/api/admin', adminRoutes);

module.exports = router;

