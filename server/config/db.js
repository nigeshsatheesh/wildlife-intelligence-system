const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/wildlife_intelligence';
    await mongoose.connect(connStr);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('⚠️ MongoDB connection failed:', error.message);
    console.log('ℹ️ Running in fallback memory mode until MongoDB Atlas / local instance connects.');
    try { await mongoose.disconnect(); } catch (e) {}
    return false;
  }
};

module.exports = connectDB;
