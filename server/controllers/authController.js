const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

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

exports.me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json(users);
    }

    const users = req.memoryDb.users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt || new Date().toISOString()
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { name, organization, avatarColor } = req.body;

    if (req.isMongoConnected) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (name) user.name = name;
      await user.save();

      return res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, organization: organization || 'EcoGuard Org', avatarColor: avatarColor || '#113829' });
    } else {
      const user = req.memoryDb.users.find(u => u._id === req.user._id || u.id === req.user._id) || req.memoryDb.users[0];
      if (name) user.name = name;
      user.organization = organization || 'EcoGuard Org';
      user.avatarColor = avatarColor || '#113829';
      return res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    if (req.isMongoConnected) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (currentPassword && !(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ message: 'Current password incorrect' });
      }
      user.password = newPassword;
      await user.save();
      return res.json({ message: 'Password updated successfully' });
    } else {
      return res.json({ message: 'Password updated successfully (in-memory mode)' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
