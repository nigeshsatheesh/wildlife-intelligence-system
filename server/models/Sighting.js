const mongoose = require('mongoose');

const sightingSchema = new mongoose.Schema({
  species: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Species',
    required: true
  },
  monitoringSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringSite',
    required: true
  },
  observedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String
  },
  classifierPrediction: {
    type: String
  },
  classifierConfidence: {
    type: Number,
    max: 1
  },
  verified: {
    type: Boolean,
    default: false  // researcher hasn't manually confirmed the AI's guess yet
  },
  individualCount: {
    type: Number,
    default: 1  // how many animals seen in this sighting
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  locality: {
    type: String  // e.g. "Bandipur National Park" — matches GBIF's 'locality' field
  },
  country: {
    type: String
  },
  eventDate: {
    type: Date,
    required: true  // when the sighting actually happened (not when it was logged)
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now  // when this record was entered into your system
  }
});

module.exports = mongoose.model('Sighting', sightingSchema);