require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // High Priority #10
const { initializeDatabase, close, query } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration (High Priority #9)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser with size limits (Critical Issue #6)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting (High Priority #10)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 uploads per 15 minutes
  message: {
    success: false,
    error: 'Too many uploads from this IP, please try again later.'
  }
});

// Apply rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint with database connectivity check (High Priority #14)
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await query('SELECT 1');

    res.json({
      status: 'ok',
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/lectures', uploadLimiter, require('./routes/lectureRoutes')); // Stricter limit for uploads
app.use('/api/concepts', require('./routes/conceptRoutes'));
// Phase 3 routes:
app.use('/api/review-sessions', require('./routes/reviewSessionRoutes'));
app.use('/api/transcribe', require('./routes/transcribeRoutes'));

// 404 handler - must come before error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware (High Priority #12 - improved to prevent information disclosure)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: 'File upload error'
    });
  }

  // Handle file filter errors from Multer
  if (err.message && err.message.includes('Only .txt files')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // In production, don't expose internal error messages (High Priority #12)
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500
      ? 'Internal server error'
      : (err.message || 'Internal server error')
  });
});

// Initialize database and start server
let server;

async function startServer() {
  try {
    // Initialize database schema
    await initializeDatabase();

    // Start listening
    server = app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ CORS enabled for: ${corsOptions.origin}`);
      console.log(`✓ Rate limiting: ${apiLimiter.max} req/15min`);
      console.log(`✓ Upload rate limiting: ${uploadLimiter.max} uploads/15min`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Closing server gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('✓ HTTP server closed');

      try {
        await close();
        console.log('✓ Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();
