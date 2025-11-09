# Super Feynman MVP - Context

**Last Updated:** 2025-11-08

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

### 🟡 IN PROGRESS
- Phase 2: Backend API - Core CRUD Operations (READY TO START)

### ⏳ NOT STARTED
- Phase 3: AI Integrations (Anthropic & Whisper)
- Phase 4: Frontend Integration
- Phase 5-8: Feature completion, error handling, testing, deployment

### ⚠️ BLOCKERS
- None currently
- Will need API keys before testing Phase 3

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

### Files to Create (Implementation)

**Backend Structure:**
```
backend/
├── server.js                    # Express app entry point
├── database/
│   ├── schema.sql               # SQLite schema (4 tables)
│   ├── db.js                    # Database connection & helpers
│   └── superfeynman.db          # SQLite database file
├── routes/
│   ├── courseRoutes.js          # Course CRUD endpoints
│   ├── lectureRoutes.js         # Lecture + file upload endpoints
│   ├── conceptRoutes.js         # Concept management endpoints
│   ├── reviewSessionRoutes.js   # Review session endpoints
│   └── transcribeRoutes.js      # Whisper transcription endpoint
├── controllers/
│   ├── BaseController.js        # Error handling base class
│   ├── CourseController.js      # Course business logic
│   ├── LectureController.js     # Lecture + concept gen logic
│   ├── ConceptController.js     # Concept management logic
│   └── ReviewSessionController.js # Review session logic
├── services/
│   ├── anthropicService.js      # Concept gen, conversation, feedback
│   ├── conversationService.js   # Session management
│   └── whisperService.js        # Audio transcription
├── middleware/
│   └── upload.js                # Multer configuration
└── uploads/                     # Temporary file storage
```

**Frontend Structure:**
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

---

## Technical Constraints

### API Rate Limits
- **Anthropic:** Need to implement exponential backoff
- **OpenAI Whisper:** Monitor usage, may need to limit recording length
- **Solution:** Cache responses during development, add retry logic

### File Upload Limits
- **Max size:** 5MB for .txt files
- **Validation:** Frontend and backend must both check
- **Formats:** Only .txt accepted (no .docx, .pdf)

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
- **Services:** Business logic, API calls
- **Database:** Data access layer

### BaseController Pattern
- Provides `asyncHandler`, `sendSuccess`, `sendError`
- Consistent error handling across all endpoints
- DRY principle

### Service Layer for AI
- Separate services for Anthropic and Whisper
- Makes testing easier (can mock services)
- Reusable across multiple controllers

---

## Data Flow

### Concept Generation Flow
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

### Review Session Flow
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
# Open http://localhost:3000
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
DATABASE_PATH=./backend/database/superfeynman.db
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
- Ensure backend has `app.use(cors())`
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
- Implement exponential backoff
- Add console.log to see exact error

### Issue: Multer not receiving file
**Symptom:** req.file is undefined
**Solution:**
- Check FormData in frontend has file appended correctly
- Verify Multer middleware is on the route
- Check file input has `name="file"` matching Multer config
- Use Postman to test upload independently

### Issue: MediaRecorder not supported
**Symptom:** "MediaRecorder is not defined" error
**Solution:**
- Test in Chrome/Firefox (best support)
- Add feature detection: `if (!navigator.mediaDevices) { ... }`
- Show helpful error message to user
- Fall back to text-only input

---

## Resources & References

### Documentation
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

### Code References in This Repo
- **plan.md** - Complete requirements
- **figma-mocks/** - All UI components
- **super-feynman-mvp-plan.md** - Detailed implementation plan
- **super-feynman-mvp-tasks.md** - Task checklist

---

## Update Log

**2025-11-08:**
- Created dev docs structure
- Analyzed existing codebase
- Reviewed figma-mocks components
- Created comprehensive plan
- Ready to begin implementation

---

**Next Update:** After completing Phase 1, Task 1.1
