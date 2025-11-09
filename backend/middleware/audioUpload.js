const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for audio files
const fileFilter = (req, file, cb) => {
  // Accepted audio extensions
  const allowedExtensions = ['.webm', '.mp3', '.wav', '.m4a'];
  const ext = path.extname(file.originalname).toLowerCase();

  // Accepted MIME types
  const allowedMimeTypes = [
    'audio/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/mp4',
    'audio/x-m4a',
    'application/octet-stream' // Fallback for when MIME type is not detected
  ];

  // Validate extension first (critical for security)
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Only audio files are allowed (${allowedExtensions.join(', ')})`), false);
  }

  // Validate MIME type (with fallback for octet-stream)
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid audio MIME type: ${file.mimetype}`), false);
  }

  cb(null, true);
};

// Create multer instance
const audioUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB (Whisper API limit)
  }
});

module.exports = audioUpload;
