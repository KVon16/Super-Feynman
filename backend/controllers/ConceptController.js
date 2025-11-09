const BaseController = require('./BaseController');
const { query, run } = require('../database/db');

/**
 * ConceptController - Handles all concept-related operations
 *
 * Endpoints:
 * - GET /api/concepts/:lectureId - Get all concepts for a lecture
 * - PATCH /api/concepts/:id/progress - Update concept progress status
 * - DELETE /api/concepts/:id - Delete a concept
 */
class ConceptController extends BaseController {
  // Valid progress status values
  static VALID_STATUSES = ['Not Started', 'Reviewing', 'Understood', 'Mastered'];

  /**
   * Get all concepts for a lecture
   * GET /api/concepts/:lectureId
   * Returns concepts sorted by last_reviewed DESC (nulls last)
   */
  getConcepts = this.asyncHandler(async (req, res) => {
    const { lectureId } = req.params;

    // Validate lectureId is a positive integer (Critical Issue #1)
    const parsedLectureId = parseInt(lectureId, 10);
    if (!Number.isInteger(parsedLectureId) || parsedLectureId <= 0) {
      return this.sendError(res, 'Invalid lecture ID', 400);
    }

    // Verify lecture exists (Critical Issue #5 - removed try-catch)
    const lectures = await query(
      'SELECT * FROM lectures WHERE id = ?',
      [parsedLectureId]
    );

    if (lectures.length === 0) {
      return this.sendError(res, 'Lecture not found', 404);
    }

    // Fetch all concepts for the lecture
    // Sort by last_reviewed DESC, with NULLs at the end
    const concepts = await query(
      `SELECT * FROM concepts
       WHERE lecture_id = ?
       ORDER BY
         CASE WHEN last_reviewed IS NULL THEN 1 ELSE 0 END,
         last_reviewed DESC`,
      [parsedLectureId]
    );

    this.sendSuccess(res, concepts);
  });

  /**
   * Update concept progress status
   * PATCH /api/concepts/:id/progress
   * Body: { progress_status: string }
   * Updates last_reviewed timestamp automatically
   */
  updateProgress = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { progress_status } = req.body;

    // Validate ID is a positive integer (Critical Issue #1)
    const conceptId = parseInt(id, 10);
    if (!Number.isInteger(conceptId) || conceptId <= 0) {
      return this.sendError(res, 'Invalid concept ID', 400);
    }

    // Validation
    if (!progress_status) {
      return this.sendError(res, 'Progress status is required', 400);
    }

    if (!ConceptController.VALID_STATUSES.includes(progress_status)) {
      return this.sendError(
        res,
        `Invalid progress status. Must be one of: ${ConceptController.VALID_STATUSES.join(', ')}`,
        400
      );
    }

    // Check if concept exists (Critical Issue #5 - removed try-catch)
    const concepts = await query(
      'SELECT * FROM concepts WHERE id = ?',
      [conceptId]
    );

    if (concepts.length === 0) {
      return this.sendError(res, 'Concept not found', 404);
    }

    // Update progress status and last_reviewed timestamp
    await run(
      `UPDATE concepts
       SET progress_status = ?, last_reviewed = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [progress_status, conceptId]
    );

    // Fetch updated concept
    const updatedConcepts = await query(
      'SELECT * FROM concepts WHERE id = ?',
      [conceptId]
    );

    this.sendSuccess(res, updatedConcepts[0]);
  });

  /**
   * Delete a concept
   * DELETE /api/concepts/:id
   */
  deleteConcept = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID is a positive integer (Critical Issue #1)
    const conceptId = parseInt(id, 10);
    if (!Number.isInteger(conceptId) || conceptId <= 0) {
      return this.sendError(res, 'Invalid concept ID', 400);
    }

    // Check if concept exists (Critical Issue #5 - removed try-catch)
    const concepts = await query(
      'SELECT * FROM concepts WHERE id = ?',
      [conceptId]
    );

    if (concepts.length === 0) {
      return this.sendError(res, 'Concept not found', 404);
    }

    // Delete the concept
    await run('DELETE FROM concepts WHERE id = ?', [conceptId]);

    this.sendSuccess(res, {
      message: 'Concept deleted successfully',
      id: conceptId
    });
  });
}

module.exports = new ConceptController();
