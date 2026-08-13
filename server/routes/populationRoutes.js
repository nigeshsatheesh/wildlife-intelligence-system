const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/populationController');

router.get('/', ctrl.getPopulationMetrics);

module.exports = router;