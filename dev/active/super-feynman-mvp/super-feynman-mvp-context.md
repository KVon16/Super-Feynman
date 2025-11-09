# Super Feynman MVP - Context

**Last Updated:** 2025-11-09

---

## SESSION PROGRESS

### ✅ COMPLETED
- Analyzed existing codebase and figma-mocks
- Reviewed complete specifications in plan.md
- Created comprehensive implementation plan (super-feynman-mvp-plan.md)
- Created this context document
- Established dev docs structure
- **Phase 1: Backend Foundation & Database (COMPLETE)**
  - Task 1.1: Backend structure, npm, dependencies, server.js
  - Task 1.2: Database schema, db.js helpers, init.js script
- **Phase 2: Backend API - Core CRUD Operations (COMPLETE)**
  - Task 2.1: Express server setup with BaseController, CORS, rate limiting
  - Task 2.2: Course Management API (POST, GET, DELETE)
  - Task 2.3: Lecture Management API with file upload (POST, GET, DELETE)
  - Task 2.4: Concept Management API (GET, PATCH, DELETE)
  - **Security Hardening:** All 6 critical + 6 high-priority issues resolved
  - **Code Review:** Completed with code-architecture-reviewer agent

### 🟡 IN PROGRESS
- Phase 3: AI Integrations (Task 3.1 COMPLETE, 3.2-3.4 remaining)

### ⏳ NOT STARTED
- Phase 4: Frontend Integration
- Phase 5-8: Feature completion, error handling, testing, deployment

### ⚠️ BLOCKERS
- None currently
- Will need API keys before testing Phase 3

---

## Phase 2 Implementation Summary

**Completed:** 2025-11-09
**Commit:** `9888caf` - "Implement Phase 2: Backend API with CRUD operations and security fixes"
**Branch:** `claude/implement-phase-2-feynman-011CUwTyBJNhMAC2zvDa2Y3s`

### What Was Built

**1. Controllers & Routes**
- **BaseController.js** - Utility base class with asyncHandler, sendSuccess, sendError
- **CourseController.js** - Course CRUD operations
- **LectureController.js** - Lecture CRUD with file upload
- **ConceptController.js** - Concept management and progress tracking
- **courseRoutes.js, lectureRoutes.js, conceptRoutes.js** - Express routes

**2. File Upload System**
- **upload.js** - Multer middleware with:
  - Extension AND MIME type validation (.txt + text/plain)
  - 5MB file size limit
  - Automatic uploads/ directory creation
  - Unique filename generation

**3. Server Configuration (server.js)**
- CORS configured for localhost:5173 (configurable via env)
- Request body size limits (1MB)
- Rate limiting (100 req/15min general, 10 uploads/15min)
- Health check with database connectivity test
- Production-safe error handling
- Graceful shutdown handlers

### Security Fixes Applied

**Critical Issues (6/6):**
1. ✅ Input validation for all numeric IDs (prevents invalid/malicious IDs)
2. ✅ MIME type validation (prevents malicious file uploads)
3. ✅ CourseId validation in lecture creation
4. ✅ Ensured uploads directory exists (prevents runtime errors)
5. ✅ Removed redundant try-catch blocks (cleaner error handling with asyncHandler)
6. ✅ Request body size limits (1MB - prevents DoS attacks)

**High Priority Issues (6/6):**
7. ✅ CORS properly configured (restricted to specific origin)
8. ✅ Rate limiting implemented (100 general + 10 uploads per 15 min)
9. ✅ Improved file cleanup error handling (logs warnings instead of silent failures)
10. ✅ Fixed information disclosure (hides internal errors in production)
11. ✅ File content size & binary validation (5MB limit + binary detection)
12. ✅ Enhanced health check (includes database connectivity test)

### API Endpoints Available

**Courses:**
- `POST /api/courses` - Create course
- `GET /api/courses` - List all courses
- `DELETE /api/courses/:id` - Delete course (cascades)

**Lectures:**
- `POST /api/lectures` - Upload lecture with .txt file
- `GET /api/lectures/:courseId` - List lectures for course
- `DELETE /api/lectures/:id` - Delete lecture (cascades)

**Concepts:**
- `GET /api/concepts/:lectureId` - List concepts for lecture
- `PATCH /api/concepts/:id/progress` - Update concept progress
- `DELETE /api/concepts/:id` - Delete concept

**System:**
- `GET /health` - Health check with DB connectivity

### Dependencies Added
- `express-rate-limit` - API rate limiting

---

## Phase 3.1 Implementation Summary

**Completed:** 2025-11-09 (Afternoon)
**Status:** Task 3.1 Complete - Concept Generation Working

### What Was Built

**1. Anthropic Service**
- **anthropicService.js** - AI concept generation service with:
  - Anthropic client initialization with API key
  - `generateConcepts(fileContent)` function
  - Prompt engineering for 5-15 concept extraction
  - JSON response parsing with markdown code block stripping
  - Comprehensive input validation
  - Exponential backoff retry logic (3 retries: 1s, 2s, 4s)
  - Error handling for rate limits, invalid JSON, API key errors

**2. LectureController Integration**
- Modified `createLecture()` method to:
  - Call `anthropicService.generateConcepts()` after lecture creation
  - Insert generated concepts into database with "Not Started" status
  - Return lecture with populated concepts array
  - Gracefully handle concept generation failures (lecture still saved)
  - Include error messages in response when concept generation fails

**3. Key Implementation Details**
- **Markdown Stripping:** Claude wraps JSON in ```json...``` code blocks - added regex to strip these
- **Graceful Degradation:** If concept generation fails, lecture is still saved and returned
- **Database Integration:** Each concept automatically linked to lecture via lecture_id foreign key
- **Validation:** Response format validated, invalid concepts filtered out
- **Logging:** Comprehensive console logs for debugging

### Testing Results

**Test 1: Medium-Sized Lecture (2911 characters)**
- Topic: Machine Learning Fundamentals - Supervised Learning
- Result: ✅ 12 concepts generated successfully
- Concepts included: Supervised Learning Definition, Classification Problems, Regression Problems, Loss Function, Overfitting, Underfitting, Train-Test Split, Cross-Validation, Regularization, Feature Engineering
- All concepts relevant and well-described

**Test 2: Short Lecture (709 characters)**
- Topic: Binary Search Trees
- Result: ✅ Concepts generated (first attempt had JSON parsing issue, fixed)
- Expected: 5-7 concepts (BST structure, properties, time complexity, traversals)

### Issues Fixed
1. **Missing Dependency:** Installed `express-rate-limit` package
2. **JSON Parsing:** Added markdown code block stripping for Claude responses
3. **Error Handling:** Lecture creation doesn't fail if concept generation fails

### API Endpoints Updated
- `POST /api/lectures` now returns:
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "course_id": 1,
      "name": "Lecture Name",
      "file_content": "...",
      "created_at": "2025-11-09 04:09:21",
      "concepts": [
        {
          "id": 1,
          "lecture_id": 2,
          "concept_name": "Concept Name",
          "concept_description": "Description...",
          "progress_status": "Not Started",
          "last_reviewed": null,
          "created_at": "2025-11-09 04:09:31"
        }
      ]
    }
  }
  ```

---

## Key Files & Their Purposes

### Existing Files (Already Built)

**figma-mocks/App.tsx**
- Main application component with screen routing
- Currently uses mock data and localStorage
- Contains simulated concept extraction and AI responses
- **Next action:** Will be moved to frontend/src/App.tsx and updated to use real APIs

**figma-mocks/components/Home.tsx**
- Home screen with course list and empty state
- Handles course creation/deletion
- **Status:** Complete UI, needs API integration

**figma-mocks/components/CourseView.tsx**
- Shows lectures within a course
- Handles lecture creation/deletion
- **Status:** Complete UI, needs API integration

**figma-mocks/components/LectureView.tsx**
- Displays concepts for a lecture
- Triggers audience selection popup
- **Status:** Complete UI, needs API integration

**figma-mocks/components/ReviewSession.tsx**
- Chat interface for conversational review
- Has mock AI response simulation
- Has placeholder for audio recording (not yet implemented)
- **Status:** UI complete, needs real API + MediaRecorder implementation

**figma-mocks/components/FeedbackScreen.tsx**
- Shows structured feedback after session
- Displays progress status change
- **Status:** Complete UI, needs real feedback data

**figma-mocks/components/AddCourseDialog.tsx**
- Modal for creating new course
- **Status:** Complete, ready to use

**figma-mocks/components/AddLectureDialog.tsx**
- Modal for creating lecture with file upload
- Has file picker UI
- **Status:** Complete UI, needs real file upload

**figma-mocks/components/AudienceSelectionDialog.tsx**
- Modal for selecting audience level (classmate/middleschooler/kid)
- **Status:** Complete, ready to use

**figma-mocks/components/StatusBadge.tsx**
- Displays color-coded progress status
- **Status:** Complete, may need color tweaking

**figma-mocks/globals.css**
- Complete design system with CSS variables
- Colors: Primary (#CC785C), Background (#FAF7F5), etc.
- **Status:** Complete, ready to use

**figma-mocks/components/ui/**
- shadcn/ui component library (button, dialog, card, etc.)
- **Status:** Complete, ready to use

**plan.md**
- Complete feature specifications
- Database schema
- API endpoint definitions
- UI/UX requirements
- All 8 screens detailed
- **Use as:** Reference for requirements

### Files Created (Phase 1 & 2)

**Backend Structure:**
```
backend/
├── server.js                    # ✅ Express app with security hardening
├── database/
│   ├── schema.sql               # ✅ SQLite schema (4 tables)
│   ├── db.js                    # ✅ Database connection & helpers
│   ├── init.js                  # ✅ Initialization script
│   └── superfeynman.db          # ✅ SQLite database file
├── routes/
│   ├── courseRoutes.js          # ✅ Course CRUD endpoints
│   ├── lectureRoutes.js         # ✅ Lecture + file upload endpoints
│   └── conceptRoutes.js         # ✅ Concept management endpoints
├── controllers/
│   ├── BaseController.js        # ✅ Error handling base class
│   ├── CourseController.js      # ✅ Course business logic
│   ├── LectureController.js     # ✅ Lecture + file handling
│   └── ConceptController.js     # ✅ Concept management logic
├── middleware/
│   └── upload.js                # ✅ Multer file upload configuration
├── services/                    # ⏳ Phase 3
├── uploads/                     # ✅ Temporary file storage (auto-created)
└── .env                         # ✅ Environment configuration
```

**Frontend Structure (Phase 4):**
```
frontend/
├── src/
│   ├── App.tsx                  # Moved from figma-mocks, API integrated
│   ├── components/              # All components from figma-mocks
│   ├── services/
│   │   └── api.ts               # Backend API client
│   └── globals.css              # Design system
└── .env                         # API_URL configuration
```

---

## Important Decisions & Rationale

### Backend-First Approach
**Decision:** Build and test backend APIs before frontend integration
**Rationale:**
- Can test APIs independently with curl/Postman
- Reduces debugging complexity
- Frontend mocks already complete and working

### Leverage Existing Mocks
**Decision:** Use figma-mocks as-is, minimal changes
**Rationale:**
- Complete, working UI already built
- Only need to swap mock data for real API calls
- Saves 50% of development time

### SQLite for MVP
**Decision:** Use SQLite instead of PostgreSQL/MySQL
**Rationale:**
- Zero configuration needed
- Perfect for MVP and local development
- Easy to inspect with SQLite browser
- Can migrate to PostgreSQL later if needed

### Store File Content in Database
**Decision:** Store .txt file content in database, not filesystem
**Rationale:**
- Simpler backup/restore
- No file path management
- Works well for text files (typically < 100KB)
- Easier to deploy

### In-Memory Session Management
**Decision:** Store review sessions in database, not in-memory
**Rationale:**
- Sessions persist across server restarts
- Can analyze session history later
- Required for feedback generation anyway

### JSON Storage for Conversations
**Decision:** Store conversation_history and feedback as JSON TEXT in SQLite
**Rationale:**
- SQLite has good JSON support
- Easier than creating conversation_messages table
- Keeps schema simple for MVP

### AsyncHandler Pattern Over Try-Catch
**Decision:** Use asyncHandler wrapper instead of try-catch in every controller method
**Rationale:**
- Cleaner code (removes redundant try-catch blocks)
- Consistent error handling
- Errors automatically passed to Express error middleware
- Follows Express.js best practices

---

## Technical Constraints

### API Rate Limits
- **Anthropic:** Need to implement exponential backoff
- **OpenAI Whisper:** Monitor usage, may need to limit recording length
- **Solution:** Cache responses during development, add retry logic

### File Upload Limits
- **Max size:** 5MB for .txt files
- **Validation:** Frontend and backend both check
- **Formats:** Only .txt accepted (no .docx, .pdf)
- **MIME validation:** Both extension AND MIME type checked

### Browser Compatibility
- **MediaRecorder API:** Not supported in all browsers
- **Solution:** Feature detection, graceful degradation to text-only

### Audio Format
- **Browser records:** Usually webm or mp3
- **Whisper accepts:** Multiple formats (webm, mp3, wav, m4a)
- **Solution:** Send browser's native format, let Whisper handle it

---

## Architecture Decisions

### Layered Backend Architecture
```
Routes → Controllers → Services → Database
```
- **Routes:** Define endpoints, attach middleware
- **Controllers:** Handle HTTP requests/responses, validation
- **Services:** Business logic, API calls (Phase 3)
- **Database:** Data access layer

### BaseController Pattern
- Provides `asyncHandler`, `sendSuccess`, `sendError`
- Consistent error handling across all endpoints
- DRY principle
- Removes need for repetitive try-catch blocks

### Service Layer for AI (Phase 3)
- Separate services for Anthropic and Whisper
- Makes testing easier (can mock services)
- Reusable across multiple controllers

---

## Data Flow

### Concept Generation Flow (Phase 3)
```
1. User uploads .txt file via AddLectureDialog
2. Frontend sends FormData to POST /api/lectures
3. Backend saves lecture to database
4. Backend reads file content
5. Backend calls Anthropic API via anthropicService
6. Anthropic returns 5-15 concepts as JSON
7. Backend saves each concept to database
8. Backend returns lecture + concepts to frontend
9. Frontend navigates to LectureView showing concepts
```

### Review Session Flow (Phase 3)
```
1. User clicks concept → AudienceSelectionDialog
2. User selects audience → POST /api/review-sessions
3. Backend creates session, generates initial AI message
4. Frontend displays chat with first message
5. User types or speaks response
6. If speaking:
   - Frontend records audio with MediaRecorder
   - POST /api/transcribe with audio blob
   - Backend calls Whisper API
   - Returns text, displayed in input
7. User sends message → POST /api/review-sessions/:id/message
8. Backend calls Anthropic with conversation history
9. Anthropic returns response
10. Backend saves to session, returns to frontend
11. Repeat steps 5-10 for 5-10 turns
12. User clicks "End Session" → POST /api/review-sessions/:id/end
13. Backend analyzes conversation with Anthropic
14. Backend updates concept progress status
15. Returns feedback → Frontend shows FeedbackScreen
```

---

## Quick Resume Instructions

### If Context Resets Mid-Implementation

1. **Check SESSION PROGRESS** (top of this file) to see what's done
2. **Read super-feynman-mvp-tasks.md** to see checklist
3. **Review super-feynman-mvp-plan.md** for detailed task descriptions

### To Continue Implementation

**Current Status: Phase 2 Complete ✅**
- Backend API fully functional
- All CRUD operations working
- Security hardened
- Ready for Phase 3: AI Integrations

**Next: Phase 3, Task 3.1**
- Create anthropicService.js
- Implement concept generation
- Integrate with POST /api/lectures endpoint

**If backend not started:**
- Start with Phase 1, Task 1.1 (Initialize Backend Structure)
- Follow plan.md step by step

**If backend partially complete:**
- Check tasks.md to see which endpoints are done
- Test existing endpoints with curl/Postman
- Continue with next unchecked task

**If frontend integration in progress:**
- Check which components have real API calls vs mocks
- Test backend APIs are working before blaming frontend
- Use browser DevTools Network tab to debug

### How to Test Progress

**Backend:**
```bash
# Start server
cd backend
npm run dev

# Test health check
curl http://localhost:3001/health

# Test course creation
curl -X POST http://localhost:3001/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Course"}'

# Test lecture upload
curl -X POST http://localhost:3001/api/lectures \
  -F "courseId=1" \
  -F "name=Test Lecture" \
  -F "file=@sample.txt"
```

**Frontend:**
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

**Database:**
```bash
# Inspect database
sqlite3 backend/database/superfeynman.db
.tables
.schema courses
SELECT * FROM courses;
```

---

## Environment Setup

### Required Environment Variables

**Backend (.env):**
```
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DATABASE_PATH=./database/superfeynman.db
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

### Getting API Keys

**Anthropic:**
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Navigate to API Keys
4. Create new key
5. Copy to .env

**OpenAI:**
1. Go to https://platform.openai.com/
2. Sign up / Log in
3. Navigate to API Keys
4. Create new key
5. Copy to .env

---

## Common Issues & Solutions

### Issue: CORS errors
**Symptom:** Browser console shows "CORS policy" error
**Solution:**
- ✅ FIXED in Phase 2: CORS configured for localhost:5173
- Check frontend is making requests to correct URL
- Restart backend server

### Issue: Database locked
**Symptom:** SQLite error "database is locked"
**Solution:**
- Close any SQLite browser tools
- Restart backend server
- Check no other process is using the db file

### Issue: Anthropic API errors
**Symptom:** 401 Unauthorized or rate limit errors
**Solution:**
- Verify API key in .env is correct
- Check API key has credits
- Implement exponential backoff (Phase 3)
- Add console.log to see exact error

### Issue: Multer not receiving file
**Symptom:** req.file is undefined
**Solution:**
- ✅ FIXED in Phase 2: Upload middleware properly configured
- Check FormData in frontend has file appended correctly
- Verify file is .txt with text/plain MIME type
- Use Postman to test upload independently

### Issue: MediaRecorder not supported
**Symptom:** "MediaRecorder is not defined" error
**Solution:**
- Test in Chrome/Firefox (best support)
- Add feature detection: `if (!navigator.mediaDevices) { ... }`
- Show helpful error message to user
- Fall back to text-only input

### Issue: Invalid ID errors
**Symptom:** "Invalid ID" errors in API calls
**Solution:**
- ✅ FIXED in Phase 2: All IDs validated as positive integers
- Check ID is numeric, not string like "abc"
- Check ID is positive, not negative

### Issue: File upload rejected
**Symptom:** "Only .txt files allowed" error
**Solution:**
- ✅ FIXED in Phase 2: Both extension and MIME type validated
- Ensure file has .txt extension
- Ensure file MIME type is text/plain
- Check file size is under 5MB

---

## Resources & References

### Documentation
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)

### Code References in This Repo
- **plan.md** - Complete requirements
- **figma-mocks/** - All UI components
- **super-feynman-mvp-plan.md** - Detailed implementation plan
- **super-feynman-mvp-tasks.md** - Task checklist with status
- **dev/active/phase-2-api-implementation/phase-2-api-implementation-code-review.md** - Code review findings

---

## Update Log

**2025-11-08:**
- Created dev docs structure
- Analyzed existing codebase
- Reviewed figma-mocks components
- Created comprehensive plan
- Ready to begin implementation

**2025-11-09 (Morning):**
- ✅ Completed Phase 2: Backend API with CRUD operations
- ✅ Fixed all 6 critical security issues
- ✅ Fixed all 6 high-priority security issues
- ✅ Code reviewed with code-architecture-reviewer agent
- ✅ Committed and pushed to branch: claude/implement-phase-2-feynman-011CUwTyBJNhMAC2zvDa2Y3s

**2025-11-09 (Afternoon):**
- ✅ Completed Phase 3, Task 3.1: Anthropic API - Concept Generation
- ✅ Created anthropicService.js with generateConcepts() function
- ✅ Integrated concept generation into LectureController
- ✅ Added markdown code block stripping for Claude responses
- ✅ Implemented exponential backoff retry logic (1s, 2s, 4s)
- ✅ Tested with short and medium lecture notes (12 concepts generated)
- ✅ Fixed missing dependency: installed express-rate-limit
- 🔜 Ready to start Phase 3, Task 3.2: Review Conversation

---

**Next Update:** After completing Phase 3, Task 3.2 - Review Conversation
