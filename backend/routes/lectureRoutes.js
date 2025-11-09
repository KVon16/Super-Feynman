const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/LectureController');
const upload = require('../middleware/upload');

/**
 * Lecture Routes
 *
 * POST   /api/lectures           - Create a new lecture with file upload
 * GET    /api/lectures/:courseId - Get all lectures for a course
 * DELETE /api/lectures/:id       - Delete a lecture
 */

// Create a new lecture with file upload
router.post('/', upload.single('file'), lectureController.createLecture);

// Get all lectures for a course
router.get('/:courseId', lectureController.getLectures);

// Delete a lecture
router.delete('/:id', lectureController.deleteLecture);

module.exports = router;
