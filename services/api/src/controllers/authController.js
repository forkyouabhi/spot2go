// services/api/src/controllers/authController.js

const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Handles user registration.
async function register(req, res) {
  // Accept 'role' from the request body, defaulting to 'customer'
  const { name, email, password, role = 'customer' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required fields.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // Use the role from the request
      provider: 'local',
    });

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

module.exports = { 
  register 
};