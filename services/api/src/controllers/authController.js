// services/api/src/controllers/authController.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto'); 
const { Op } = require('sequelize');

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// --- NEW: Helper to set HttpOnly Cookie ---
const setAuthCookie = (res, user) => {
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name, 
      phone: user.phone, 
      createdAt: user.created_at,
      status: user.status
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true, // Secure: JavaScript cannot access this
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Relaxed for localhost dev
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  // Return user data (but not the token string, as it's in the cookie)
  return { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    status: user.status,
    phone: user.phone
  };
};

const register = async (req, res) => {
  const { name, email, password, role, phone, businessLocation } = req.body;
  
  if (role && !['customer', 'owner'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser && existingUser.emailVerified) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const status = role === 'owner' ? 'pending_verification' : 'active';

    let user;
    if (existingUser && !existingUser.emailVerified) {
      user = existingUser;
      await user.update({
        name, password, role, phone, businessLocation, status,
        emailVerificationToken: otp, emailVerificationExpires: expires,
      });
    } else {
      user = await User.create({
        name, email, password, role, phone, businessLocation, status,
        emailVerified: false, emailVerificationToken: otp, emailVerificationExpires: expires,
      });
    }

    // Email sending logic (kept same as before)
    if (role === 'owner') {
      try {
        await sendEmail(process.env.ADMIN_EMAIL || 'admin@spot2go.com', 'newOwnerForVerification', {
          name, email, phone, businessLocation,
          adminDashboardLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard`
        });
      } catch (e) { console.error("Admin email failed", e); }
    }

    try {
      await sendEmail(email, 'emailVerificationOTP', { name, otp });
      // We return the email so the frontend can redirect correctly
      res.status(201).json({ message: 'Registration successful.', email: user.email });
    } catch (e) {
      res.status(201).json({ message: 'Registration successful (Email failed).', email: user.email });
    }

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};

// --- UPDATED: verifyEmail sets the cookie ---
const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email is already verified.' });
    if (user.emailVerificationToken !== otp) return res.status(400).json({ error: 'Invalid verification code.' });
    if (user.emailVerificationExpires < new Date()) return res.status(400).json({ error: 'Verification code has expired.' });

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // SET COOKIE HERE
    const userData = setAuthCookie(res, user);

    res.json({ message: 'Email verified successfully!', user: userData });

  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'An error occurred during verification.' });
  }
};

// --- NEW: Login function manually implemented to support cookies ---
// (Passport logic can be bypassed or adapted, but a direct controller is often cleaner for API-based auth)
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (!user.emailVerified) {
         return res.status(401).json({ 
            error: 'Email not verified.', 
            needsVerification: true, 
            email: user.email 
         });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({ error: 'Account rejected. Contact support.' });
      }

      // SET COOKIE HERE
      const userData = setAuthCookie(res, user);
      
      res.json({ message: 'Login successful', user: userData });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed.' });
    }
};

const resendVerificationOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email is already verified.' });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); 

    user.emailVerificationToken = otp;
    user.emailVerificationExpires = expires;
    await user.save();

    if (process.env.NODE_ENV !== 'production') {
       console.log(`RESEND OTP for ${email}: ${otp}`);
    }

    await sendEmail(email, 'emailVerificationOTP', { name: user.name, otp });
    res.json({ message: 'New code sent.' });

  } catch (err) {
    res.status(500).json({ error: 'Error resending OTP.' });
  }
};

const requestPasswordReset = async (req, res) => { /* ... (Keep existing logic) ... */ };
const resetPassword = async (req, res) => { /* ... (Keep existing logic) ... */ };

module.exports = {
  register,
  login, // Export the new login
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationOtp, 
};