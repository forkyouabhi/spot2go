// services/api/src/controllers/authController.js
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

// Handles user registration, setting status based on role.
async function register(req, res) {
  // role defaults to 'customer' unless explicitly provided
  const { name, email, password, role = 'customer' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Determine initial status based on role
  const initialStatus = role === 'owner' ? 'pending_verification' : 'active';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        status: initialStatus, // Set status here
        provider: 'local'
    });

    // Notify admin if a new owner needs verification
    if (initialStatus === 'pending_verification') {
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await sendEmail(adminEmail, 'newOwnerForVerification', {
            name: user.name,
            email: user.email,
            adminDashboardLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard`
          });
        } else {
          console.warn('ADMIN_EMAIL not set. Skipping new owner notification.');
        }
      } catch (emailError) {
        console.error(`Failed to send new owner notification email to admin:`, emailError);
      }
    }

    // Always issue a token, but the frontend will check the status
    const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status, // Include status in the token payload
        createdAt: user.createdAt
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send back the token.
    // If pending, the frontend (AuthContext) will still log them in,
    // but the owner/dashboard will show a "pending" message.
    res.status(201).json({ token });

  } catch (err) {
    console.error('Registration Error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
}

// --- requestPasswordReset and resetPassword functions remain the same ---
async function requestPasswordReset(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const user = await User.findOne({ where: { email, provider: 'local' } });

    if (!user) {
      console.log(`Password reset requested for non-existent or non-local email: ${email}`);
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expires;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendEmail(user.email, 'passwordResetRequest', {
      name: user.name,
      resetLink: resetLink,
    });

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (err) {
    console.error('Error requesting password reset:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    try {
         await sendEmail(user.email, 'passwordResetConfirmation', { name: user.name });
    } catch (emailError) {
         console.error(`Failed to send password change confirmation email to ${user.email}:`, emailError);
    }

    // Also include status in the new token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status, createdAt: user.createdAt },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Password has been reset successfully.', token: jwtToken });

  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
}


module.exports = {
  register,
  requestPasswordReset,
  resetPassword,
};