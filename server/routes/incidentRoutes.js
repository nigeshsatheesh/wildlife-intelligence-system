const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const incidentController = require('../controllers/incidentController');

router.get('/', protect, incidentController.getIncidents);
router.post('/', protect, requireRole(['Admin', 'Forest Department Officer', 'Conservation Officer']), incidentController.createIncident);
router.patch('/:id/status', protect, requireRole(['Admin', 'Forest Department Officer', 'Conservation Officer']), incidentController.updateIncidentStatus);

module.exports = router;
