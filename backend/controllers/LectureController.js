const BaseController = require('./BaseController');
const { query, run } = require('../database/db');
const fs = require('fs').promises;
const anthropicService = require('../services/anthropicService');

/**
 * LectureController - Handles all lecture-related operations
 *
 * Endpoints:
 * - POST /api/lectures - Create a new lecture with file upload
 * - GET /api/lectures/:courseId - Get all lectures for a course
 * - DELETE /api/lectures/:id - Delete a lecture (cascades to concepts)
 */
class LectureController extends BaseController {
  /**
   * Create a new lecture with file upload
   * POST /api/lectures
   * Body (multipart/form-data): { courseId: number, name: string, file: File }
   */
  createLecture = this.asyncHandler(async (req, res) => {
    const { courseId, name } = req.body;
    const file = req.file;

    // Validate courseId is a positive integer (Critical Issue #3)
    const parsedCourseId = parseInt(courseId, 10);
    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
      if (file && file.path) {
        await fs.unlink(file.path).catch(err => {
          console.error('Warning: Failed to delete uploaded file:', file.path, err.message);
        });
      }
      return this.sendError(res, 'Invalid course ID', 400);
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      if (file && file.path) {
        await fs.unlink(file.path).catch(err => {
          console.error('Warning: Failed to delete uploaded file:', file.path, err.message);
        });
      }
      return this.sendError(res, 'Lecture name is required and must be a non-empty string', 400);
    }

    // Validate file exists
    if (!file) {
      return this.sendError(res, 'File is required', 400);
    }

    // Verify course exists
    const courses = await query(
      'SELECT * FROM courses WHERE id = ?',
      [parsedCourseId]
    );

    if (courses.length === 0) {
      await fs.unlink(file.path).catch(err => {
        console.error('Warning: Failed to delete uploaded file:', file.path, err.message);
      });
      return this.sendError(res, 'Course not found', 404);
    }

    // Read file content
    const fileContent = await fs.readFile(file.path, 'utf-8');

    // Validate file is not empty
    if (!fileContent.trim()) {
      await fs.unlink(file.path).catch(err => {
        console.error('Warning: Failed to delete uploaded file:', file.path, err.message);
      });
      return this.sendError(res, 'File content cannot be empty', 400);
    }

    // Validate content size (High Priority Issue #13)
    const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB
    const contentSizeBytes = Buffer.byteLength(fileContent, 'utf-8');

    if (contentSizeBytes > MAX_CONTENT_SIZE) {
      await fs.unlink(file.path).catch(err => {
        console.error('Warning: Failed to delete uploaded file:', file.path, err.message);
      });
      return this.sendError(res, 'File content exceeds maximum size of 5MB', 400);
    }

    // Validate content is actually text (not binary) (High Priority Issue #13)
    const isBinary = /[\x00-\x08\x0E-\x1F]/.test(fileContent);
    if (isBinary) {
      await fs.unlink(file.path).catch(err => {
        console.error('Warning: Failed to delete uploaded file:', file.path, err.message);
      });
      return this.sendError(res, 'File appears to contain binary data', 400);
    }

    // Insert lecture into database
    const result = await run(
      'INSERT INTO lectures (course_id, name, file_content) VALUES (?, ?, ?)',
      [parsedCourseId, name.trim(), fileContent]
    );

    // Fetch the created lecture
    const lectures = await query(
      'SELECT * FROM lectures WHERE id = ?',
      [result.lastID]
    );

    const lecture = lectures[0];

    // Clean up uploaded file (content is now in database) (High Priority Issue #8)
    await fs.unlink(file.path).catch(err => {
      console.error('Warning: Failed to delete uploaded file:', file.path, err.message);
    });

    // Phase 3: Generate concepts from lecture content using Anthropic API
    let concepts = [];
    let conceptsGenerationError = null;

    try {
      console.log(`Generating concepts for lecture ID ${lecture.id}...`);
      const generatedConcepts = await anthropicService.generateConcepts(fileContent);

      // Insert each concept into the database
      for (const concept of generatedConcepts) {
        const conceptResult = await run(
          'INSERT INTO concepts (lecture_id, concept_name, concept_description, progress_status) VALUES (?, ?, ?, ?)',
          [lecture.id, concept.concept_name, concept.concept_description, 'Not Started']
        );
        console.log(`Inserted concept ID ${conceptResult.lastID}: ${concept.concept_name}`);
      }

      // Fetch all created concepts to return with the lecture
      concepts = await query(
        'SELECT * FROM concepts WHERE lecture_id = ? ORDER BY id ASC',
        [lecture.id]
      );

      console.log(`Successfully generated and saved ${concepts.length} concepts for lecture ID ${lecture.id}`);
    } catch (error) {
      // Log error but don't fail the entire request
      console.error('Error generating concepts:', error.message);
      conceptsGenerationError = error.message;

      // Lecture is still created successfully even if concept generation fails
      // This provides a better user experience - they can manually add concepts or retry
    }

    // Return lecture with generated concepts (or empty array if generation failed)
    const response = {
      ...lecture,
      concepts: concepts
    };

    // Include error information if concept generation failed
    if (conceptsGenerationError) {
      response.concepts_generation_error = conceptsGenerationError;
    }

    this.sendSuccess(res, response, 201);
  });

  /**
   * Get all lectures for a course
   * GET /api/lectures/:courseId
   */
  getLectures = this.asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Validate courseId is a positive integer (Critical Issue #1)
    const parsedCourseId = parseInt(courseId, 10);
    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
      return this.sendError(res, 'Invalid course ID', 400);
    }

    // Verify course exists
    const courses = await query(
      'SELECT * FROM courses WHERE id = ?',
      [parsedCourseId]
    );

    if (courses.length === 0) {
      return this.sendError(res, 'Course not found', 404);
    }

    // Fetch all lectures for the course, sorted by most recent first
    const lectures = await query(
      'SELECT * FROM lectures WHERE course_id = ? ORDER BY created_at DESC',
      [parsedCourseId]
    );

    this.sendSuccess(res, lectures);
  });

  /**
   * Delete a lecture
   * DELETE /api/lectures/:id
   * Cascades to delete all associated concepts
   */
  deleteLecture = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID is a positive integer (Critical Issue #1)
    const lectureId = parseInt(id, 10);
    if (!Number.isInteger(lectureId) || lectureId <= 0) {
      return this.sendError(res, 'Invalid lecture ID', 400);
    }

    // Check if lecture exists
    const lectures = await query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (lectures.length === 0) {
      return this.sendError(res, 'Lecture not found', 404);
    }

    // Delete the lecture (CASCADE will delete related concepts)
    await run('DELETE FROM lectures WHERE id = ?', [lectureId]);

    this.sendSuccess(res, {
      message: 'Lecture deleted successfully',
      id: lectureId
    });
  });
}

module.exports = new LectureController();
