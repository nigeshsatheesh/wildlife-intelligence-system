const Recording = require('../models/Recording');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Species = require('../models/Species');

// Maps a subset of YAMNet/AudioSet class names to the spec's bioacoustic categories.
// Anything not in this map still gets stored with its raw label, just bucketed as 'Environmental Noise'.
const CATEGORY_MAP = [
  { match: /bird|crow|owl|duck|chicken|goose|turkey|pigeon|coo/i, category: 'Bird Call' },
  { match: /growl|bark|howl|roar|moo|oink|neigh|bleat|dog|cat|cattle|pig|horse|sheep|lion|tiger/i, category: 'Mammal Vocalization' },
  { match: /frog|croak/i, category: 'Amphibian Call' },
  { match: /insect|cricket|mosquito|fly, housefly|bee, wasp/i, category: 'Insect Sound' },
  { match: /wind|rain|thunder|water|stream|silence|noise|ambient/i, category: 'Environmental Noise' }
];

function categorize(label) {
  const hit = CATEGORY_MAP.find(entry => entry.match.test(label));
  return hit ? hit.category : 'Environmental Noise';
}

exports.createRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }
    const audioUrl = `/uploads/${req.file.filename}`;

    // Call the bioacoustic ML microservice for real inference — no fake/random fallback here.
    // If the service is down, we tell the user honestly instead of inventing a result.
    let detectedEvents = [];
    let durationSeconds;
    let speciesClassifierLabel;
    let speciesClassifierConfidence;
    let matchedSpeciesDoc = null;
    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(req.file.path));

      const mlRes = await axios.post(`${process.env.ML_AUDIO_SERVICE_URL}/predict-audio`, formData, {
        headers: formData.getHeaders(),
        timeout: 120000
      });

      if (mlRes.data && Array.isArray(mlRes.data.events)) {
        detectedEvents = mlRes.data.events.map(e => ({
          label: e.label,
          confidence: e.confidence,
          category: categorize(e.label)
        }));
        durationSeconds = mlRes.data.duration_seconds;
      }

      // Optional species-level prediction — only present once train_audio.py has
      // been run and the audio service has a trained classifier loaded.
      if (mlRes.data && mlRes.data.species_prediction) {
        speciesClassifierLabel = mlRes.data.species_prediction.label;
        speciesClassifierConfidence = mlRes.data.species_prediction.confidence;

        if (req.isMongoConnected) {
          matchedSpeciesDoc = await Species.findOne({ classifierLabel: speciesClassifierLabel });
        } else {
          matchedSpeciesDoc = req.memoryDb.species.find(s => s.classifierLabel === speciesClassifierLabel);
        }
      }
    } catch (mlErr) {
      console.error('ML request failed', {
        code: mlErr.code,
        status: mlErr.response?.status,
        message: mlErr.message
      });
      return res.status(503).json({
        message: 'Bioacoustic analysis could not complete. Please try again.',
        detail: mlErr.message
      });
    }

    if (detectedEvents.length === 0) {
      return res.status(422).json({ message: 'No acoustic events detected in this recording.' });
    }

    const top = detectedEvents[0];
    const normalizedSpeciesPrediction = speciesClassifierLabel || null;
    const normalizedSpeciesConfidence = typeof speciesClassifierConfidence === 'number' ? speciesClassifierConfidence : null;

    // Resolve location (latitude & longitude) safely without returning NaN
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
      if (siteDoc) {
        siteId = siteDoc._id;
      }
    } else {
      siteDoc = (req.memoryDb.sites || []).find(s => s._id === siteId || s.id === siteId) || (req.memoryDb.sites || [])[0];
      if (siteDoc) {
        siteId = siteDoc._id || siteDoc.id;
      }
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

    // Resolve recordedBy safely
    let recordedBy = req.user ? (req.user._id || req.user.id) : null;
    if (!recordedBy && req.isMongoConnected) {
      const User = require('../models/user');
      const fallbackUser = await User.findOne();
      if (fallbackUser) {
        recordedBy = fallbackUser._id;
      }
    }

    const recordingData = {
      ...req.body,
      monitoringSite: siteId,
      species: matchedSpeciesDoc ? (matchedSpeciesDoc._id || matchedSpeciesDoc.id) : null,
      audioUrl,
      detectedEvents,
      topLabel: top.label,
      topConfidence: top.confidence,
      speciesPrediction: normalizedSpeciesPrediction,
      speciesPredictionConfidence: normalizedSpeciesConfidence,
      speciesClassifierLabel,
      speciesClassifierConfidence,
      durationSeconds,
      recordedBy,
      eventDate: req.body.eventDate || new Date(),
      location: {
        latitude: lat,
        longitude: lng
      }
    };

    if (req.isMongoConnected) {
      const recording = await Recording.create(recordingData);
      const populated = await Recording.findById(recording._id)
        .populate('species')
        .populate('monitoringSite')
        .populate('recordedBy', 'name email');
      res.status(201).json(populated);
    } else {
      const matchedSite = siteDoc || req.memoryDb.sites[0];
      const newRecording = {
        _id: 'rec_' + Date.now(),
        ...recordingData,
        species: matchedSpeciesDoc || null,
        monitoringSite: matchedSite,
        recordedBy: { name: req.user ? req.user.name : 'Researcher' },
        createdAt: new Date()
      };
      req.memoryDb.recordings = req.memoryDb.recordings || [];
      req.memoryDb.recordings.unshift(newRecording);
      res.status(201).json(newRecording);
    }
  } catch (error) {
    console.error('Error creating recording:', error);
    res.status(500).json({ message: error.message || 'Failed to save recording' });
  }
};

exports.getAllRecordings = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const recordings = await Recording.find()
        .populate('species')
        .populate('monitoringSite')
        .populate('recordedBy', 'name email')
        .sort({ eventDate: -1 });
      res.json(recordings);
    } else {
      res.json(req.memoryDb.recordings || []);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecordingById = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const recording = await Recording.findById(req.params.id)
        .populate('species')
        .populate('monitoringSite')
        .populate('recordedBy', 'name email');
      if (!recording) return res.status(404).json({ message: 'Recording not found' });
      res.json(recording);
    } else {
      const recording = (req.memoryDb.recordings || []).find(r => r._id === req.params.id);
      if (!recording) return res.status(404).json({ message: 'Recording not found' });
      res.json(recording);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRecording = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      await Recording.findByIdAndDelete(req.params.id);
      res.json({ message: 'Recording deleted' });
    } else {
      req.memoryDb.recordings = (req.memoryDb.recordings || []).filter(r => r._id !== req.params.id);
      res.json({ message: 'Recording deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};