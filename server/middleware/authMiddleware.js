const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'ecoguard_wildlife_secret_key_2026';

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'Not authorized, no token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (req.isMongoConnected) {
      req.user = await User.findById(decoded.userId || decoded.id).select('-password');
    } else {
      req.user = { _id: decoded.userId || 'u1', name: 'Researcher', role: decoded.role || 'Researcher' };
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: `Access denied for role: ${req.user ? req.user.role : 'Guest'}` });
};

module.exports = { protect, authorize };
