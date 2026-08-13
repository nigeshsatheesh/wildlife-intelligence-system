const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const ctrl = require('../controllers/recordingController');

router.get('/', ctrl.getAllRecordings);
router.get('/:id', ctrl.getRecordingById);
router.post('/', protect, upload.single('audio'), ctrl.createRecording);
router.delete('/:id', protect, ctrl.deleteRecording);

module.exports = router;