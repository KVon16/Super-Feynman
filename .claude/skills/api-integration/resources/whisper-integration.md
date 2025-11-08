# OpenAI Whisper API Integration - Super Feynman

Complete guide to integrating OpenAI Whisper for speech-to-text transcription.

---

## Latest Model Information

As of January 2025:
- **Model:** `whisper-1`
- **Supported formats:** mp3, mp4, mpeg, mpga, m4a, wav, webm
- **File size limit:** 25 MB

Check [OpenAI's documentation](https://platform.openai.com/docs/guides/speech-to-text) for updates.

---

## Service Setup

```javascript
// services/whisperService.js
const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class WhisperService {
    async transcribeAudio(audioFilePath) {
        try {
            console.log(`[Whisper] Transcribing audio file: ${audioFilePath}`);

            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(audioFilePath),
                model: 'whisper-1',
                language: 'en', // Optional: specify language for better accuracy
                response_format: 'text' // Can also use 'json', 'srt', 'vtt'
            });

            console.log(`[Whisper] Transcription successful`);
            return transcription;

        } catch (error) {
            console.error('[Whisper] Transcription failed:', error);
            throw error;
        }
    }
}

module.exports = new WhisperService();
```

---

## API Route with File Upload

```javascript
// routes/transcribeRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const whisperService = require('../services/whisperService');

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/audio';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

router.post('/', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: { message: 'No audio file provided' }
            });
        }

        const transcription = await whisperService.transcribeAudio(req.file.path);

        // Clean up uploaded file after transcription
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            data: { text: transcription }
        });

    } catch (error) {
        console.error('[Transcribe Route] Error:', error);

        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: { message: error.message || 'Transcription failed' }
        });
    }
});

module.exports = router;
```

---

## Frontend Integration

```javascript
// In your React component
const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);

    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        const response = await axios.post('/api/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const transcribedText = response.data.data.text;
        return transcribedText;

    } catch (error) {
        console.error('Transcription error:', error);
        throw new Error('Failed to transcribe audio');
    } finally {
        setIsTranscribing(false);
    }
};
```

---

## Testing

### Test with curl

```bash
# Upload a test audio file
curl -X POST http://localhost:3001/api/transcribe \
  -F "audio=@test-recording.webm"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "text": "This is the transcribed text from the audio file."
  }
}
```

---

## Cost Optimization Tips

1. Compress audio files before sending (reduce quality if acceptable)
2. Limit recording duration in frontend
3. Consider using `response_format: 'text'` (smallest response)
4. Implement client-side validation before upload
5. Add rate limiting to prevent abuse

---

## Common Issues & Solutions

### 1. "Invalid file type"
- **Solution:** Check audio file format (webm, wav, mp3)
- Verify MIME type is correct

### 2. "File too large"
- **Solution:** File must be < 25MB
- Compress audio or reduce recording duration

### 3. "Transcription failed"
- **Solution:** Check API key is valid
- Ensure audio file is not corrupted
- Verify OpenAI API is accessible

---

## Best Practices

✅ **DO:**
- Validate file types on upload
- Limit file size (25MB max)
- Clean up temp files after transcription
- Show progress indicators during upload
- Handle network errors gracefully
- Implement rate limiting

❌ **DON'T:**
- Store audio files permanently (unless needed)
- Skip file validation
- Forget to clean up temp files
- Exceed 25MB file size
- Expose API keys in frontend
