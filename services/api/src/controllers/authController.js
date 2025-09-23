const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(req, res) {
  const { email, password, role = 'customer' } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      provider: 'local',
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Email already in use.' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
}

module.exports = { register };
