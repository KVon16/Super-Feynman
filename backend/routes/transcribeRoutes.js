const express = require('express');
const router = express.Router();
const transcribeController = require('../controllers/TranscribeController');
const audioUpload = require('../middleware/audioUpload');

/**
 * Transcription Routes
 *
 * POST /api/transcribe - Transcribe audio file to text
 */

// Transcribe audio file
router.post('/', audioUpload.single('audio'), transcribeController.transcribeAudio);

module.exports = router;
