# Super Feynman MVP - Task Checklist

**Last Updated:** 2025-11-08

---

## Phase 1: Backend Foundation & Database ⏳ IN PROGRESS

**Effort:** M | **Priority:** CRITICAL | **Estimated Time:** 2 hours

### Task 1.1: Initialize Backend Structure ✅ COMPLETED
- [x] Create `/backend` directory
- [x] Initialize npm project (`npm init -y`)
- [x] Install dependencies: express, sqlite3, multer, cors, dotenv, @anthropic-ai/sdk, openai
- [x] Install dev dependencies: nodemon
- [x] Create directory structure (routes, controllers, services, database, middleware, uploads)
- [x] Create `backend/server.js` with basic Express setup
- [x] Create `.env` file with PORT, ANTHROPIC_API_KEY, OPENAI_API_KEY, DATABASE_PATH
- [x] Add backend paths to `.gitignore` (node_modules, .env, uploads/, *.db)
- [x] Add npm scripts: "start" and "dev" with nodemon
- [x] Test: Server starts on port 3001 successfully

**Acceptance:** Backend structure exists, dependencies installed, server starts without errors ✅

---

### Task 1.2: Database Schema Implementation ✅ COMPLETED
- [x] Create `backend/database/schema.sql` with 4 tables:
  - [x] `courses` table (id, name, created_at)
  - [x] `lectures` table (id, course_id, name, file_content, created_at, FK to courses)
  - [x] `concepts` table (id, lecture_id, concept_name, concept_description, progress_status, last_reviewed, created_at, FK to lectures)
  - [x] `review_sessions` table (id, concept_id, audience_level, conversation_history, feedback, created_at, FK to concepts)
- [x] Add ON DELETE CASCADE to all foreign keys
- [x] Create indexes for performance:
  - [x] idx_lectures_course_id
  - [x] idx_concepts_lecture_id
  - [x] idx_concepts_last_reviewed
  - [x] idx_review_sessions_concept_id
- [x] Create `backend/database/db.js` with:
  - [x] Database connection
  - [x] initializeDatabase() function
  - [x] Promisified query() function
  - [x] Promisified run() function
- [x] Create `backend/database/init.js` test script
- [x] Test: Run init script, database file created
- [x] Test: Open database in SQLite browser, verify schema

**Acceptance:** Database created with all tables, foreign keys, and indexes. Query/run helpers work. ✅

---

## Phase 2: Backend API - Core CRUD Operations ⏳ NOT STARTED

**Effort:** M | **Priority:** HIGH | **Estimated Time:** 3 hours

### Task 2.1: Express Server Setup & Base Controller
- [ ] Create `backend/server.js` with:
  - [ ] CORS middleware
  - [ ] JSON body parser
  - [ ] URL-encoded body parser
  - [ ] Database initialization call
  - [ ] Route imports (courses, lectures, concepts, review-sessions, transcribe)
  - [ ] Error handling middleware
  - [ ] Server listen on PORT
- [ ] Create `backend/controllers/BaseController.js` with:
  - [ ] asyncHandler(fn) method
  - [ ] sendSuccess(res, data, status) method
  - [ ] sendError(res, message, status) method
- [ ] Test: Server starts successfully
- [ ] Test: CORS allows requests from frontend origin
- [ ] Test: 404 for unknown routes

**Acceptance:** Server runs, CORS works, BaseController provides error handling utilities

---

### Task 2.2: Course Management API
- [ ] Create `backend/routes/courseRoutes.js`
- [ ] Create `backend/controllers/CourseController.js` extending BaseController
- [ ] Implement `POST /api/courses`:
  - [ ] Validate name required
  - [ ] Insert into database
  - [ ] Return created course with ID
- [ ] Implement `GET /api/courses`:
  - [ ] Fetch all courses
  - [ ] Sort by created_at DESC
  - [ ] Return course list
- [ ] Implement `DELETE /api/courses/:id`:
  - [ ] Validate ID exists
  - [ ] Delete course (cascades to lectures/concepts)
  - [ ] Return success message
- [ ] Test with curl/Postman:
  - [ ] Create course
  - [ ] List courses
  - [ ] Delete course
  - [ ] Error: missing name
  - [ ] Error: invalid ID

**Acceptance:** All course endpoints work, deleting course removes associated data

---

### Task 2.3: Lecture Management API
- [ ] Create `backend/middleware/upload.js` with Multer configuration:
  - [ ] Accept .txt files only
  - [ ] Max file size 5MB
  - [ ] Store in uploads/ directory
- [ ] Create `backend/routes/lectureRoutes.js`
- [ ] Create `backend/controllers/LectureController.js`
- [ ] Implement `POST /api/lectures`:
  - [ ] Accept courseId, name, file (multipart/form-data)
  - [ ] Validate courseId exists
  - [ ] Validate file type (.txt)
  - [ ] Validate file size (<5MB)
  - [ ] Read file content
  - [ ] Save lecture to database
  - [ ] Return lecture (concepts will be added in Phase 3)
- [ ] Implement `GET /api/lectures/:courseId`:
  - [ ] Fetch all lectures for course
  - [ ] Sort by created_at DESC
  - [ ] Return lecture list
- [ ] Implement `DELETE /api/lectures/:id`:
  - [ ] Validate ID exists
  - [ ] Delete lecture (cascades to concepts)
  - [ ] Return success message
- [ ] Test with curl/Postman:
  - [ ] Upload .txt file
  - [ ] List lectures for course
  - [ ] Delete lecture
  - [ ] Error: wrong file type
  - [ ] Error: file too large

**Acceptance:** Can upload .txt files, file content stored, validation works

---

### Task 2.4: Concept Management API
- [ ] Create `backend/routes/conceptRoutes.js`
- [ ] Create `backend/controllers/ConceptController.js`
- [ ] Implement `GET /api/concepts/:lectureId`:
  - [ ] Fetch all concepts for lecture
  - [ ] Sort by last_reviewed DESC (nulls last)
  - [ ] Return concept list
- [ ] Implement `PATCH /api/concepts/:id/progress`:
  - [ ] Accept new progress_status
  - [ ] Validate status is valid (Not Started, Reviewing, Understood, Mastered)
  - [ ] Update concept
  - [ ] Update last_reviewed timestamp
  - [ ] Return updated concept
- [ ] Implement `DELETE /api/concepts/:id`:
  - [ ] Validate ID exists
  - [ ] Delete concept
  - [ ] Return success message
- [ ] Test with curl/Postman:
  - [ ] List concepts (after Phase 3.1)
  - [ ] Update progress status
  - [ ] Delete concept
  - [ ] Error: invalid status
  - [ ] Error: invalid ID

**Acceptance:** Concept endpoints work, sorting correct, progress updates

---

## Phase 3: AI Integrations - Anthropic & Whisper ⏳ NOT STARTED

**Effort:** L | **Priority:** CRITICAL | **Estimated Time:** 5 hours

### Task 3.1: Anthropic API - Concept Generation
- [ ] Create `backend/services/anthropicService.js`
- [ ] Initialize Anthropic client with API key
- [ ] Implement `generateConcepts(fileContent)` function:
  - [ ] Create prompt asking for 5-15 concepts as JSON
  - [ ] Call Anthropic API with claude-sonnet-4-5 model
  - [ ] Parse JSON response
  - [ ] Validate response format
  - [ ] Return concepts array
- [ ] Add error handling:
  - [ ] API rate limit errors
  - [ ] Invalid JSON responses
  - [ ] Network timeouts
  - [ ] API key errors
- [ ] Implement exponential backoff retry logic
- [ ] Update `POST /api/lectures` endpoint:
  - [ ] After saving lecture, call generateConcepts()
  - [ ] Insert each concept into database with "Not Started" status
  - [ ] Return lecture with concepts array
- [ ] Test with real lecture notes:
  - [ ] Short notes (~100 words) → should generate 5-10 concepts
  - [ ] Medium notes (~500 words) → should generate 8-15 concepts
  - [ ] Long notes (~2000 words) → should generate 10-15 concepts
  - [ ] Technical content → concepts should be relevant
  - [ ] Non-technical content → concepts should be appropriate

**Acceptance:** Uploading lecture generates 5-15 relevant concepts automatically, stored in database

---

### Task 3.2: Anthropic API - Review Conversation
- [ ] Create `backend/services/conversationService.js`
- [ ] Define system prompt templates for 3 audience levels:
  - [ ] classmate (college-level peer)
  - [ ] middleschooler (12-14 year old)
  - [ ] kid (5-8 year old)
- [ ] Create `backend/routes/reviewSessionRoutes.js`
- [ ] Create `backend/controllers/ReviewSessionController.js`
- [ ] Implement `POST /api/review-sessions`:
  - [ ] Accept concept_id, audience_level
  - [ ] Fetch concept details from database
  - [ ] Create new session in database
  - [ ] Generate initial AI message using system prompt
  - [ ] Store in conversation_history as JSON
  - [ ] Return session_id and initial message
- [ ] Implement `POST /api/review-sessions/:id/message`:
  - [ ] Accept user_message
  - [ ] Fetch session from database
  - [ ] Add user message to conversation history
  - [ ] Call Anthropic API with full conversation context
  - [ ] Add AI response to conversation history
  - [ ] Update session in database
  - [ ] Return AI response
- [ ] Test with each audience level:
  - [ ] classmate: should use technical language
  - [ ] middleschooler: should use simpler language
  - [ ] kid: should use very simple language and ask for clarifications
- [ ] Test conversation continuity:
  - [ ] AI should remember previous messages
  - [ ] AI should ask follow-up questions
  - [ ] AI should probe for understanding

**Acceptance:** Can start session, have multi-turn conversation, AI responds appropriately for audience

---

### Task 3.3: Anthropic API - Feedback Analysis
- [ ] Implement `POST /api/review-sessions/:id/end`:
  - [ ] Fetch session with full conversation history
  - [ ] Create feedback analysis prompt
  - [ ] Call Anthropic API for analysis
  - [ ] Parse feedback JSON:
    - [ ] overallQuality (string)
    - [ ] clearParts (array)
    - [ ] unclearParts (array)
    - [ ] jargonUsed (array)
    - [ ] struggledWith (array)
  - [ ] Determine new progress status (increment by one level):
    - [ ] Not Started → Reviewing
    - [ ] Reviewing → Understood
    - [ ] Understood → Mastered
    - [ ] Mastered → stays Mastered
  - [ ] Update concept progress_status and last_reviewed
  - [ ] Save feedback to session
  - [ ] Return feedback with old/new status
- [ ] Test feedback quality:
  - [ ] Feedback should be specific, not generic
  - [ ] Should identify actual clear/unclear parts
  - [ ] Jargon detection should be accurate
  - [ ] Struggles should be actionable
- [ ] Test progress updates:
  - [ ] Status increments correctly
  - [ ] last_reviewed timestamp updated
  - [ ] Can verify in database

**Acceptance:** Feedback is meaningful and specific, progress status updates correctly

---

### Task 3.4: OpenAI Whisper API - Speech-to-Text
- [ ] Create `backend/services/whisperService.js`
- [ ] Initialize OpenAI client with API key
- [ ] Implement `transcribeAudio(audioBuffer, filename)` function:
  - [ ] Create FormData with audio file
  - [ ] Call Whisper API with whisper-turbo model
  - [ ] Return transcribed text
- [ ] Create `backend/routes/transcribeRoutes.js`
- [ ] Implement `POST /api/transcribe`:
  - [ ] Accept audio file (webm, mp3, wav)
  - [ ] Validate file type
  - [ ] Call whisperService
  - [ ] Return transcribed text
- [ ] Add error handling:
  - [ ] Invalid audio format
  - [ ] API errors
  - [ ] Network timeouts
- [ ] Test with sample audio:
  - [ ] Clear speech → accurate transcription
  - [ ] Background noise → still works
  - [ ] Different accents → handles well

**Acceptance:** Can upload audio and receive accurate text transcription

---

## Phase 4: Frontend Integration ⏳ NOT STARTED

**Effort:** M | **Priority:** HIGH | **Estimated Time:** 3 hours

### Task 4.1: Set Up Frontend Project Structure
- [ ] Create `/frontend` directory
- [ ] Copy all contents from `figma-mocks/` to `frontend/src/`
- [ ] Verify all dependencies in package.json
- [ ] Run `npm install`
- [ ] Create `frontend/.env` with VITE_API_URL=http://localhost:3001
- [ ] Test: `npm run dev` starts successfully
- [ ] Test: All pages render without errors

**Acceptance:** Frontend builds and runs, all components visible

---

### Task 4.2: Create API Client Service
- [ ] Create `frontend/src/services/api.ts`
- [ ] Define API_URL from environment variable
- [ ] Implement course functions:
  - [ ] createCourse(name)
  - [ ] getCourses()
  - [ ] deleteCourse(id)
- [ ] Implement lecture functions:
  - [ ] createLecture(courseId, name, file)
  - [ ] getLectures(courseId)
  - [ ] deleteLecture(id)
- [ ] Implement concept functions:
  - [ ] getConcepts(lectureId)
  - [ ] updateConceptProgress(id, status)
  - [ ] deleteConcept(id)
- [ ] Implement review session functions:
  - [ ] startReviewSession(conceptId, audienceLevel)
  - [ ] sendMessage(sessionId, message)
  - [ ] endReviewSession(sessionId)
- [ ] Implement transcription function:
  - [ ] transcribeAudio(audioBlob)
- [ ] Add error handling:
  - [ ] Create APIError class
  - [ ] Wrap fetch calls in try-catch
  - [ ] Parse error responses
- [ ] Add TypeScript types for all requests/responses

**Acceptance:** API client provides all backend endpoints with proper types and error handling

---

### Task 4.3: Replace Mock Data in App.tsx
- [ ] Remove localStorage logic
- [ ] Remove simulateConceptExtraction function
- [ ] Update `addCourse`:
  - [ ] Call api.createCourse()
  - [ ] Add to state on success
  - [ ] Navigate to course view
- [ ] Update `addLecture`:
  - [ ] Call api.createLecture() with file
  - [ ] Show loading state during concept generation
  - [ ] Add lecture and concepts to state
  - [ ] Navigate to lecture view
- [ ] Add useEffect to load data on mount:
  - [ ] Fetch all courses
  - [ ] For each course, fetch lectures
  - [ ] Set state with real data
- [ ] Update `deleteCourse`:
  - [ ] Call api.deleteCourse()
  - [ ] Remove from state on success
- [ ] Update `deleteLecture`:
  - [ ] Call api.deleteLecture()
  - [ ] Remove from state on success
- [ ] Update `deleteConcept`:
  - [ ] Call api.deleteConcept()
  - [ ] Remove from state on success
- [ ] Test: Create course works
- [ ] Test: Create lecture generates concepts
- [ ] Test: Delete operations work
- [ ] Test: Data persists across page refresh

**Acceptance:** App uses real backend data, no localStorage, all CRUD works

---

### Task 4.4: Update ReviewSession with Real APIs
- [ ] Add useEffect to start session on mount:
  - [ ] Call api.startReviewSession(conceptId, audience)
  - [ ] Store sessionId in state
  - [ ] Set initial AI message
- [ ] Update `handleSend`:
  - [ ] Call api.sendMessage(sessionId, input)
  - [ ] Add user message to state
  - [ ] Add AI response to state
  - [ ] Show loading during API call
- [ ] Update `handleEndSession`:
  - [ ] Call api.endReviewSession(sessionId)
  - [ ] Show "Analyzing..." loading state
  - [ ] Receive feedback
  - [ ] Navigate to FeedbackScreen with feedback data
- [ ] Test conversation:
  - [ ] Start session
  - [ ] Send multiple messages
  - [ ] Verify AI maintains context
  - [ ] End session
  - [ ] Receive feedback

**Acceptance:** Real conversation with AI, feedback generated, progress updated

---

### Task 4.5: Implement Real Audio Recording
- [ ] Add MediaRecorder state to ReviewSession
- [ ] Implement `startRecording` function:
  - [ ] Request microphone permission
  - [ ] Create MediaRecorder instance
  - [ ] Set up data collection
  - [ ] Start recording
  - [ ] Update isRecording state
- [ ] Implement `stopRecording` function:
  - [ ] Stop MediaRecorder
  - [ ] Create audio Blob
  - [ ] Set isTranscribing state
  - [ ] Call api.transcribeAudio(blob)
  - [ ] Set transcribed text in input
  - [ ] Clear isTranscribing state
- [ ] Update microphone button:
  - [ ] Click starts recording (pulsing animation)
  - [ ] Click again stops recording
  - [ ] Disabled during transcription
- [ ] Add permission error handling:
  - [ ] Show alert if microphone denied
  - [ ] Gracefully fall back to text input
- [ ] Test audio recording:
  - [ ] Grant microphone permission
  - [ ] Record speech
  - [ ] Verify transcription appears
  - [ ] Send transcribed message
- [ ] Test in different browsers:
  - [ ] Chrome (best support)
  - [ ] Firefox
  - [ ] Safari

**Acceptance:** Can record audio, transcribe, and send as message

---

## Phase 5: Feature Completion & Polish ⏳ NOT STARTED

**Effort:** S | **Priority:** MEDIUM | **Estimated Time:** 1 hour

### Task 5.1: Progress Status Colors
- [ ] Verify StatusBadge.tsx color mapping:
  - [ ] Not Started → Gray (bg-gray-200 text-gray-700)
  - [ ] Reviewing → Amber (bg-amber-200 text-amber-800)
  - [ ] Understood → Light Green (bg-green-200 text-green-800)
  - [ ] Mastered → Dark Green (bg-green-600 text-white)
- [ ] Test color changes:
  - [ ] Complete review session
  - [ ] Verify status updates visually
  - [ ] Colors match design system

**Acceptance:** Status badges show correct colors for all 4 levels

---

### Task 5.2: Delete Cascade Verification
- [ ] Test delete course:
  - [ ] Create course with lectures and concepts
  - [ ] Delete course
  - [ ] Verify lectures removed from database
  - [ ] Verify concepts removed from database
  - [ ] Verify UI updates correctly
- [ ] Test delete lecture:
  - [ ] Create lecture with concepts
  - [ ] Delete lecture
  - [ ] Verify concepts removed from database
  - [ ] Verify UI updates correctly
- [ ] Test confirmation dialogs:
  - [ ] Delete shows confirmation
  - [ ] Cancel works
  - [ ] Confirm deletes item

**Acceptance:** Cascading deletes work, no orphaned records, confirmations appear

---

### Task 5.3: Concept Sorting
- [ ] Verify backend sorts by last_reviewed DESC
- [ ] Test sorting:
  - [ ] Create multiple concepts
  - [ ] Review one concept (updates last_reviewed)
  - [ ] Verify it moves to top of list
  - [ ] New concepts (null last_reviewed) appear at bottom
- [ ] Test with multiple reviews:
  - [ ] Review concept A
  - [ ] Review concept B
  - [ ] Verify B is now first
  - [ ] Review concept A again
  - [ ] Verify A is now first

**Acceptance:** Most recently reviewed concepts at top, new concepts at bottom

---

## Phase 6: Error Handling & Validation ⏳ NOT STARTED

**Effort:** M | **Priority:** HIGH | **Estimated Time:** 2 hours

### Task 6.1: Backend Error Handling
- [ ] Install express-validator: `npm install express-validator`
- [ ] Add validation to all endpoints:
  - [ ] Course: name required, not empty
  - [ ] Lecture: courseId valid, name required, file present
  - [ ] Concept: progress_status in allowed values
  - [ ] Review session: conceptId valid, audience_level valid
- [ ] Implement try-catch in all controllers
- [ ] Return proper HTTP status codes:
  - [ ] 200: Success
  - [ ] 201: Created
  - [ ] 400: Bad request (validation errors)
  - [ ] 404: Resource not found
  - [ ] 500: Server error
- [ ] Add API retry logic with exponential backoff:
  - [ ] Implement in anthropicService
  - [ ] Implement in whisperService
  - [ ] Max retries: 3
  - [ ] Backoff: 1s, 2s, 4s
- [ ] Test error scenarios:
  - [ ] Missing required fields → 400
  - [ ] Invalid IDs → 404
  - [ ] API rate limits → retry then error
  - [ ] Network failures → retry then error

**Acceptance:** All endpoints validate input, return proper status codes, retry API failures

---

### Task 6.2: Frontend Error Boundaries
- [ ] Create ErrorBoundary component
- [ ] Wrap App in ErrorBoundary
- [ ] Display user-friendly error UI on crash
- [ ] Add loading states to all async operations:
  - [ ] Course creation
  - [ ] Lecture upload
  - [ ] Concept generation
  - [ ] Review session messages
  - [ ] Feedback generation
  - [ ] Audio transcription
- [ ] Add error toast/notification system
- [ ] Display API errors to user:
  - [ ] Network failures
  - [ ] Validation errors
  - [ ] Server errors

**Acceptance:** App doesn't crash, errors shown to user, loading states visible

---

### Task 6.3: File Upload Validation
- [ ] Frontend validation in AddLectureDialog:
  - [ ] File input accepts only .txt
  - [ ] Check file size < 5MB before upload
  - [ ] Show error if validation fails
- [ ] Backend validation in lectureRoutes:
  - [ ] Verify file.mimetype === 'text/plain'
  - [ ] Verify file.size < 5MB
  - [ ] Return 400 with clear error message
- [ ] Test invalid uploads:
  - [ ] .docx file → rejected
  - [ ] .pdf file → rejected
  - [ ] 10MB file → rejected
  - [ ] Empty file → handled gracefully

**Acceptance:** Only .txt files under 5MB accepted, clear error messages shown

---

## Phase 7: Testing ⏳ NOT STARTED

**Effort:** L | **Priority:** HIGH | **Estimated Time:** 3 hours

### Task 7.1: Backend API Testing
- [ ] Test course endpoints:
  - [ ] Create course → 201, course returned
  - [ ] Get courses → 200, array returned
  - [ ] Delete course → 200, success message
  - [ ] Create without name → 400, error message
  - [ ] Delete invalid ID → 404, error message
- [ ] Test lecture endpoints:
  - [ ] Upload .txt → 201, lecture + concepts returned
  - [ ] Upload with invalid courseId → 404
  - [ ] Upload .pdf → 400
  - [ ] Upload 10MB file → 400
  - [ ] Get lectures → 200, array returned
  - [ ] Delete lecture → 200
- [ ] Test concept endpoints:
  - [ ] Get concepts → 200, sorted correctly
  - [ ] Update progress → 200, updated concept
  - [ ] Update with invalid status → 400
  - [ ] Delete concept → 200
- [ ] Test review session endpoints:
  - [ ] Start session → 201, session + initial message
  - [ ] Send message → 200, AI response
  - [ ] End session → 200, feedback + progress update
  - [ ] Invalid conceptId → 404
  - [ ] Invalid audience → 400
- [ ] Test transcription endpoint:
  - [ ] Upload audio → 200, text returned
  - [ ] Invalid audio → 400

**Acceptance:** All endpoints tested, happy paths work, error cases handled

---

### Task 7.2: AI Integration Testing
- [ ] Test concept generation with various notes:
  - [ ] Short notes (100 words) → 5-10 concepts
  - [ ] Medium notes (500 words) → 8-15 concepts
  - [ ] Long notes (2000 words) → 10-15 concepts
  - [ ] Very technical → relevant concepts
  - [ ] Non-technical → appropriate concepts
  - [ ] Concepts have good names and descriptions
- [ ] Test conversation with all audiences:
  - [ ] classmate → uses technical language
  - [ ] middleschooler → simpler language
  - [ ] kid → very simple language, asks clarifications
  - [ ] Maintains context across 10 turns
  - [ ] Asks probing questions
- [ ] Test feedback analysis:
  - [ ] Good explanation → positive feedback, identifies clear parts
  - [ ] Poor explanation → constructive feedback, identifies struggles
  - [ ] Mixed explanation → balanced feedback
  - [ ] Feedback is specific and actionable
- [ ] Test transcription:
  - [ ] Clear speech → accurate
  - [ ] Background noise → still works
  - [ ] Different accents → handles well

**Acceptance:** AI integrations produce quality results consistently

---

### Task 7.3: End-to-End User Flow
- [ ] Complete full flow:
  - [ ] Open app
  - [ ] Create course "CS 101"
  - [ ] Add lecture "Intro to Algorithms" with sample.txt
  - [ ] Wait for concepts to generate
  - [ ] Verify 5-15 concepts appear
  - [ ] Click a concept
  - [ ] Select "middleschooler" audience
  - [ ] Type first explanation
  - [ ] Receive AI question
  - [ ] Record audio response
  - [ ] Verify transcription appears
  - [ ] Send transcribed message
  - [ ] Continue conversation (5 turns)
  - [ ] Click "End Session"
  - [ ] Wait for feedback
  - [ ] Verify progress updated
  - [ ] Verify feedback is specific
  - [ ] Click "Back to Concepts"
  - [ ] Verify concept now at top with new status
- [ ] Test delete operations:
  - [ ] Delete concept → removed from list
  - [ ] Delete lecture → all concepts gone
  - [ ] Delete course → all lectures gone
- [ ] Test navigation:
  - [ ] Back buttons work correctly
  - [ ] State maintained during navigation
  - [ ] No broken links

**Acceptance:** Complete flow works without errors from start to finish

---

### Task 7.4: Browser Compatibility
- [ ] Test in Chrome:
  - [ ] All features work
  - [ ] MediaRecorder works
  - [ ] Audio recording/transcription works
- [ ] Test in Firefox:
  - [ ] All features work
  - [ ] MediaRecorder works
  - [ ] Audio recording/transcription works
- [ ] Test in Safari:
  - [ ] All features work
  - [ ] Check MediaRecorder support (may need polyfill)
  - [ ] Audio recording works or shows error
- [ ] Test responsive design:
  - [ ] Mobile (375px width)
  - [ ] Tablet (768px width)
  - [ ] Desktop (1440px width)
  - [ ] All screens readable and functional

**Acceptance:** Works on Chrome and Firefox, graceful degradation on Safari, responsive

---

## Phase 8: Deployment Preparation ⏳ NOT STARTED

**Effort:** S | **Priority:** MEDIUM | **Estimated Time:** 1 hour

### Task 8.1: Environment Documentation
- [ ] Create `backend/.env.example`:
  - [ ] PORT=3001
  - [ ] ANTHROPIC_API_KEY=your_key_here
  - [ ] OPENAI_API_KEY=your_key_here
  - [ ] DATABASE_PATH=./backend/database/superfeynman.db
- [ ] Create `frontend/.env.example`:
  - [ ] VITE_API_URL=http://localhost:3001
- [ ] Update README.md with:
  - [ ] Project description
  - [ ] Setup instructions
  - [ ] How to get API keys
  - [ ] How to run backend
  - [ ] How to run frontend
  - [ ] Troubleshooting section

**Acceptance:** Clear documentation for setting up and running the project

---

### Task 8.2: Start Scripts
- [ ] Update `backend/package.json` scripts:
  - [ ] "start": "node server.js"
  - [ ] "dev": "nodemon server.js"
  - [ ] "init-db": "node database/init.js"
- [ ] Update `frontend/package.json` scripts:
  - [ ] "dev": "vite"
  - [ ] "build": "vite build"
  - [ ] "preview": "vite preview"
- [ ] Test start scripts:
  - [ ] `cd backend && npm run dev` starts server
  - [ ] `cd frontend && npm run dev` starts frontend
  - [ ] Both can run simultaneously

**Acceptance:** Simple commands to start development servers

---

### Task 8.3: CORS Configuration
- [ ] Add FRONTEND_URL to backend .env
- [ ] Update CORS configuration:
  ```javascript
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  };
  app.use(cors(corsOptions));
  ```
- [ ] Test CORS:
  - [ ] Frontend can make requests to backend
  - [ ] No CORS errors in console
- [ ] Document CORS for production deployment

**Acceptance:** CORS configured, ready for production

---

## Summary Statistics

**Total Tasks:** 89
**Completed:** 0
**In Progress:** 0
**Not Started:** 89

**Estimated Total Time:** ~20 hours (2-3 days)

---

## Quick Progress Check

Use this to quickly see what phase you're in:

- [ ] Phase 1: Backend Foundation (2 hours)
- [ ] Phase 2: CRUD APIs (3 hours)
- [ ] Phase 3: AI Integrations (5 hours) ⚠️ CRITICAL PATH
- [ ] Phase 4: Frontend Integration (3 hours)
- [ ] Phase 5: Feature Completion (1 hour)
- [ ] Phase 6: Error Handling (2 hours)
- [ ] Phase 7: Testing (3 hours)
- [ ] Phase 8: Deployment (1 hour)

---

**Next Task:** Phase 1, Task 1.1 - Initialize Backend Structure

**After each task:** Update this file and super-feynman-mvp-context.md
