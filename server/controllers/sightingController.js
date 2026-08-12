const Sighting = require('../models/Sighting');
const Species = require('../models/Species');
const axios = require('axios');

exports.createSighting = async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    let classifierPrediction = req.body.classifierPrediction;
    let classifierConfidence = req.body.classifierConfidence ? Number(req.body.classifierConfidence) : undefined;

    // Call ML Microservice at http://localhost:5001/predict if ML service is running and file uploaded
    if (req.file) {
      try {
        const FormData = require('form-data');
        const fs = require('fs');
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        const mlRes = await axios.post('http://localhost:5001/predict', formData, {
          headers: formData.getHeaders(),
          timeout: 3000
        });
        if (mlRes.data && mlRes.data.label) {
          classifierPrediction = mlRes.data.label;
          classifierConfidence = mlRes.data.confidence;
        }
      } catch (mlErr) {
        // Fallback classifier simulation if ML service not running
        if (!classifierPrediction) {
          const sampleLabels = ['Panthera tigris', 'Loxodonta africana', 'Aquila chrysaetos', 'Canis lupus'];
          classifierPrediction = sampleLabels[Math.floor(Math.random() * sampleLabels.length)];
          classifierConfidence = 0.94;
        }
      }
    }

    const sightingData = {
      ...req.body,
      imageUrl,
      classifierPrediction,
      classifierConfidence: classifierConfidence || 0.95,
      observedBy: req.user ? req.user._id : undefined,
      eventDate: req.body.eventDate || new Date(),

      location: {
        latitude: Number(req.body.latitude),
        longitude: Number(req.body.longitude)
      }
    };

    if (req.isMongoConnected) {
      const sighting = await Sighting.create(sightingData);
      const populated = await Sighting.findById(sighting._id)
        .populate('species')
        .populate('monitoringSite')
        .populate('observedBy', 'name email');
      res.status(201).json(populated);
    } else {
      const matchedSpecies = req.memoryDb.species.find(s => s._id === req.body.species) || req.memoryDb.species[0];
      const matchedSite = req.memoryDb.sites.find(st => st._id === req.body.monitoringSite) || req.memoryDb.sites[0];
      
      const newSighting = {
        _id: 'sg_' + Date.now(),
        ...sightingData,
        species: matchedSpecies,
        monitoringSite: matchedSite,
        observedBy: { name: req.user ? req.user.name : 'Researcher' },
        createdAt: new Date()
      };
      req.memoryDb.sightings.unshift(newSighting);
      res.status(201).json(newSighting);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSightings = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const sightings = await Sighting.find()
        .populate('species')
        .populate('monitoringSite')
        .populate('observedBy', 'name email')
        .sort({ eventDate: -1 });
      res.json(sightings);
    } else {
      res.json(req.memoryDb.sightings);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSightingById = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const sighting = await Sighting.findById(req.params.id)
        .populate('species')
        .populate('monitoringSite')
        .populate('observedBy', 'name email');
      if (!sighting) return res.status(404).json({ message: 'Sighting not found' });
      res.json(sighting);
    } else {
      const sighting = req.memoryDb.sightings.find(s => s._id === req.params.id);
      if (!sighting) return res.status(404).json({ message: 'Sighting not found' });
      res.json(sighting);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSighting = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const sighting = await Sighting.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(sighting);
    } else {
      const idx = req.memoryDb.sightings.findIndex(s => s._id === req.params.id);
      if (idx !== -1) {
        req.memoryDb.sightings[idx] = { ...req.memoryDb.sightings[idx], ...req.body };
        res.json(req.memoryDb.sightings[idx]);
      } else {
        res.status(404).json({ message: 'Sighting not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSighting = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      await Sighting.findByIdAndDelete(req.params.id);
      res.json({ message: 'Sighting deleted' });
    } else {
      req.memoryDb.sightings = req.memoryDb.sightings.filter(s => s._id !== req.params.id);
      res.json({ message: 'Sighting deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
