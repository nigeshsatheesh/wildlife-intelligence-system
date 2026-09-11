const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI;
    if (!connStr) {
      throw new Error('MONGO_URI is required');
    }
    await mongoose.connect(connStr);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('Running in fallback memory mode until MongoDB Atlas / local instance connects.');
    try { await mongoose.disconnect(); } catch (e) {}
    return false;
  }
};

module.exports = connectDB;
