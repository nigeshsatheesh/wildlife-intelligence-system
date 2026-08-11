const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/speciesController');

router.get('/', ctrl.getAllSpecies);
router.get('/:id', ctrl.getSpeciesById);
router.post('/', protect, authorize('Admin'), ctrl.createSpecies);
router.put('/:id', protect, authorize('Admin'), ctrl.updateSpecies);
router.delete('/:id', protect, authorize('Admin'), ctrl.deleteSpecies);

module.exports = router;
