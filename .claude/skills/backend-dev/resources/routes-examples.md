# Routes & Complete Examples - Super Feynman Backend

Complete examples of routes, controllers, and full implementations.

---

## Complete Route File

```javascript
// routes/courseRoutes.js
const express = require('express');
const CourseController = require('../controllers/CourseController');

const router = express.Router();
const controller = new CourseController();

router.get('/', (req, res) => controller.getCourses(req, res));
router.post('/', (req, res) => controller.createCourse(req, res));
router.delete('/:id', (req, res) => controller.deleteCourse(req, res));

module.exports = router;
```

---

## Complete Controller Example

```javascript
// controllers/LectureController.js
const BaseController = require('./BaseController');
const lectureService = require('../services/lectureService');

class LectureController extends BaseController {
    async getLectures(req, res) {
        try {
            const { courseId } = req.params;
            const lectures = await lectureService.getLecturesByCourseId(courseId);
            this.success(res, lectures);
        } catch (error) {
            this.error(res, error, 'getLectures');
        }
    }

    async createLecture(req, res) {
        try {
            const { courseId, name, fileContent } = req.body;

            // Validate
            if (!this.validateRequired(['courseId', 'name', 'fileContent'], req.body, res)) {
                return;
            }

            const lecture = await lectureService.createLectureWithConcepts(
                courseId,
                name,
                fileContent
            );

            this.success(res, lecture, 'Lecture created successfully', 201);
        } catch (error) {
            this.error(res, error, 'createLecture');
        }
    }

    async deleteLecture(req, res) {
        try {
            const { id } = req.params;
            await lectureService.deleteLecture(id);
            this.success(res, null, 'Lecture deleted successfully');
        } catch (error) {
            this.error(res, error, 'deleteLecture', 404);
        }
    }
}

module.exports = LectureController;
```

---

## Complete Service Example

### Service with External API Integration

```javascript
// services/lectureService.js
const queries = require('../db/queries');
const anthropicService = require('./anthropicService');

class LectureService {
    async getLecturesByCourseId(courseId) {
        return queries.getLecturesByCourseId(courseId);
    }

    async createLectureWithConcepts(courseId, name, fileContent) {
        // 1. Create lecture in database
        const lecture = queries.createLecture(courseId, name, fileContent);

        // 2. Generate concepts using Claude API
        try {
            const concepts = await anthropicService.generateConcepts(fileContent);

            // 3. Save concepts to database
            for (const concept of concepts) {
                queries.createConcept(
                    lecture.id,
                    concept.concept_name,
                    concept.concept_description
                );
            }

            // 4. Fetch and return lecture with concepts
            return {
                ...lecture,
                concepts: queries.getConceptsByLectureId(lecture.id)
            };
        } catch (error) {
            console.error('[LectureService] Failed to generate concepts:', error);
            // Return lecture without concepts if API fails
            return lecture;
        }
    }

    async deleteLecture(lectureId) {
        const lecture = queries.getLectureById(lectureId);
        if (!lecture) {
            throw new Error('Lecture not found');
        }
        return queries.deleteLecture(lectureId);
    }
}

module.exports = new LectureService();
```

---

## Controller Template

```javascript
const BaseController = require('./BaseController');
const service = require('../services/yourService');

class YourController extends BaseController {
    async getItems(req, res) {
        try {
            const items = await service.getAll();
            this.success(res, items);
        } catch (error) {
            this.error(res, error, 'getItems');
        }
    }

    async createItem(req, res) {
        try {
            if (!this.validateRequired(['field'], req.body, res)) return;
            const item = await service.create(req.body);
            this.success(res, item, 'Created', 201);
        } catch (error) {
            this.error(res, error, 'createItem');
        }
    }
}

module.exports = YourController;
```

---

## Service Template

```javascript
const queries = require('../db/queries');

class YourService {
    async getAll() {
        return queries.getAllItems();
    }

    async create(data) {
        // Validation
        if (!data.field) {
            throw new Error('Field is required');
        }

        // Business logic
        return queries.createItem(data);
    }
}

module.exports = new YourService();
```

---

## API Endpoint Structure

```
GET    /api/courses                    # Get all courses
POST   /api/courses                    # Create course
DELETE /api/courses/:id                # Delete course

GET    /api/lectures/course/:courseId  # Get lectures for course
POST   /api/lectures                   # Create lecture (with concepts)
DELETE /api/lectures/:id               # Delete lecture

GET    /api/concepts/lecture/:lectureId  # Get concepts for lecture
PATCH  /api/concepts/:id/progress       # Update concept progress
DELETE /api/concepts/:id                # Delete concept

POST   /api/concepts/review/start      # Start review session
POST   /api/concepts/review/continue   # Continue conversation
POST   /api/concepts/review/end        # End session & get feedback

POST   /api/transcribe                 # Transcribe audio to text
```

---

## Testing Routes

### Test with curl

```bash
# Get all courses
curl http://localhost:3001/api/courses

# Create a course
curl -X POST http://localhost:3001/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Physics 101"}'

# Delete a course
curl -X DELETE http://localhost:3001/api/courses/1

# Upload lecture with file
curl -X POST http://localhost:3001/api/lectures \
  -F "file=@lecture-notes.txt" \
  -F "courseId=1" \
  -F "name=Lecture 1"
```

### Health Check

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## HTTP Status Codes

| Code | Use Case |
|------|----------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |

---

## Best Practices

✅ **DO:**
- Keep routes simple and focused
- Use appropriate HTTP methods
- Return consistent response formats
- Include status codes
- Validate inputs before processing
- Log errors with context
- Test endpoints with curl

❌ **DON'T:**
- Put business logic in routes
- Return different response formats
- Skip error handling
- Use generic error messages
- Forget to validate inputs
- Mix HTTP methods improperly
