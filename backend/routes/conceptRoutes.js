const express = require('express');
const router = express.Router();
const conceptController = require('../controllers/ConceptController');

/**
 * Concept Routes
 *
 * GET    /api/concepts/:lectureId   - Get all concepts for a lecture
 * PATCH  /api/concepts/:id/progress - Update concept progress status
 * DELETE /api/concepts/:id          - Delete a concept
 */

// Get all concepts for a lecture
router.get('/:lectureId', conceptController.getConcepts);

// Update concept progress status
router.patch('/:id/progress', conceptController.updateProgress);

// Delete a concept
router.delete('/:id', conceptController.deleteConcept);

module.exports = router;
