// src/config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const db = require('./db');
const bcrypt = require('bcrypt');

/*
  Local strategy (email/password)
*/
passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const res = await db.query('SELECT id,email,password,role FROM users WHERE email=$1', [email]);
      if (!res.rows.length) return done(null, false, { message: 'User not found' });
      const user = res.rows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return done(null, false, { message: 'Invalid password' });
      return done(null, user);
    } catch (err) { return done(err); }
  }
));

/*
  Google OAuth 2.0
*/
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    let r = await db.query('SELECT * FROM users WHERE provider=$1 AND provider_id=$2', ['google', googleId]);
    let user;
    if (r.rows.length === 0) {
      const ins = await db.query(
        'INSERT INTO users (email, role, provider, provider_id) VALUES ($1,$2,$3,$4) RETURNING id,email,role',
        [email, 'customer', 'google', googleId]
      );
      user = ins.rows[0];
    } else {
      user = r.rows[0];
    }
    return done(null, user);
  } catch (err) { return done(err); }
}));

/*
  Apple Sign-In (passport-apple)
  Requirements (env):
    APPLE_CLIENT_ID (Service ID)
    APPLE_TEAM_ID
    APPLE_KEY_ID
    APPLE_PRIVATE_KEY (PEM string)
    APPLE_CALLBACK_URL
*/
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: process.env.APPLE_CALLBACK_URL || 'https://localhost:4000/auth/apple/callback',
  keyID: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  passReqToCallback: false,
  scope: ['name', 'email']
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    // passport-apple sometimes provides limited profile info;
    // the stable identifier is in idToken.sub or profile.id
    const appleId = (profile && profile.id) || (idToken && idToken.sub) || null;
    const email = (profile && profile.email) || (idToken && idToken.email) || null;

    if (!appleId) {
      return done(new Error('No Apple ID returned'));
    }

    // Find existing user by provider/provider_id
    let r = await db.query('SELECT * FROM users WHERE provider=$1 AND provider_id=$2', ['apple', appleId]);
    let user;
    if (r.rows.length === 0) {
      // If Apple did not provide an email, create an account with null email (owner/customer can complete later)
      const ins = await db.query(
        'INSERT INTO users (email, role, provider, provider_id) VALUES ($1,$2,$3,$4) RETURNING id,email,role',
        [email, 'customer', 'apple', appleId]
      );
      user = ins.rows[0];
    } else {
      user = r.rows[0];
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Export passport instance
module.exports = passport;
