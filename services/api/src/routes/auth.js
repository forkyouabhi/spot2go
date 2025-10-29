const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
// FIX: Import all necessary functions from the controller
const { register, requestPasswordReset, resetPassword } = require('../controllers/authController');

// Register (local)
router.post('/register', register);

// Login (local)
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name, phone: req.user.phone, createdAt: req.user.created_at },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token });
});

// Request Password Reset - POST /api/auth/request-password-reset
router.post('/request-password-reset', requestPasswordReset);
// Reset Password - POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL || '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name, phone: req.user.phone, createdAt: req.user.created_at },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    // Redirect with token in query params for the frontend to handle
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${token}`);
  }
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.post('/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: process.env.FRONTEND_URL || '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name, phone: req.user.phone, createdAt: req.user.created_at },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
     // Redirect with token in query params for the frontend to handle
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${token}`);
  }
);

module.exports = router;

