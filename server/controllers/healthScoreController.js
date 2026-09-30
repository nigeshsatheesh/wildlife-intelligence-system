const Species = require('../models/Species');
const MonitoringSite = require('../models/MonitoringSite');
const Sighting = require('../models/Sighting');
const EnvironmentReading = require('../models/EnvironmentReading');
const { computePopulationMetrics } = require('../services/populationService');
const { computeHabitatMetrics } = require('../services/habitatService');
const { computeHealthScore } = require('../services/healthScoreService');

exports.getHealthScore = async (req, res) => {
  try {
    const periodDays = Number(req.query.periodDays) || 90;

    let sightings, sites, speciesList, environmentReadings;

    if (req.isMongoConnected) {
      speciesList = await Species.find();
      sites = await MonitoringSite.find();
      sightings = await Sighting.find().populate('species').populate('monitoringSite');
      environmentReadings = await EnvironmentReading.find();
    } else {
      speciesList = req.memoryDb.species || [];
      sites = req.memoryDb.sites || [];
      sightings = req.memoryDb.sightings || [];
      environmentReadings = req.memoryDb.environmentReadings || [];
    }

    const populationMetrics = computePopulationMetrics(sightings, sites, speciesList, { periodDays });
    const habitatMetrics = computeHabitatMetrics(sightings, sites, speciesList, { periodDays });

    const healthScore = computeHealthScore(populationMetrics, habitatMetrics, environmentReadings);

    res.json(healthScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};