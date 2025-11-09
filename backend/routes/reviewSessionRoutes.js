const express = require('express');
const router = express.Router();
const reviewSessionController = require('../controllers/ReviewSessionController');

/**
 * Review Session Routes
 *
 * POST /api/review-sessions           - Start a new review session
 * POST /api/review-sessions/:id/message - Send a message in a session
 * POST /api/review-sessions/:id/end   - End a session and get feedback
 */

// Start a new review session
router.post('/', reviewSessionController.startSession);

// Send a message in a session
router.post('/:id/message', reviewSessionController.sendMessage);

// End a session and get feedback
router.post('/:id/end', reviewSessionController.endSession);

module.exports = router;
