const express = require('express');
const router = express.Router();
const courseController = require('../controllers/CourseController');

/**
 * Course Routes
 *
 * POST   /api/courses     - Create a new course
 * GET    /api/courses     - Get all courses
 * DELETE /api/courses/:id - Delete a course
 */

// Create a new course
router.post('/', courseController.createCourse);

// Get all courses
router.get('/', courseController.getCourses);

// Delete a course
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
