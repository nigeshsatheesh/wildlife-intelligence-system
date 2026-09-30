const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceCode: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['camera_trap', 'audio_sensor'],
    default: 'camera_trap'
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringSite'
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'offline'],
    default: 'active'
  },
  batteryLevel: {
    type: Number,
    default: 100
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
