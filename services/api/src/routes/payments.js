const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Create Stripe PaymentIntent
router.post('/create-intent', authenticate, requireRole('customer'), paymentController.createPaymentIntent);

// Stripe webhook (must be raw body!)
const express = require('express');
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
