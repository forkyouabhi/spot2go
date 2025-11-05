// services/api/src/config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { sendEmail } = require('../utils/emailService'); // <-- IMPORTED
const crypto = require('crypto'); // <-- IMPORTED

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Local strategy (email/password)
passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      // --- FIX: ADDED EMAIL VERIFICATION CHECK ---
      if (!user.emailVerified) {
        // Resend OTP in case they lost it
        const otp = generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.emailVerificationToken = otp;
        user.emailVerificationExpires = expires;
        await user.save();
        
        try {
          await sendEmail(user.email, 'emailVerificationOTP', { name: user.name, otp });
        } catch (emailError) {
          console.error("Failed to resend OTP on login:", emailError);
          // Don't fail the login, just inform the user
        }
        
        return done(null, false, { 
          message: 'Email not verified. We have sent you a new verification code.',
          email: user.email,
          needsVerification: true,
        });
      }
      // --- END FIX ---

      if (!user.password) { // User signed up with OAuth
        return done(null, false, { message: 'Please log in with your social account.' });
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return done(null, false, { message: 'Invalid password' });
      }
      // ADDED: Check for pending/rejected status on login
      if (user.status === 'pending_verification') {
         return done(null, false, { message: 'Your account is pending verification.' });
      }
      if (user.status === 'rejected') {
         return done(null, false, { message: 'Your account has been rejected. Please contact support.' });
      }
      
      return done(null, user);
    } catch (err) { return done(err); }
  }
));

// Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;

    let user = await User.findOne({ where: { provider: 'google', providerId: googleId } });
    if (user) {
      return done(null, user);
    }
    
    if (email) {
      user = await User.findOne({ where: { email: email } });
      if (user) {
        user.provider = 'google';
        user.providerId = googleId;
        // User.status would already be set, don't override it
        await user.save();
        return done(null, user);
      }
    }
    
    const newUser = await User.create({
      name,
      email,
      role: 'customer',
      provider: 'google',
      providerId: googleId,
      status: 'active', // <<< Explicitly set status to 'active' for new social users
      emailVerified: true, // <-- Automatically verify social signups
    });
    return done(null, newUser);

  } catch (err) { return done(err); }
}));

// Apple Sign-In Strategy
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:4000/api/auth/apple/callback',
  keyID: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  scope: ['name', 'email']
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    const appleId = profile.id || idToken.sub;
    const email = profile.email || idToken.email;
    const name = profile.name ? `${profile.name.firstName} ${profile.name.lastName}`.trim() : (email ? email.split('@')[0] : `User ${appleId.slice(0, 5)}`);

    if (!appleId) {
      return done(new Error('No Apple ID returned'));
    }
    
    let user = await User.findOne({ where: { provider: 'apple', providerId: appleId } });
    if (user) {
        return done(null, user);
    }

    if (email) {
        user = await User.findOne({ where: { email: email } });
        if (user) {
            user.provider = 'apple';
            user.providerId = appleId;
            // User.status would already be set, don't override it
            await user.save();
            return done(null, user);
        }
    }

    const newUser = await User.create({
        name,
        email,
        role: 'customer',
        provider: 'apple',
        providerId: appleId,
        status: 'active', // <<< Explicitly set status to 'active' for new social users
        emailVerified: true, // <-- Automatically verify social signups
    });
    return done(null, newUser);
    
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;