// src/controllers/paymentController.js
exports.createPaymentIntent = (req, res) => {
  const { amount, currency } = req.body;
  if (!amount || !currency) {
    return res.status(400).json({ error: 'Amount and currency required' });
  }
  // Mock payment intent
  const clientSecret = `mock_secret_${Date.now()}`;
  res.json({ clientSecret });
};

exports.webhook = (req, res) => {
  // Mock webhook handler
  console.log('Webhook received:', req.body);
  res.json({ received: true });
};
