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
      // User exists but isn't verified. Update them with new details.
      user = existingUser;
      await user.update({
        name,
        password,
        role,
        phone,
        businessLocation,
        status,
        emailVerificationToken: otp, // Save the plain OTP
        emailVerificationExpires: expires,
      });
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        businessLocation,
        status,
        emailVerified: false,
        emailVerificationToken: otp,
        emailVerificationExpires: expires,
      });
    }

    if (role === 'owner') {
      try {
        await sendEmail(process.env.ADMIN_EMAIL || 'admin@spot2go.com', 'newOwnerForVerification', {
          name,
          email,
          phone,
          businessLocation,
          adminDashboardLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard`
        });
      } catch (emailError) {
        console.error("Failed to send new owner email to admin:", emailError);
      }
    }

    try {
      await sendEmail(email, 'emailVerificationOTP', { name, otp });
      res.status(201).json({ message: 'Registration successful. Please check your email for a verification code.', email: user.email });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      res.status(500).json({ error: 'Failed to send verification email. Please try registering again.' });
    }

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    if (user.emailVerificationToken !== otp) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Success! Verify the user
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Log the user in by issuing a new token
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, status: user.status, createdAt: user.created_at },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Email verified successfully! Logging you in...',
      token,
      user: { id: user.id, name: user.name, role: user.role, status: user.status, createdAt: user.created_at },
    });

  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'An error occurred during email verification.' });
  }
};

// --- NEW FUNCTION TO RESEND OTP ---
const resendVerificationOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    // Generate a new OTP and expiry
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update the user
    user.emailVerificationToken = otp;
    user.emailVerificationExpires = expires;
    await user.save();

    // Resend the email
    await sendEmail(email, 'emailVerificationOTP', { name: user.name, otp });

    res.json({ message: 'A new verification code has been sent to your email.' });

  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ error: 'An error occurred while resending the code.' });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No user found with that email address.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendEmail(user.email, 'passwordResetRequest', {
      name: user.name,
      resetLink: resetLink,
    });

    res.json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (err) {
    console.error('Request password reset error:', err);
    res.status(500).json({ error: 'Error requesting password reset.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: Date.now() }, // <-- This now works
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    user.password = newPassword; // The hook will hash it
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

     await sendEmail(user.email, 'passwordResetConfirmation', {
      name: user.name,
    });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Error resetting password.' });
  }
};

module.exports = {
  register,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationOtp, // <-- EXPORT THE NEW FUNCTION
};