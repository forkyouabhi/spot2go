// services/api/src/routes/auth.js
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { 
  register, 
  login, // <--- Import the login function
  verifyEmail, 
  requestPasswordReset, 
  resetPassword, 
  resendVerificationOtp 
} = require('../controllers/authController');

// Register
router.post('/register', register);

// --- CRITICAL FIX: Use the controller login that sets cookies ---
// Do NOT use passport.authenticate('local') here anymore
router.post('/login', login); 

// Other Routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendVerificationOtp);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // Manually set cookie for OAuth success
    const token = jwt.sign(
      { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role, 
        name: req.user.name, 
        phone: req.user.phone,
        status: req.user.status 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?token=cookie_set`);
  }
);

// Apple OAuth (Skipping detailed implementation for brevity, follow Google pattern)
router.get('/apple', passport.authenticate('apple'));
router.post('/apple/callback', passport.authenticate('apple', { session: false, failureRedirect: '/' }), (req, res) => {
   // ... similar logic to google ...
   res.redirect('/');
});

module.exports = router;