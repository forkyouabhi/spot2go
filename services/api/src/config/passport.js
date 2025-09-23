const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Local strategy (email/password)
passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      if (!user.password) { // User signed up with OAuth
        return done(null, false, { message: 'Please log in with your social account.' });
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    } catch (err) { return done(err); }
  }
));

// Google OAuth 2.0
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;

    const [user] = await User.findOrCreate({
      where: { provider: 'google', providerId: googleId },
      defaults: {
        email,
        role: 'customer',
        provider: 'google',
        providerId: googleId,
      }
    });

    return done(null, user);
  } catch (err) { return done(err); }
}));

// Apple Sign-In
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:4000/auth/apple/callback',
  keyID: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  scope: ['name', 'email']
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    const appleId = profile.id || idToken.sub;
    const email = profile.email || idToken.email;

    if (!appleId) {
      return done(new Error('No Apple ID returned'));
    }
    
    const [user] = await User.findOrCreate({
        where: { provider: 'apple', providerId: appleId },
        defaults: {
            email,
            role: 'customer',
            provider: 'apple',
            providerId: appleId
        }
    });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
