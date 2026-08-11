const MonitoringSite = require('../models/MonitoringSite');

exports.createSite = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const site = await MonitoringSite.create(req.body);
      res.status(201).json(site);
    } else {
      const newSite = { _id: 'st_' + Date.now(), ...req.body };
      req.memoryDb.sites.push(newSite);
      res.status(201).json(newSite);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSites = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const sites = await MonitoringSite.find().populate('registeredBy', 'name email');
      res.json(sites);
    } else {
      res.json(req.memoryDb.sites);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSiteById = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const site = await MonitoringSite.findById(req.params.id).populate('registeredBy', 'name email');
      if (!site) return res.status(404).json({ message: 'Site not found' });
      res.json(site);
    } else {
      const site = req.memoryDb.sites.find(st => st._id === req.params.id);
      if (!site) return res.status(404).json({ message: 'Site not found' });
      res.json(site);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSite = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const site = await MonitoringSite.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(site);
    } else {
      const idx = req.memoryDb.sites.findIndex(st => st._id === req.params.id);
      if (idx !== -1) {
        req.memoryDb.sites[idx] = { ...req.memoryDb.sites[idx], ...req.body };
        res.json(req.memoryDb.sites[idx]);
      } else {
        res.status(404).json({ message: 'Site not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSite = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      await MonitoringSite.findByIdAndDelete(req.params.id);
      res.json({ message: 'Site deleted' });
    } else {
      req.memoryDb.sites = req.memoryDb.sites.filter(st => st._id !== req.params.id);
      res.json({ message: 'Site deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
