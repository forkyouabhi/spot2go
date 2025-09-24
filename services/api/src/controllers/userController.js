const { User } = require('../models');
const bcrypt = require('bcrypt');

// Controller to update basic user profile information
const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone } = req.body;

  // Security check: Ensure the authenticated user is the one they are trying to update
  if (req.user.id !== parseInt(userId, 10)) {
    return res.status(403).json({ error: 'Forbidden: You can only update your own profile.' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user's fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone; // Assuming you add a 'phone' column to your User model

    await user.save();

    // Return the updated user data (excluding password)
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);

  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email address is already in use.' });
    }
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// Controller to handle password changes
const changePassword = async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (req.user.id !== parseInt(userId, 10)) {
        return res.status(403).json({ error: 'Forbidden: You can only change your own password.' });
    }
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        // Check if the user has a local password (they might have signed up via OAuth)
        if (!user.password) {
            return res.status(400).json({ error: 'Cannot change password for an account created with Google or Apple.' });
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect current password.' });
        }

        // Hash and save the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to change password.' });
    }
};


module.exports = {
  updateUserProfile,
  changePassword,
};

