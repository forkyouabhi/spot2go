// services/api/src/routes/auth.js
const router = require('express').Router();
const passport = require('passport');
const validate = require('../middleware/validate'); // Ensure you created validate.js previously
const { changePasswordSchema } = require('../middleware/validationSchemas');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout); // New
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', authController.resendVerificationOtp);

// Secure Change Password
router.post(
  '/change-password', 
  authenticate, // Use our custom middleware or passport
  validate(changePasswordSchema), 
  authController.changePassword
);
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