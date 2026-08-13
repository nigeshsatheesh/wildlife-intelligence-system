const Species = require('../models/Species');
const Sighting = require('../models/Sighting');
const MonitoringSite = require('../models/MonitoringSite');
const { computeHabitatMetrics } = require('../services/habitatService');

exports.getHabitatMetrics = async (req, res) => {
  try {
    const periodDays = req.query.periodDays ? Number(req.query.periodDays) : 90;

    let sightings, sites, speciesList;

    if (req.isMongoConnected) {
      sightings = await Sighting.find().populate('species').populate('monitoringSite');
      sites = await MonitoringSite.find();
      speciesList = await Species.find();
    } else {
      sightings = req.memoryDb.sightings || [];
      sites = req.memoryDb.sites || [];
      speciesList = req.memoryDb.species || [];
    }

    const metrics = computeHabitatMetrics(sightings, sites, speciesList, { periodDays });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};