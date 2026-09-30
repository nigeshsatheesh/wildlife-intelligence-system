const express = require('express');
const router = express.Router();
const EnvironmentReading = require('../models/EnvironmentReading');

// GET /api/environment
router.get('/', async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const readings = await EnvironmentReading.find()
        .populate('site')
        .sort({ readingDate: -1 });
      res.json(readings);
    } else {
      res.json(req.memoryDb.environmentReadings || []);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/environment
router.post('/', async (req, res) => {
  try {
    const { site, temperature, rainfall, humidity, readingDate } = req.body;

    if (!site || temperature === undefined) {
      return res.status(400).json({ message: 'Site and temperature are required fields.' });
    }

    const data = {
      site,
      temperature: Number(temperature),
      rainfall: Number(rainfall || 0),
      humidity: Number(humidity || 50),
      readingDate: readingDate || new Date()
    };

    if (req.isMongoConnected) {
      const reading = await EnvironmentReading.create(data);
      const populated = await EnvironmentReading.findById(reading._id).populate('site');
      res.status(201).json(populated);
    } else {
      const siteDoc = (req.memoryDb.sites || []).find(s => s._id === site || s.id === site) || (req.memoryDb.sites || [])[0];
      const newReading = {
        _id: 'env_' + Date.now(),
        ...data,
        site: siteDoc
      };
      req.memoryDb.environmentReadings = req.memoryDb.environmentReadings || [];
      req.memoryDb.environmentReadings.unshift(newReading);
      res.status(201).json(newReading);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
