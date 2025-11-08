# Backend Development Guide - Super Feynman
## Express.js + JavaScript + SQLite

Comprehensive overview and quick reference for Super Feynman backend development.

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

---

## Project Structure

```
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
```

---

## Topic Guide

This guide is organized into specialized topics. Choose what you need:

### 🏗️ Architecture & Core Patterns
**File:** [architecture-patterns.md](architecture-patterns.md)

Topics covered:
- Layered architecture (Routes → Controllers → Services → DB)
- BaseController pattern
- Core routing patterns
- Service layer organization
- Project structure and file naming

### 💾 SQLite Database
**File:** [database-sqlite.md](database-sqlite.md)

Topics covered:
- SQLite setup with better-sqlite3
- Database schema design
- Query functions (CRUD operations)
- Prepared statements
- Transactions and best practices

### ⚙️ Error Handling & Middleware
**File:** [error-handling-middleware.md](error-handling-middleware.md)

Topics covered:
- Global error handler
- Async error wrapper
- File upload with Multer
- Validation middleware
- CORS and logging

### 🛣️ Routes & Examples
**File:** [routes-examples.md](routes-examples.md)

Topics covered:
- Complete route examples
- Controller implementations
- Service examples with API integration
- Testing routes with curl
- HTTP status codes

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

```javascript
const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
```

---

## Best Practices Summary

✅ **DO:**
- Use layered architecture
- Extend BaseController
- Validate all inputs
- Handle all errors
- Use prepared statements (SQLite)
- Log with context
- Keep files under 300 lines

❌ **DON'T:**
- Put business logic in routes
- Access database from controllers
- Skip error handling
- Use string concatenation for SQL
- Forget input validation
- Expose sensitive data in errors

---

## Getting Help

- **Architecture & Patterns**: See [architecture-patterns.md](architecture-patterns.md)
- **Database Issues**: See [database-sqlite.md](database-sqlite.md)
- **Middleware & Errors**: See [error-handling-middleware.md](error-handling-middleware.md)
- **Route Examples**: See [routes-examples.md](routes-examples.md)

Good luck with your hackathon! 🚀
