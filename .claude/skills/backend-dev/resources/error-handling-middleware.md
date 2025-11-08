# Error Handling & Middleware - Super Feynman Backend

Complete guide to error handling, middleware, and file uploads for Super Feynman.

---

## Global Error Handler

### Error Handler Middleware

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('[Error Handler]', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

module.exports = errorHandler;
```

### Usage in App

```javascript
// app.js
const express = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ... routes ...

// Error handler (MUST be last)
app.use(errorHandler);

module.exports = app;
```

---

## Async Error Wrapper

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

### Usage

```javascript
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
    const courses = await courseService.getAllCourses();
    res.json({ success: true, data: courses });
}));
```

---

## File Upload with Multer

### Multer Configuration

```javascript
// middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (path.extname(file.originalname) === '.txt') {
        cb(null, true);
    } else {
        cb(new Error('Only .txt files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
```

### Usage in Routes

```javascript
// routes/lectureRoutes.js
const upload = require('../middleware/upload');

router.post('/',
    upload.single('file'),
    (req, res) => controller.createLecture(req, res)
);
```

### Audio File Upload

```javascript
// middleware/audioUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const audioUpload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

module.exports = audioUpload;
```

---

## Validation Middleware

### Request Validation

```javascript
// middleware/validation.js

const validateCourseCreation = (req, res, next) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Course name is required and must be a string'
            }
        });
    }

    if (name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Course name must be at least 3 characters'
            }
        });
    }

    next();
};

module.exports = {
    validateCourseCreation
};
```

### Usage

```javascript
const { validateCourseCreation } = require('../middleware/validation');

router.post('/',
    validateCourseCreation,
    (req, res) => controller.createCourse(req, res)
);
```

---

## Logging Middleware

### Request Logger

```javascript
// middleware/logger.js

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
};

module.exports = requestLogger;
```

### Usage

```javascript
// app.js
const requestLogger = require('./middleware/logger');

app.use(requestLogger);
```

---

## CORS Middleware

```javascript
// app.js
const cors = require('cors');

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

---

## Complete Express App Setup

```javascript
// app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');

// Import routes
const courseRoutes = require('./routes/courseRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const conceptRoutes = require('./routes/conceptRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/concepts', conceptRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
```

---

## Server Entry Point

```javascript
// server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

---

## Best Practices

✅ **DO:**
- Use global error handler as last middleware
- Validate inputs with middleware
- Log requests with context
- Clean up uploaded files after processing
- Set appropriate file size limits
- Use environment variables for configuration
- Add CORS for frontend communication

❌ **DON'T:**
- Expose sensitive data in errors
- Skip input validation
- Forget to cleanup temp files
- Allow unlimited file sizes
- Put error handler before routes
- Hardcode URLs and ports
