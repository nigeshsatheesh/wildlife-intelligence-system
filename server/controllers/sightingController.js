const Sighting = require('../models/Sighting');
const Species = require('../models/Species');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.createSighting = async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    let classifierPrediction = req.body.classifierPrediction;
    let classifierConfidence = req.body.classifierConfidence ? Number(req.body.classifierConfidence) : undefined;
    let matchedSpeciesDoc = null; // will hold the real species matched to the AI prediction

    // Call ML Microservice if an image was uploaded — real inference only, no fake fallback.
    // If the service is down and no classifierPrediction was already supplied manually,
    // we tell the user honestly instead of inventing a result.
    if (req.file) {
      try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        const mlRes = await axios.post(`${process.env.ML_IMAGE_SERVICE_URL}/predict`, formData, {
          headers: formData.getHeaders(),
          timeout: 3000
        });
        if (mlRes.data && mlRes.data.label) {
          classifierPrediction = mlRes.data.label;
          classifierConfidence = mlRes.data.confidence;

          // Look up the actual Species document whose classifierLabel matches the AI's predicted label
          if (req.isMongoConnected) {
            matchedSpeciesDoc = await Species.findOne({ classifierLabel: classifierPrediction });
          } else {
            matchedSpeciesDoc = req.memoryDb.species.find(s => s.classifierLabel === classifierPrediction);
          }
        }
      } catch (mlErr) {
        if (!classifierPrediction) {
          return res.status(503).json({
            message: 'Image classification service is unavailable. Make sure the image ML service is running on port 5001.',
            detail: mlErr.message
          });
        }
        // A classifierPrediction was already supplied manually — proceed without AI classification.
      }
    }

    let lat = parseFloat(req.body.latitude);
    let lng = parseFloat(req.body.longitude);

    let siteId = req.body.monitoringSite;
    let siteDoc = null;

    if (req.isMongoConnected) {
      const MonitoringSite = require('../models/MonitoringSite');
      if (siteId) {
        siteDoc = await MonitoringSite.findById(siteId).catch(() => null);
      }
      if (!siteDoc) {
        siteDoc = await MonitoringSite.findOne();
      }
    } else {
      siteDoc = (req.memoryDb.sites || []).find(s => s._id === siteId || s.id === siteId) || (req.memoryDb.sites || [])[0];
    }

    if (isNaN(lat) || isNaN(lng)) {
      if (siteDoc && siteDoc.location) {
        lat = Number(siteDoc.location.latitude) || 0;
        lng = Number(siteDoc.location.longitude) || 0;
      } else {
        lat = 0;
        lng = 0;
      }
    }

    let observedBy = req.user ? (req.user._id || req.user.id) : null;
    if (!observedBy && req.isMongoConnected) {
      const User = require('../models/user');
      const fallbackUser = await User.findOne();
      if (fallbackUser) observedBy = fallbackUser._id;
    }

    const sightingData = {
      ...req.body,
      // Use the AI-matched species if we found one; otherwise fall back to whatever was submitted
      species: matchedSpeciesDoc ? (matchedSpeciesDoc._id || matchedSpeciesDoc.id) : req.body.species,
      imageUrl,
      classifierPrediction,
      classifierConfidence: classifierConfidence || 0.95,
      observedBy,
      eventDate: req.body.eventDate || new Date(),

      location: {
        latitude: lat,
        longitude: lng
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
      const matchedSpecies = matchedSpeciesDoc || req.memoryDb.species.find(s => s._id === req.body.species) || req.memoryDb.species[0];
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

exports.classifyPreview = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });

    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    const mlResponse = await axios.post(`${process.env.ML_IMAGE_SERVICE_URL || 'http://localhost:5001'}/predict`, formData, {
      headers: formData.getHeaders()
    });

    res.json({
      label: mlResponse.data.label,
      confidence: mlResponse.data.confidence
    });
  } catch (error) {
    res.status(500).json({ message: 'Classification service unavailable' });
  }
};
