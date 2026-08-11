const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const ctrl = require('../controllers/sightingController');

router.get('/', ctrl.getAllSightings);
router.get('/:id', ctrl.getSightingById);
router.post('/', protect, upload.single('image'), ctrl.createSighting);
router.put('/:id', protect, ctrl.updateSighting);
router.delete('/:id', protect, ctrl.deleteSighting);

module.exports = router;
