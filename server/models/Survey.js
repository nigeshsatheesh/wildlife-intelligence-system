const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  surveyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringSite',
    required: true
  },
  protectedArea: {
    type: String
  },
  habitatType: {
    type: String,
    default: 'Forest'
  },
  surveyDate: {
    type: Date,
    default: Date.now
  },
  monitoringDevice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'active'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Survey', surveySchema);
