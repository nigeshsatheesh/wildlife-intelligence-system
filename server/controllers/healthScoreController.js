// server/controllers/healthScoreController.js
const Species = require('../models/Species');
const MonitoringSite = require('../models/MonitoringSite');
const Sighting = require('../models/Sighting');
const { computePopulationMetrics } = require('../services/populationService');
const { computeHabitatMetrics } = require('../services/habitatService');
const { computeHealthScore } = require('../services/healthScoreService');

exports.getHealthScore = async (req, res) => {
  try {
    const periodDays = Number(req.query.periodDays) || 90;

    const speciesList = await Species.find();
    const sites = await MonitoringSite.find();
    const sightings = await Sighting.find().populate('species monitoringSite');

    const populationMetrics = computePopulationMetrics(sightings, sites, speciesList, { periodDays });
    const habitatMetrics = computeHabitatMetrics(sightings, sites, speciesList, { periodDays });

    const healthScore = computeHealthScore(populationMetrics, habitatMetrics);

    res.json(healthScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};