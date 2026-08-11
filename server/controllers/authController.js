const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'ecoguard_wildlife_secret_key_2026';

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (req.isMongoConnected) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });

      const user = await User.create({ name, email, password, role: role || 'Researcher' });
      const token = generateToken(user._id, user.role);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      const newUser = { _id: 'u_' + Date.now(), name, email, role: role || 'Researcher' };
      req.memoryDb.users.push(newUser);
      const token = generateToken(newUser._id, newUser.role);
      res.status(201).json({ ...newUser, token });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (req.isMongoConnected) {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = generateToken(user._id, user.role);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      const user = req.memoryDb.users.find(u => u.email === email) || req.memoryDb.users[0];
      const token = generateToken(user._id, user.role);
      res.json({ ...user, token });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
