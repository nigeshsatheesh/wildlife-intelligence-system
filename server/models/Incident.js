const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  incidentType: {
    type: String,
    enum: ['Poaching Threat', 'Human-Wildlife Conflict', 'Illegal Encroachment', 'Device Tampering', 'Wildfire Risk', 'Other'],
    default: 'Human-Wildlife Conflict'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Resolved', 'Escalated'],
    default: 'Open'
  },
  monitoringSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringSite'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eventDate: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Incident', incidentSchema);
