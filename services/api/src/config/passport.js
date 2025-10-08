const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Local strategy (email/password) - No changes needed here
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

// CORRECTED Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;

    // 1. Find a user with this Google ID
    let user = await User.findOne({ where: { provider: 'google', providerId: googleId } });
    if (user) {
      return done(null, user);
    }
    
    // 2. If not, find by email to link accounts
    if (email) {
      user = await User.findOne({ where: { email: email } });
      if (user) {
        // User exists, so link the Google account
        user.provider = 'google';
        user.providerId = googleId;
        await user.save();
        return done(null, user);
      }
    }
    
    // 3. If no user found, create a new one
    const newUser = await User.create({
      name,
      email,
      role: 'customer',
      provider: 'google',
      providerId: googleId,
    });
    return done(null, newUser);

  } catch (err) { return done(err); }
}));

// CORRECTED Apple Sign-In Strategy
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
    // Construct name, providing a fallback if not given
    const name = profile.name ? `${profile.name.firstName} ${profile.name.lastName}`.trim() : (email ? email.split('@')[0] : `User ${appleId.slice(0, 5)}`);

    if (!appleId) {
      return done(new Error('No Apple ID returned'));
    }
    
    // 1. Find a user with this Apple ID
    let user = await User.findOne({ where: { provider: 'apple', providerId: appleId } });
    if (user) {
        return done(null, user);
    }

    // 2. If not, find by email (if available) to link accounts
    if (email) {
        user = await User.findOne({ where: { email: email } });
        if (user) {
            // User exists, so link the Apple account
            user.provider = 'apple';
            user.providerId = appleId;
            await user.save();
            return done(null, user);
        }
    }

    // 3. If no user found, create a new one.
    const newUser = await User.create({
        name,
        email,
        role: 'customer',
        provider: 'apple',
        providerId: appleId
    });
    return done(null, newUser);
    
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;