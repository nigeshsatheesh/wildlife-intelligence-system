const mongoose = require('mongoose');

const speciesSchema = new mongoose.Schema({
  commonName: { 
    type: String, 
    required: true 
  },
  scientificName: { 
    type: String, 
    required: true,
    unique: true 
  },
  category: { 
    type: String,
    enum: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Insect', 'Marine'],
    default: 'Mammal'
  },
  speciesGroup: {
    type: String,
    enum: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Insect', 'Marine'],
    default: 'Mammal'
  },
  taxonomy: {
    className: { type: String, default: 'Mammalia' },
    order: { type: String, default: 'Carnivora' },
    family: { type: String, default: 'Felidae' }
  },
  isEndangered: {
    type: Boolean,
    default: false
  },
  classifierLabel: { 
    type: String,
    required: true
  },
  conservationStatus: { 
    type: String, 
    enum: ['Excellent', 'Healthy', 'Moderate Concern', 'Vulnerable', 'Critical'],
    default: 'Healthy'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Species', speciesSchema);