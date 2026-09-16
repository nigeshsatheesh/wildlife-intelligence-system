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

const crypto = require('crypto');
const audioPredictionCache = new Map();
const MAX_AUDIO_CACHE_SIZE = 200;

exports.createRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }
    const audioUrl = `/uploads/${req.file.filename}`;

    let detectedEvents = [];
    let durationSeconds = 0;
    let speciesClassifierLabel;
    let speciesClassifierConfidence;
    let matchedSpeciesDoc = null;
    let mlData = null;

    try {
      // Check cache by SHA-256 of file buffer
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      if (audioPredictionCache.has(fileHash)) {
        mlData = audioPredictionCache.get(fileHash);
      } else {
        const formData = new FormData();
        formData.append('audio', fs.createReadStream(req.file.path));

        const mlAudioUrl = process.env.ML_AUDIO_SERVICE_URL || 'http://localhost:5002';
        const mlRes = await axios.post(`${mlAudioUrl}/predict-audio`, formData, {
          headers: formData.getHeaders(),
          timeout: 45000
        });
        mlData = mlRes.data;

        if (audioPredictionCache.size >= MAX_AUDIO_CACHE_SIZE) {
          const firstKey = audioPredictionCache.keys().next().value;
          audioPredictionCache.delete(firstKey);
        }
        audioPredictionCache.set(fileHash, mlData);
      }

      if (mlData && Array.isArray(mlData.events)) {
        detectedEvents = mlData.events.map(e => ({
          label: e.label,
          confidence: e.confidence,
          category: categorize(e.label)
        }));
        durationSeconds = mlData.duration_seconds;
      }

      if (mlData && mlData.species_prediction) {
        speciesClassifierLabel = mlData.species_prediction.label;
        speciesClassifierConfidence = mlData.species_prediction.confidence;

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

    // Synchronize overall audio analysis confidence with the species prediction confidence
    const effectiveTopConfidence = normalizedSpeciesConfidence !== null ? normalizedSpeciesConfidence : top.confidence;
    if (normalizedSpeciesConfidence !== null && detectedEvents.length > 0) {
      detectedEvents[0].confidence = normalizedSpeciesConfidence;
    }

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
      topConfidence: effectiveTopConfidence,
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