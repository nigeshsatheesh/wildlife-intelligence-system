const mongoose = require('mongoose');

const monitoringSiteSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true
  },
  siteCode: {
    type: String,
    required: true,
    unique: true
  },
  habitatType: {
    type: String,
    enum: ['Forest', 'Grassland', 'Wetland', 'Desert', 'Mountain', 'Other'],
    default: 'Forest'
  },
  protectedArea: {
    type: String 
  },
  // Optional. Needed to compute real population DENSITY (individuals / km²).
  // If left unset, density is reported as unavailable for that site rather
  // than estimated or faked.
  areaKm2: {
    type: Number
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  monitoringDevice: {
    type: String,
    enum: ['Camera Trap', 'Manual Observation', 'Other'],
    default: 'Camera Trap'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MonitoringSite', monitoringSiteSchema);