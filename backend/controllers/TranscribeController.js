const BaseController = require('./BaseController');
const whisperService = require('../services/whisperService');
const fs = require('fs');

/**
 * TranscribeController - Handles audio transcription
 *
 * Endpoints:
 * - POST /api/transcribe - Transcribe audio file to text
 */
class TranscribeController extends BaseController {
  /**
   * Transcribe audio file to text
   * POST /api/transcribe
   * FormData: { audio: File }
   */
  transcribeAudio = this.asyncHandler(async (req, res) => {
    // Validate file was uploaded
    if (!req.file) {
      return this.sendError(res, 'Audio file is required', 400);
    }

    const audioFile = req.file;
    console.log(`Received audio file for transcription: ${audioFile.originalname} (${audioFile.size} bytes)`);

    try {
      // Call Whisper service to transcribe
      const transcribedText = await whisperService.transcribeAudio(audioFile.path);

      // Clean up uploaded file
      try {
        fs.unlinkSync(audioFile.path);
        console.log(`Cleaned up audio file: ${audioFile.path}`);
      } catch (cleanupError) {
        console.error(`Failed to delete audio file ${audioFile.path}:`, cleanupError.message);
        // Don't fail the request if cleanup fails, just log it
      }

      // Return transcribed text
      this.sendSuccess(res, {
        text: transcribedText
      });

    } catch (error) {
      console.error('Error transcribing audio:', error.message);

      // Clean up uploaded file on error
      try {
        if (fs.existsSync(audioFile.path)) {
          fs.unlinkSync(audioFile.path);
          console.log(`Cleaned up audio file after error: ${audioFile.path}`);
        }
      } catch (cleanupError) {
        console.error(`Failed to delete audio file ${audioFile.path}:`, cleanupError.message);
      }

      // Check if it's an API-related error
      if (error.message.includes('API key') || error.message.includes('rate limit')) {
        return this.sendError(res, error.message, 503);
      }

      // Generic error
      return this.sendError(res, `Failed to transcribe audio: ${error.message}`, 500);
    }
  });
}

module.exports = new TranscribeController();
