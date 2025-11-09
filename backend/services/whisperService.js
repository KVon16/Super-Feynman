const OpenAI = require('openai');
const fs = require('fs');

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Retry helper with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} Result of the function
 */
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on client errors (4xx) except rate limits (429)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate exponential backoff delay: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying OpenAI API call in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Transcribe audio file to text using OpenAI Whisper API
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeAudio(audioFilePath) {
  // Validate input
  if (!audioFilePath || typeof audioFilePath !== 'string') {
    throw new Error('Audio file path is required and must be a string');
  }

  // Check file exists
  if (!fs.existsSync(audioFilePath)) {
    throw new Error('Audio file not found');
  }

  // Check API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables');
  }

  console.log(`Transcribing audio file: ${audioFilePath}...`);

  try {
    // Call OpenAI Whisper API with retry logic
    const transcription = await retryWithBackoff(async () => {
      return await client.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1'
      });
    });

    const transcribedText = transcription.text.trim();
    console.log(`Transcription successful (${transcribedText.length} characters)`);
    return transcribedText;

  } catch (error) {
    console.error('Error transcribing audio:', {
      message: error.message,
      status: error.status,
      type: error.type
    });

    // Re-throw with user-friendly message
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key');
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.message.includes('file not found')) {
      throw new Error('Audio file not found');
    } else {
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }
}

module.exports = {
  transcribeAudio
};
