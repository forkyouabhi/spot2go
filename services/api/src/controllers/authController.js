// src/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(req, res) {
  const { email, password, role = 'customer' } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const r = await db.query(
      'INSERT INTO users (email,password,role,provider) VALUES ($1,$2,$3,$4) RETURNING id,email,role',
      [email, hashed, role, 'local']
    );
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

module.exports = { register };
