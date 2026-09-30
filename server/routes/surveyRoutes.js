const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

// GET /api/surveys
router.get('/', async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const surveys = await Survey.find().populate('site monitoringDevice').sort({ surveyDate: -1 });
      res.json(surveys);
    } else {
      res.json(req.memoryDb.surveys || []);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/surveys
router.post('/', async (req, res) => {
  try {
    const count = (req.isMongoConnected ? await Survey.countDocuments() : (req.memoryDb.surveys || []).length) + 1;
    const surveyId = req.body.surveyId || `SRV-2026-${String(count).padStart(3, '0')}`;

    const data = {
      ...req.body,
      surveyId
    };

    if (req.isMongoConnected) {
      const survey = await Survey.create(data);
      const populated = await Survey.findById(survey._id).populate('site monitoringDevice');
      res.status(201).json(populated);
    } else {
      const siteDoc = (req.memoryDb.sites || []).find(s => s._id === req.body.site || s.id === req.body.site) || (req.memoryDb.sites || [])[0];
      const newSurvey = {
        _id: 'srv_' + Date.now(),
        ...data,
        site: siteDoc
      };
      req.memoryDb.surveys = req.memoryDb.surveys || [];
      req.memoryDb.surveys.unshift(newSurvey);
      res.status(201).json(newSurvey);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/surveys/:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.isMongoConnected) {
      await Survey.findByIdAndDelete(req.params.id);
      res.json({ message: 'Survey deleted' });
    } else {
      req.memoryDb.surveys = (req.memoryDb.surveys || []).filter(s => s._id !== req.params.id && s.id !== req.params.id);
      res.json({ message: 'Survey deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
