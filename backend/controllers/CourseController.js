const BaseController = require('./BaseController');
const { query, run } = require('../database/db');

/**
 * CourseController - Handles all course-related operations
 *
 * Endpoints:
 * - POST /api/courses - Create a new course
 * - GET /api/courses - Get all courses
 * - DELETE /api/courses/:id - Delete a course (cascades to lectures and concepts)
 */
class CourseController extends BaseController {
  /**
   * Create a new course
   * POST /api/courses
   * Body: { name: string }
   */
  createCourse = this.asyncHandler(async (req, res) => {
    const { name } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return this.sendError(res, 'Course name is required and must be a non-empty string', 400);
    }

    // Insert course into database (Critical Issue #5 - removed try-catch, asyncHandler handles errors)
    const result = await run(
      'INSERT INTO courses (name) VALUES (?)',
      [name.trim()]
    );

    // Fetch the created course
    const courses = await query(
      'SELECT * FROM courses WHERE id = ?',
      [result.lastID]
    );

    const course = courses[0];

    this.sendSuccess(res, course, 201);
  });

  /**
   * Get all courses
   * GET /api/courses
   */
  getCourses = this.asyncHandler(async (req, res) => {
    // Fetch all courses, sorted by most recent first (Critical Issue #5 - removed try-catch)
    const courses = await query(
      'SELECT * FROM courses ORDER BY created_at DESC'
    );

    this.sendSuccess(res, courses);
  });

  /**
   * Delete a course
   * DELETE /api/courses/:id
   * Cascades to delete all associated lectures and concepts
   */
  deleteCourse = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID is a positive integer (Critical Issue #1)
    const courseId = parseInt(id, 10);
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return this.sendError(res, 'Invalid course ID', 400);
    }

    // Check if course exists (Critical Issue #5 - removed try-catch)
    const courses = await query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (courses.length === 0) {
      return this.sendError(res, 'Course not found', 404);
    }

    // Delete the course (CASCADE will delete related lectures and concepts)
    await run('DELETE FROM courses WHERE id = ?', [courseId]);

    this.sendSuccess(res, {
      message: 'Course deleted successfully',
      id: courseId
    });
  });
}

module.exports = new CourseController();
