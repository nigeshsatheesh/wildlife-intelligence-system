const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { downloadReport, downloadExcelReport } = require('../controllers/reportController');

router.get('/download', protect, downloadReport);
router.get('/excel', protect, downloadExcelReport);

module.exports = router;