const { Router } = require('express');
const authRoutes = require('./auth');
const notificationRoutes = require('./notification');
const ownerRoutes = require('./owners');
const customerRoutes = require('./customers');
const paymentRoutes = require('./payments');

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/owners', ownerRoutes);
router.use('/api/customers', customerRoutes);
router.use('/api/payments', paymentRoutes);

module.exports = router;
