// services/api/src/controllers/authController.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// --- Helpers ---
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

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
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone
  };
};

// --- Auth Functions ---

const register = async (req, res) => {
  const { name, email, password, role, phone, businessLocation } = req.body;
  if (role && !['customer', 'owner'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.emailVerified) return res.status(409).json({ error: 'Email is already in use' });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const status = role === 'owner' ? 'pending_verification' : 'active';

    let user;
    if (existingUser && !existingUser.emailVerified) {
      user = existingUser;
      await user.update({ name, password, role, phone, businessLocation, status, emailVerificationToken: otp, emailVerificationExpires: expires });
    } else {
      user = await User.create({ name, email, password, role, phone, businessLocation, status, emailVerified: false, emailVerificationToken: otp, emailVerificationExpires: expires });
    }

    if (role === 'owner') {
      sendEmail(process.env.ADMIN_EMAIL || 'info@spot2go.com', 'newOwnerForVerification', {
         name, email, phone, businessLocation, adminDashboardLink: `${process.env.FRONTEND_URL}/admin/dashboard`
      }).catch(console.error);
    }
    sendEmail(email, 'emailVerificationOTP', { name, otp }).catch(console.error);

    res.status(201).json({ message: 'Registration successful.', email: user.email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.emailVerified) {
       return res.status(401).json({ error: 'Email not verified.', needsVerification: true, email: user.email });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Account rejected. Contact support.' });
    }

    const userData = setAuthCookie(res, user);
    res.json({ message: 'Login successful', user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
};

const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();
    
    // Optional: Send confirmation email
    sendEmail(user.email, 'passwordResetConfirmation', { name: user.name }).catch(console.error);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || user.emailVerificationToken !== otp || user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    const userData = setAuthCookie(res, user);
    res.json({ message: 'Verified!', user: userData });
  } catch (err) { res.status(500).json({ error: 'Verification failed' }); }
};

const resendVerificationOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const otp = generateOTP();
    user.emailVerificationToken = otp;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendEmail(email, 'emailVerificationOTP', { name: user.name, otp }).catch(console.error);
    res.json({ message: 'OTP Resent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

// --- Password Reset Logic ---

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    // Security Best Practice: Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate a secure random token (hex string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = tokenExpires;
    await user.save();

    // Construct Reset Link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?resetToken=${resetToken}`;

    // FIX: Used 'passwordResetRequest' to match emailService.js
    // FIX: Passed 'resetLink' property to match email template destructuring
    await sendEmail(user.email, 'passwordResetRequest', { 
      name: user.name,
      resetLink: resetLink 
    });

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Request Password Reset Error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    // Find user with valid, non-expired token
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: new Date() } // Expires > Now
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token is invalid or has expired.' });
    }

    // Update password (hook will hash it)
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Optional: Send confirmation email that password changed
    sendEmail(user.email, 'passwordResetConfirmation', { name: user.name }).catch(console.error);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationOtp, 
};