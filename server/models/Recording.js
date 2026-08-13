const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  species: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Species'
    // not required: many acoustic events (e.g. general animal/bird call) won't map to a catalogued species
  },
  monitoringSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringSite',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  detectedEvents: [
    {
      label: { type: String },        // raw AudioSet class label from YAMNet, e.g. "Bird vocalization, bird call, bird song"
      confidence: { type: Number },   // 0-1
      category: { type: String }      // normalized bucket: Bird Call / Mammal Vocalization / Amphibian Call / Insect Sound / Environmental Noise
    }
  ],
  topLabel: {
    type: String  // best single detected event label, for quick display/filtering
  },
  topConfidence: {
    type: Number,
    max: 1
  },
  verified: {
    type: Boolean,
    default: false
  },
  durationSeconds: {
    type: Number
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  eventDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recording', recordingSchema);