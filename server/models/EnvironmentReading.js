const mongoose = require('mongoose');

const environmentReadingSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringSite',
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  rainfall: {
    type: Number,
    default: 0
  },
  humidity: {
    type: Number,
    default: 50
  },
  readingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EnvironmentReading', environmentReadingSchema);
