---
name: backend-dev
description: Backend development guide for Super Feynman using Express.js, JavaScript, and SQLite. Use when creating routes, controllers, services, database operations, file uploads, or working with backend APIs. Covers layered architecture (routes → controllers → services → database), BaseController pattern, error handling, and SQLite integration.
---

# Backend Development - Super Feynman

## Purpose

Provide Express.js + JavaScript + SQLite patterns specifically for the Super Feynman learning application backend.

## When to Use This Skill

Automatically activates when:
- Creating or modifying routes, endpoints, APIs
- Building controllers or services
- Implementing database operations with SQLite
- Setting up file uploads (Multer)
- Error handling in backend
- Backend testing
- Working with lecture notes or concepts

---

## Quick Start

### New Backend Feature Checklist

- [ ] **Route**: Clean definition, delegate to controller
- [ ] **Controller**: Extend BaseController
- [ ] **Service**: Business logic
- [ ] **Database**: SQLite queries via better-sqlite3
- [ ] **Validation**: Input validation
- [ ] **Error Handling**: Proper try-catch and logging
- [ ] **Testing**: Test with curl or Postman

---

## Architecture Overview

### Layered Architecture

\`\`\`
HTTP Request
    ↓
Routes (routing only)
    ↓
Controllers (request/response handling)
    ↓
Services (business logic)
    ↓
Database (SQLite via better-sqlite3)
\`\`\`

**Golden Rule:** Each layer has ONE responsibility.

---

## Core Patterns

### 1. Routes Only Route

Routes should ONLY:
- ✅ Define endpoints
- ✅ Attach middleware
- ✅ Delegate to controllers

Routes should NEVER:
- ❌ Contain business logic
- ❌ Access database directly
- ❌ Process complex data

**Example:**

\`\`\`javascript
// routes/courseRoutes.js
const express = require('express');
const CourseController = require('../controllers/CourseController');

const router = express.Router();
const controller = new CourseController();

router.get('/', (req, res) => controller.getCourses(req, res));
router.post('/', (req, res) => controller.createCourse(req, res));
router.delete('/:id', (req, res) => controller.deleteCourse(req, res));

module.exports = router;
\`\`\`

### 2. BaseController Pattern

All controllers extend BaseController for consistent error handling.

\`\`\`javascript
class CourseController extends BaseController {
    async getCourses(req, res) {
        try {
            const courses = await courseService.getAllCourses();
            this.success(res, courses);
        } catch (error) {
            this.error(res, error, 'getCourses');
        }
    }
}
\`\`\`

### 3. Services Contain Business Logic

\`\`\`javascript
// services/courseService.js
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
}

module.exports = new CourseService();
\`\`\`

---

## Directory Structure

\`\`\`
backend/src/
├── controllers/
│   ├── BaseController.js
│   ├── CourseController.js
│   ├── LectureController.js
│   └── ConceptController.js
├── services/
│   ├── courseService.js
│   ├── lectureService.js
│   ├── conceptService.js
│   └── anthropicService.js
├── routes/
│   ├── courseRoutes.js
│   ├── lectureRoutes.js
│   └── conceptRoutes.js
├── db/
│   ├── database.js
│   ├── schema.sql
│   └── queries.js
├── middleware/
│   ├── errorHandler.js
│   ├── upload.js
│   └── rateLimiter.js
├── utils/
├── app.js
└── server.js
\`\`\`

---

## Navigation Guide

For detailed implementations, see the resources:

| Need to... | Resource File |
|------------|--------------|
| Complete backend overview | [complete-backend-guide.md](resources/complete-backend-guide.md) |
| Architecture & core patterns | [architecture-patterns.md](resources/architecture-patterns.md) |
| SQLite database setup & queries | [database-sqlite.md](resources/database-sqlite.md) |
| Error handling & middleware | [error-handling-middleware.md](resources/error-handling-middleware.md) |
| Routes & complete examples | [routes-examples.md](resources/routes-examples.md) |

---

## Quick Reference

### HTTP Status Codes

| Code | Use Case |
|------|----------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

### Common Imports

\`\`\`javascript
const express = require('express');
const { Request, Response } = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
\`\`\`

---

## Best Practices

✅ **DO:**
- Use layered architecture
- Extend BaseController
- Validate all inputs
- Handle all errors
- Use prepared statements (SQLite)
- Log with context

❌ **DON'T:**
- Put business logic in routes
- Access database from controllers
- Skip error handling
- Use string concatenation for SQL
- Forget input validation

---

## Related Skills

- **api-integration** - Anthropic and Whisper API patterns for Super Feynman
- **frontend-dev** - React frontend that consumes these APIs

---

**Skill Status**: Optimized for Super Feynman hackathon ✅
**Progressive Disclosure**: See resources/ for detailed guides ✅
