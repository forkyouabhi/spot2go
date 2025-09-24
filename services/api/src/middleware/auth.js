// services/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No token provided' });
  
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token is malformatted' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// UPDATED: This function now accepts an array of roles for more flexibility.
const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
  }
  next();
};

module.exports = { authenticate, requireRole };

