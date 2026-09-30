const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const alertService = require('../services/alertService');

// GET /api/notifications (supports ?unread=true and ?role=...)
router.get('/', async (req, res) => {
  try {
    const { unread, role } = req.query;

    if (req.isMongoConnected) {
      const filter = {};
      if (unread === 'true') filter.read = false;
      if (role) filter.roleTargets = role;

      const notifications = await Notification.find(filter)
        .populate('relatedSpecies relatedSite relatedSighting')
        .sort({ createdAt: -1 });

      res.json(notifications);
    } else {
      let list = req.memoryDb.notifications || [];
      if (unread === 'true') list = list.filter(n => !n.read);
      if (role) list = list.filter(n => !n.roleTargets || n.roleTargets.includes(role));
      res.json(list);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true }
      );
      res.json(notification);
    } else {
      req.memoryDb.notifications = req.memoryDb.notifications || [];
      const item = req.memoryDb.notifications.find(n => n._id === req.params.id || n.id === req.params.id);
      if (item) {
        item.read = true;
        res.json(item);
      } else {
        res.status(404).json({ message: 'Notification not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    if (req.isMongoConnected) {
      await Notification.updateMany({ read: false }, { read: true });
      res.json({ message: 'All notifications marked as read' });
    } else {
      req.memoryDb.notifications = (req.memoryDb.notifications || []).map(n => ({ ...n, read: true }));
      res.json({ message: 'All notifications marked as read' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/alerts/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const created = await alertService.evaluateAllAlerts(req);
    res.json({ message: 'System alerts evaluated successfully', createdCount: created.length, created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
