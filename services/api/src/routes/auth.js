// services/api/src/routes/auth.js
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Added missing import for Google callback
const validate = require('../middleware/validate');
const { changePasswordSchema } = require('../middleware/validationSchemas');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// --- Core Auth ---
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', authController.resendVerificationOtp);

// --- Password Management (FIXED: Added missing routes) ---
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// --- Authenticated Routes ---
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

// --- OAuth (Google) ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    try {
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
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/success?token=cookie_set`);
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

module.exports = router;