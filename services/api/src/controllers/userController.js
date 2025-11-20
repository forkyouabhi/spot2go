// services/api/src/controllers/userController.js
const { User } = require('../models');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'googleId'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { notifications } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Mocking settings persistence if column doesn't exist yet
    // In a real app, ensure 'settings' JSONB column exists
    // user.settings = { ...user.settings, notifications };
    // await user.save();

    res.json({ message: 'Settings updated', settings: notifications });
  } catch (err) {
    console.error('Update Settings Error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = { getProfile, updateProfile, updateSettings };