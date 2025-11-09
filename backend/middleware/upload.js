const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Multer configuration for file uploads
 *
 * Requirements:
 * - Accept only .txt files (both extension and MIME type validation)
 * - Maximum file size: 5MB
 * - Store files in uploads/ directory
 */

// Ensure uploads directory exists (Critical Issue #4)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory:', uploadsDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only .txt files (Critical Issue #2 - added MIME type validation)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.txt'];
  const allowedMimeTypes = ['text/plain'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Check both extension AND MIME type for security
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error('Only .txt files (text/plain MIME type) are allowed'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB in bytes
  }
});

module.exports = upload;
