const Species = require('../models/Species');

exports.createSpecies = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const species = await Species.create(req.body);
      res.status(201).json(species);
    } else {
      const newSpecies = { _id: 's_' + Date.now(), ...req.body };
      req.memoryDb.species.push(newSpecies);
      res.status(201).json(newSpecies);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSpecies = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const speciesList = await Species.find().sort({ commonName: 1 });
      res.json(speciesList);
    } else {
      res.json(req.memoryDb.species);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSpeciesById = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const species = await Species.findById(req.params.id);
      if (!species) return res.status(404).json({ message: 'Species not found' });
      res.json(species);
    } else {
      const species = req.memoryDb.species.find(s => s._id === req.params.id);
      if (!species) return res.status(404).json({ message: 'Species not found' });
      res.json(species);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSpecies = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const species = await Species.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(species);
    } else {
      const idx = req.memoryDb.species.findIndex(s => s._id === req.params.id);
      if (idx !== -1) {
        req.memoryDb.species[idx] = { ...req.memoryDb.species[idx], ...req.body };
        res.json(req.memoryDb.species[idx]);
      } else {
        res.status(404).json({ message: 'Species not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSpecies = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      await Species.findByIdAndDelete(req.params.id);
      res.json({ message: 'Species deleted' });
    } else {
      req.memoryDb.species = req.memoryDb.species.filter(s => s._id !== req.params.id);
      res.json({ message: 'Species deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
