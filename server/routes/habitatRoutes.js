const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/habitatController');

router.get('/', ctrl.getHabitatMetrics);

module.exports = router;