const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['endangered_sighting', 'population_decline', 'habitat_degradation', 'device_offline', 'conservation'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedSpecies: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Species'
  },
  relatedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringSite'
  },
  relatedSighting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sighting'
  },
  roleTargets: [{
    type: String
  }],
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
