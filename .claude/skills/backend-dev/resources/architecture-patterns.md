# Architecture & Core Patterns - Super Feynman Backend

Complete guide to backend architecture patterns and best practices for Super Feynman.

---

## Architecture Overview

### Layered Architecture

```
HTTP Request
    ↓
Routes (routing only)
    ↓
Controllers (request/response handling)
    ↓
Services (business logic)
    ↓
Database (SQLite via better-sqlite3)
```

**Golden Rule:** Each layer has ONE responsibility.

- **Routes**: Define endpoints, attach middleware, delegate to controllers
- **Controllers**: Parse requests, call services, format responses
- **Services**: Business logic, orchestrate operations
- **Database**: Data persistence

---

## Core Pattern 1: Routes Only Route

Routes should ONLY:
- ✅ Define endpoints
- ✅ Attach middleware
- ✅ Delegate to controllers

Routes should NEVER:
- ❌ Contain business logic
- ❌ Access database directly
- ❌ Process complex data

### Example: Clean Route File

```javascript
// routes/courseRoutes.js
const express = require('express');
const CourseController = require('../controllers/CourseController');

const router = express.Router();
const controller = new CourseController();

// ✅ GOOD: Clean delegation
router.get('/', (req, res) => controller.getCourses(req, res));
router.post('/', (req, res) => controller.createCourse(req, res));
router.delete('/:id', (req, res) => controller.deleteCourse(req, res));

module.exports = router;
```

---

## Core Pattern 2: BaseController

All controllers extend BaseController for consistent error handling and response formatting.

### BaseController Implementation

```javascript
// controllers/BaseController.js
class BaseController {
    /**
     * Send success response
     */
    success(res, data, message = null, statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    /**
     * Send error response
     */
    error(res, error, context, statusCode = 500) {
        console.error(`[${context}] Error:`, error);

        res.status(statusCode).json({
            success: false,
            error: {
                message: error.message || 'An error occurred',
                code: statusCode
            }
        });
    }

    /**
     * Validate required fields
     */
    validateRequired(fields, data, res) {
        const missing = fields.filter(field => !data[field]);

        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required fields',
                    details: { missing }
                }
            });
            return false;
        }
        return true;
    }
}

module.exports = BaseController;
```

### Using BaseController

```javascript
// controllers/CourseController.js
const BaseController = require('./BaseController');
const courseService = require('../services/courseService');

class CourseController extends BaseController {
    async getCourses(req, res) {
        try {
            const courses = await courseService.getAllCourses();
            this.success(res, courses);
        } catch (error) {
            this.error(res, error, 'getCourses');
        }
    }

    async createCourse(req, res) {
        try {
            const { name } = req.body;

            if (!this.validateRequired(['name'], req.body, res)) {
                return;
            }

            const course = await courseService.createCourse(name);
            this.success(res, course, 'Course created', 201);
        } catch (error) {
            this.error(res, error, 'createCourse');
        }
    }

    async deleteCourse(req, res) {
        try {
            await courseService.deleteCourse(req.params.id);
            this.success(res, null, 'Course deleted');
        } catch (error) {
            this.error(res, error, 'deleteCourse', 404);
        }
    }
}

module.exports = CourseController;
```

---

## Core Pattern 3: Services Contain Business Logic

Services handle all business logic, validation, and orchestration.

```javascript
// services/courseService.js
const db = require('../db/database');
const queries = require('../db/queries');

class CourseService {
    async getAllCourses() {
        return queries.getAllCourses();
    }

    async createCourse(name) {
        if (!name || name.trim().length === 0) {
            throw new Error('Course name is required');
        }

        return queries.createCourse(name);
    }

    async deleteCourse(courseId) {
        const course = queries.getCourseById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        // Delete associated lectures and concepts
        queries.deleteLecturesByCourseId(courseId);
        return queries.deleteCourse(courseId);
    }
}

module.exports = new CourseService();
```

---

## Project Structure

```
backend/src/
├── controllers/
│   ├── BaseController.js          # Base class for all controllers
│   ├── CourseController.js
│   ├── LectureController.js
│   └── ConceptController.js
├── services/
│   ├── courseService.js
│   ├── lectureService.js
│   ├── conceptService.js
│   ├── anthropicService.js        # Claude API integration
│   └── whisperService.js          # OpenAI Whisper integration
├── routes/
│   ├── courseRoutes.js
│   ├── lectureRoutes.js
│   └── conceptRoutes.js
├── db/
│   ├── database.js                # SQLite connection
│   ├── schema.sql                 # Database schema
│   └── queries.js                 # SQL query functions
├── middleware/
│   ├── errorHandler.js
│   ├── upload.js                  # Multer config
│   └── validation.js
├── utils/
│   ├── logger.js
│   └── asyncHandler.js
├── app.js                         # Express setup
└── server.js                      # HTTP server
```

---

## File Naming Conventions

### Backend

- **Controllers**: `PascalCase` - `CourseController.js`
- **Services**: `camelCase` - `courseService.js`
- **Routes**: `camelCase + Routes` - `courseRoutes.js`
- **Database**: `camelCase` - `database.js`, `queries.js`
- **Middleware**: `camelCase` - `errorHandler.js`
- **Utilities**: `camelCase` - `logger.js`

---

## Module Organization

### Service Exports

```javascript
// services/courseService.js
class CourseService {
    // methods
}

// Export a singleton instance
module.exports = new CourseService();

// OR export the class itself for testing
module.exports = CourseService;
```

---

## Best Practices

✅ **DO:**
- Use layered architecture (Routes → Controllers → Services → DB)
- Extend BaseController for all controllers
- Keep routes clean (just routing)
- Put business logic in services
- Validate inputs at service layer
- Log errors with context

❌ **DON'T:**
- Put business logic in routes
- Access database directly from controllers
- Skip input validation
- Use generic error messages
- Mix concerns across layers
