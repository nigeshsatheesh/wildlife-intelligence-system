const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/siteController');

router.get('/', ctrl.getAllSites);
router.get('/:id', ctrl.getSiteById);
router.post('/', protect, authorize('Admin'), ctrl.createSite);
router.put('/:id', protect, authorize('Admin'), ctrl.updateSite);
router.delete('/:id', protect, authorize('Admin'), ctrl.deleteSite);

module.exports = router;
