// services/api/src/controllers/paymentController.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { Booking, User } = require('../models');
const { sendEmail } = require('../utils/emailService');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'cad' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects integers (cents)
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user ? req.user.id : 'guest',
        integration_check: 'accept_a_payment',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Stripe Intent Error:', err);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
};

// --- SECURITY: Webhook Signature Verification ---
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // 1. Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Requires express.json({ verify: ... }) in app.js setup!
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
        // Update booking status if you stored paymentIntent.id in your DB
        // await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed');
        break;

      default:
        // Create booking logic usually happens before payment, 
        // or handles 'checkout.session.completed'
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Helper to enable raw body in index.js (Instructions below)