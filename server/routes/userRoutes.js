const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controllers/authController');

router.get('/', protect, authorize('Admin'), getAllUsers);

module.exports = router;
