const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register } = require('../controllers/authController');

// Register (local) - POST /api/auth/register
router.post('/register', register);

// Login (local) - POST /api/auth/login
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name, phone: req.user.phone },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );
  res.json({ token });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL || '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name, phone: req.user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?token=${token}`);
  }
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.post('/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: process.env.FRONTEND_URL || '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name, phone: req.user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?token=${token}`);
  }
);

module.exports = router;