const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// GET /api/devices (supports ?type=...)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    if (req.isMongoConnected) {
      const filter = type ? { type } : {};
      const devices = await Device.find(filter).populate('site').sort({ createdAt: -1 });
      res.json(devices);
    } else {
      let list = req.memoryDb.devices || [];
      if (type) list = list.filter(d => d.type === type);
      res.json(list);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/devices
router.post('/', async (req, res) => {
  try {
    const data = {
      ...req.body,
      batteryLevel: Number(req.body.batteryLevel || 100),
      lastSeen: req.body.lastSeen || new Date()
    };

    if (req.isMongoConnected) {
      const device = await Device.create(data);
      const populated = await Device.findById(device._id).populate('site');
      res.status(201).json(populated);
    } else {
      const siteDoc = (req.memoryDb.sites || []).find(s => s._id === req.body.site || s.id === req.body.site) || (req.memoryDb.sites || [])[0];
      const newDevice = {
        _id: 'dev_' + Date.now(),
        ...data,
        site: siteDoc
      };
      req.memoryDb.devices = req.memoryDb.devices || [];
      req.memoryDb.devices.unshift(newDevice);
      res.status(201).json(newDevice);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/devices/:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.isMongoConnected) {
      await Device.findByIdAndDelete(req.params.id);
      res.json({ message: 'Device deleted' });
    } else {
      req.memoryDb.devices = (req.memoryDb.devices || []).filter(d => d._id !== req.params.id && d.id !== req.params.id);
      res.json({ message: 'Device deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
