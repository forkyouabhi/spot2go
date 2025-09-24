const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Handles user registration.
async function register(req, res) {
  // UPDATED: Now correctly accepts 'name' from the request body.
  const { name, email, password, role = 'customer' } = req.body;

  // UPDATED: Validation now includes the 'name' field.
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required fields.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // UPDATED: Creates the user with the 'name' field, matching the User model.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      provider: 'local',
    });

    // UPDATED: Includes the user's name in the JWT payload.
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, created_at: user.created_at, phone: req.user.phone }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // It's good practice to set an expiration
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

// Ensure the function is correctly exported
module.exports = { 
  register 
};