const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService'); // Import email service
const { Op } = require('sequelize'); // Import Op
// Handles user registration.
async function register(req, res) {
  const { name, email, password, role = 'customer' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role, provider: 'local' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, createdAt: user.createdAt }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ token });

  } catch (err) {
    console.error('Registration Error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
}
// Request Password Reset
async function requestPasswordReset(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const user = await User.findOne({ where: { email, provider: 'local' } }); // Only allow for local accounts

    if (!user) {
      // Don't reveal if the user exists or not for security
      console.log(`Password reset requested for non-existent or non-local email: ${email}`);
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // Store hashed token

    // Set token expiry (e.g., 1 hour from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expires;
    await user.save();

    // Create the reset link for the email (adjust frontend URL as needed)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send the email
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

// Reset Password
async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by the hashed token and check expiry
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: new Date() }, // Check if token hasn't expired
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Optional: Send password change confirmation email
    try {
         await sendEmail(user.email, 'passwordResetConfirmation', { name: user.name });
    } catch (emailError) {
         console.error(`Failed to send password change confirmation email to ${user.email}:`, emailError);
    }


    // Log the user in automatically by sending a new JWT token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, createdAt: user.createdAt },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Password has been reset successfully.', token: jwtToken }); // Send token back

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

