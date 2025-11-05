// services/api/src/routes/auth.js
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, verifyEmail, requestPasswordReset, resetPassword } = require('../controllers/authController');

// Register (local)
router.post('/register', register);

// Login (local)
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = jwt.sign(
    { 
      id: req.user.id, 
      email: req.user.email, 
      role: req.user.role, 
      name: req.user.name, 
      phone: req.user.phone, 
      createdAt: req.user.created_at,
      status: req.user.status // <<< ADDED STATUS TO LOGIN TOKEN
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token });
});

// Request Password Reset
router.post('/request-password-reset', requestPasswordReset);
// Reset Password
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL || '/' }),
  (req, res) => {
    const token = jwt.sign(
      { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role, 
        name: req.user.name, 
        phone: req.user.phone, 
        createdAt: req.user.created_at,
        status: req.user.status // <<< ADDED STATUS TO GOOGLE TOKEN
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    // Redirect to success page to handle token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?token=${token}`);
  }
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.post('/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: process.env.FRONTEND_URL || '/' }),
  (req, res) => {
    const token = jwt.sign(
      { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role, 
        name: req.user.name, 
        phone: req.user.phone, 
        createdAt: req.user.created_at,
        status: req.user.status // <<< ADDED STATUS TO APPLE TOKEN
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
     // Redirect to success page to handle token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?token=${token}`);
  }
);

module.exports = router;