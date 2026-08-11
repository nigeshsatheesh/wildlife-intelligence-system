const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { classifyAudio } = require('../controllers/audioController');

router.post('/classify', upload.single('audio'), classifyAudio);

module.exports = router;
