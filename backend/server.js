require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase, close } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes will be added here
// app.use('/api/courses', require('./routes/courseRoutes'));
// app.use('/api/lectures', require('./routes/lectureRoutes'));
// app.use('/api/concepts', require('./routes/conceptRoutes'));
// app.use('/api/review-sessions', require('./routes/reviewSessionRoutes'));
// app.use('/api/transcribe', require('./routes/transcribeRoutes'));

// 404 handler - must come before error handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
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
