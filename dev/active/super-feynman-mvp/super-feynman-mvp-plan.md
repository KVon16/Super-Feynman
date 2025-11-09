# Super Feynman MVP - Implementation Plan

**Last Updated:** 2025-11-08

---

## Executive Summary

Build "Super Feynman" - a web application that helps college students systematically master concepts using the Feynman Technique through AI-powered conversational review sessions with speech-to-text dictation support.

**Key Objective:** Create a functional MVP that allows students to:
1. Upload lecture notes (.txt files)
2. Auto-generate bite-sized concepts via AI
3. Practice explaining concepts through conversational AI review
4. Receive structured feedback and progress tracking
5. Use voice dictation for natural explanation practice

**Strategy:** Leverage existing frontend mocks in `figma-mocks/` to accelerate development. Focus implementation effort on backend infrastructure and AI integrations.

**Timeline:** 2-3 days for MVP completion

---

## Current State Analysis

### What We Have
✅ **Complete Frontend UI Mocks** (`figma-mocks/`)
- All 8 screens fully designed and implemented in React/TypeScript
- Tailwind CSS with complete design system
- shadcn/ui components integrated
- Mock data and simulated API calls in place

✅ **Design Specifications** (`plan.md`)
- Detailed UI/UX specifications for all screens
- Complete database schema defined
- API endpoint specifications
- AI integration requirements

✅ **Project Infrastructure**
- Git repository initialized
- Node.js project with package.json
- .gitignore configured

### What We Need
❌ **Backend API** - None exists yet
❌ **Database** - No SQLite database created
❌ **AI Integrations** - Anthropic and Whisper APIs not implemented
❌ **Frontend-Backend Connection** - Mock data needs real API integration
❌ **Audio Recording** - MediaRecorder API not yet implemented
❌ **Deployment Setup** - No server configuration

---

## Proposed Future State

### Architecture Overview

```
Frontend (React + Tailwind)
    ↓ HTTP/REST
Backend (Express.js)
    ↓
┌─────────────┬──────────────┬─────────────┐
│   SQLite    │   Anthropic  │   Whisper   │
│  Database   │   Claude API │   API       │
└─────────────┴──────────────┴─────────────┘
```

### Tech Stack
- **Frontend:** React 18+, TypeScript, Tailwind CSS, shadcn/ui (already built)
- **Backend:** Express.js, JavaScript/Node.js
- **Database:** SQLite with proper schema and relationships
- **File Upload:** Multer middleware for .txt files
- **APIs:**
  - Anthropic Claude Sonnet 4.5 (concept generation, conversation, feedback)
  - OpenAI Whisper Turbo (speech-to-text)

---

## Implementation Phases

### Phase 1: Backend Foundation & Database (Effort: M, Priority: CRITICAL)

**Goal:** Establish backend infrastructure with working database

**Tasks:**

#### Task 1.1: Initialize Backend Structure
- Create `/backend` directory with proper structure
- Initialize npm project: `npm init -y`
- Install dependencies:
  ```bash
  npm install express sqlite3 multer cors dotenv @anthropic-ai/sdk openai
  npm install --save-dev nodemon
  ```
- Create directory structure:
  ```
  backend/
  ├── server.js           # Express app entry point
  ├── routes/             # API route definitions
  ├── controllers/        # Request handlers
  ├── services/           # Business logic
  ├── database/           # DB schema and helpers
  ├── middleware/         # Custom middleware
  └── uploads/            # Temporary file storage
  ```
- Create `.env` file with:
  ```
  PORT=3001
  ANTHROPIC_API_KEY=your_key_here
  OPENAI_API_KEY=your_key_here
  DATABASE_PATH=./backend/database/superfeynman.db
  ```
- Add backend to `.gitignore` (node_modules, .env, uploads/, *.db)

**Acceptance Criteria:**
- Backend directory structure exists
- All dependencies installed successfully
- `.env` file created (template, not with real keys)
- npm start script configured with nodemon

**Dependencies:** None (foundational task)

---

#### Task 1.2: Database Schema Implementation
- Create `backend/database/schema.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lectures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    file_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lecture_id INTEGER NOT NULL,
    concept_name TEXT NOT NULL,
    concept_description TEXT,
    progress_status TEXT DEFAULT 'Not Started' CHECK(progress_status IN ('Not Started', 'Reviewing', 'Understood', 'Mastered')),
    last_reviewed DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS review_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_id INTEGER NOT NULL,
    audience_level TEXT NOT NULL CHECK(audience_level IN ('classmate', 'middleschooler', 'kid')),
    conversation_history TEXT NOT NULL, -- JSON array
    feedback TEXT, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
  );

  -- Indexes for performance
  CREATE INDEX idx_lectures_course_id ON lectures(course_id);
  CREATE INDEX idx_concepts_lecture_id ON concepts(lecture_id);
  CREATE INDEX idx_concepts_last_reviewed ON concepts(last_reviewed DESC);
  CREATE INDEX idx_review_sessions_concept_id ON review_sessions(concept_id);
  ```

- Create `backend/database/db.js`:
  ```javascript
  const sqlite3 = require('sqlite3').verbose();
  const fs = require('fs');
  const path = require('path');

  const dbPath = process.env.DATABASE_PATH || './database/superfeynman.db';
  const db = new sqlite3.Database(dbPath);

  // Initialize database with schema
  function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schema, (err) => {
      if (err) {
        console.error('Error initializing database:', err);
      } else {
        console.log('Database initialized successfully');
      }
    });
  }

  // Promisify db methods
  function query(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  function run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  module.exports = { db, initializeDatabase, query, run };
  ```

- Create `backend/database/init.js` for testing:
  ```javascript
  require('dotenv').config();
  const { initializeDatabase } = require('./db');
  initializeDatabase();
  ```

**Acceptance Criteria:**
- schema.sql file created with all 4 tables
- Foreign key constraints properly configured
- Indexes created for query performance
- db.js provides promisified query/run methods
- Running `node backend/database/init.js` creates database successfully
- Can verify schema with SQLite browser tool

**Dependencies:** Task 1.1 (needs backend structure)

---

### Phase 2: Backend API - Core CRUD Operations (Effort: M, Priority: HIGH)

**Goal:** Implement foundational API endpoints for courses, lectures, and concepts

**Tasks:**

#### Task 2.1: Express Server Setup & Base Controller
- Create `backend/server.js`:
  ```javascript
  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const { initializeDatabase } = require('./database/db');

  const app = express();
  const PORT = process.env.PORT || 3001;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database
  initializeDatabase();

  // Routes
  app.use('/api/courses', require('./routes/courseRoutes'));
  app.use('/api/lectures', require('./routes/lectureRoutes'));
  app.use('/api/concepts', require('./routes/conceptRoutes'));
  app.use('/api/review-sessions', require('./routes/reviewSessionRoutes'));
  app.use('/api/transcribe', require('./routes/transcribeRoutes'));

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error'
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  ```

- Create `backend/controllers/BaseController.js`:
  ```javascript
  class BaseController {
    asyncHandler(fn) {
      return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
      };
    }

    sendSuccess(res, data, status = 200) {
      res.status(status).json({ success: true, data });
    }

    sendError(res, message, status = 400) {
      res.status(status).json({ success: false, error: message });
    }
  }

  module.exports = BaseController;
  ```

**Acceptance Criteria:**
- Server starts successfully on port 3001
- CORS configured for frontend communication
- BaseController provides error handling utilities
- 404 for unknown routes

**Dependencies:** Phase 1 (needs database and structure)

---

#### Task 2.2: Course Management API
- Create `backend/routes/courseRoutes.js`
- Create `backend/controllers/CourseController.js`
- Implement endpoints:
  - `POST /api/courses` - Create new course
  - `GET /api/courses` - Get all courses
  - `DELETE /api/courses/:id` - Delete course (cascade to lectures/concepts)

**Acceptance Criteria:**
- Can create course with name
- Can fetch all courses sorted by created_at DESC
- Deleting course removes all associated lectures and concepts
- Proper error handling for missing name, invalid ID
- Test with curl/Postman

**Dependencies:** Task 2.1

---

#### Task 2.3: Lecture Management API
- Create `backend/routes/lectureRoutes.js`
- Create `backend/controllers/LectureController.js`
- Configure Multer middleware for .txt file uploads (5MB max)
- Implement endpoints:
  - `POST /api/lectures` - Create lecture with file upload (returns lecture + concepts)
  - `GET /api/lectures/:courseId` - Get all lectures for a course
  - `DELETE /api/lectures/:id` - Delete lecture (cascade to concepts)

**Acceptance Criteria:**
- Can upload .txt file with lecture name and course_id
- File content extracted and stored in database
- Rejects non-.txt files
- Rejects files > 5MB
- Deleting lecture removes all associated concepts
- Test with actual .txt file

**Dependencies:** Task 2.2

---

#### Task 2.4: Concept Management API
- Create `backend/routes/conceptRoutes.js`
- Create `backend/controllers/ConceptController.js`
- Implement endpoints:
  - `GET /api/concepts/:lectureId` - Get concepts for lecture (sorted by last_reviewed DESC)
  - `PATCH /api/concepts/:id/progress` - Update progress status
  - `DELETE /api/concepts/:id` - Delete single concept

**Acceptance Criteria:**
- Concepts returned sorted correctly
- Can update progress status (validate allowed values)
- last_reviewed timestamp updated on progress change
- Proper 404 for non-existent concepts

**Dependencies:** Task 2.3

---

### Phase 3: AI Integrations - Anthropic & Whisper (Effort: L, Priority: CRITICAL)

**Goal:** Integrate AI APIs for concept generation, conversation, feedback, and transcription

**Tasks:**

#### Task 3.1: Anthropic API - Concept Generation
- Create `backend/services/anthropicService.js`
- Implement `generateConcepts(fileContent)`:
  ```javascript
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async function generateConcepts(fileContent) {
    const prompt = `You are an expert educator. Analyze the following lecture notes and break them down into 5-15 bite-sized, distinct concepts that a student should understand and be able to explain.

  For each concept, provide:
  1. concept_name: A clear, concise name (2-6 words)
  2. concept_description: A brief description (1-2 sentences)

  Return your response as a JSON array ONLY, with no additional text:
  [
    {"concept_name": "...", "concept_description": "..."},
    ...
  ]

  Lecture Notes:
  ${fileContent}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    return JSON.parse(responseText);
  }
  ```

- Integrate into `POST /api/lectures` endpoint:
  - After saving lecture, call `generateConcepts(file_content)`
  - Insert each concept into database with "Not Started" status
  - Return lecture with array of generated concepts

- Add error handling:
  - API rate limits (implement exponential backoff)
  - Invalid JSON response
  - API key errors
  - Network timeouts

**Acceptance Criteria:**
- Uploading lecture generates 5-15 concepts automatically
- Concepts have meaningful names and descriptions
- All concepts saved to database with correct lecture_id
- Handles edge cases (empty file, very short file, very long file)
- Test with real lecture notes

**Dependencies:** Task 2.3 (lecture API must exist)

---

#### Task 3.2: Anthropic API - Review Conversation
- Create `backend/services/conversationService.js`
- Implement session management (in-memory store or database)
- Create `POST /api/review-sessions` endpoint:
  - Accept: concept_id, audience_level
  - Create new session in database
  - Generate initial AI prompt based on audience
  - Return session_id and first AI message

- Create `POST /api/review-sessions/:id/message` endpoint:
  - Accept: user_message
  - Add to conversation history
  - Call Anthropic API with full conversation context
  - System prompt templates:
    ```javascript
    const systemPrompts = {
      classmate: `You are a college classmate learning about "${conceptName}". Ask thoughtful, probing questions to check if the student truly understands the concept. Don't just accept yes/no answers - ask for examples, explanations, and connections to other topics. Be friendly but challenging.`,

      middleschooler: `You are a curious 13-year-old middle school student learning about "${conceptName}". Ask questions in simple language. If the student uses jargon or complex terms, ask them to explain in simpler words. Be enthusiastic and curious.`,

      kid: `You are a 6-year-old child learning about "${conceptName}". Ask simple, innocent questions. If the student uses any big words, ask "what does that mean?" Be playful and ask for comparisons to things kids understand.`
    };
    ```
  - Return AI response
  - Update conversation_history in database

**Acceptance Criteria:**
- Can start review session with concept
- AI responds appropriately for each audience level
- Conversation maintains context across multiple turns
- Session history persists in database
- Handles long conversations (10+ turns)

**Dependencies:** Task 2.4 (concepts must exist)

---

#### Task 3.3: Anthropic API - Feedback Analysis
- Implement `POST /api/review-sessions/:id/end` endpoint:
  - Retrieve full conversation history
  - Send to Anthropic for analysis:
    ```javascript
    const feedbackPrompt = `You are an educational expert analyzing a Feynman Technique review session where a student explained a concept.

    Concept: ${conceptName}
    Conversation:
    ${conversationHistory}

    Analyze this session and provide structured feedback as JSON ONLY:
    {
      "overallQuality": "2-3 sentence summary of explanation quality",
      "clearParts": ["aspect 1 they explained well", "aspect 2...", ...],
      "unclearParts": ["aspect 1 that needs work", "aspect 2...", ...],
      "jargonUsed": ["technical term 1", "term 2", ...],
      "struggledWith": ["specific concept/part 1", "part 2", ...]
    }`;
    ```
  - Parse feedback JSON
  - Determine new progress status (increment by one level)
  - Update concept in database
  - Save feedback to review_sessions table
  - Return feedback object

**Acceptance Criteria:**
- Generates meaningful, specific feedback
- Progress status updated correctly (Not Started → Reviewing → Understood → Mastered)
- Feedback saved to database
- Returns structured feedback to frontend
- Handles edge cases (very short sessions, incomplete explanations)

**Dependencies:** Task 3.2 (conversation must work)

---

#### Task 3.4: OpenAI Whisper API - Speech-to-Text
- Create `backend/services/whisperService.js`
- Install additional package: `npm install form-data`
- Implement transcription:
  ```javascript
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async function transcribeAudio(audioBuffer, filename) {
    const formData = new FormData();
    formData.append('file', audioBuffer, filename);
    formData.append('model', 'whisper-turbo');

    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-turbo'
    });

    return transcription.text;
  }
  ```

- Create `backend/routes/transcribeRoutes.js`
- Implement `POST /api/transcribe`:
  - Accept audio file via Multer
  - Support formats: webm, mp3, wav
  - Call Whisper API
  - Return transcribed text

**Acceptance Criteria:**
- Can upload audio file and receive text
- Supports common audio formats
- Returns transcription within reasonable time (<5 seconds)
- Handles API errors gracefully
- Test with sample audio recording

**Dependencies:** Task 2.1 (server setup)

---

### Phase 4: Frontend Integration (Effort: M, Priority: HIGH)

**Goal:** Connect existing frontend mocks to real backend APIs

**Tasks:**

#### Task 4.1: Set Up Frontend Project Structure
- Create `/frontend` directory
- Move `figma-mocks/` contents to `frontend/src/`
- Initialize React project (if not already):
  ```bash
  cd frontend
  npm install
  ```
- Verify all dependencies installed
- Create `.env` file:
  ```
  VITE_API_URL=http://localhost:3001
  ```

**Acceptance Criteria:**
- Frontend builds successfully
- Can run dev server
- All components render without errors

**Dependencies:** None (can be done in parallel with backend)

---

#### Task 4.2: Create API Client Service
- Create `frontend/src/services/api.ts`:
  ```typescript
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Courses
  export async function createCourse(name: string) {
    const response = await fetch(`${API_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create course');
    return response.json();
  }

  export async function getCourses() {
    const response = await fetch(`${API_URL}/api/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  }

  export async function deleteCourse(id: string) {
    const response = await fetch(`${API_URL}/api/courses/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete course');
    return response.json();
  }

  // Lectures
  export async function createLecture(courseId: string, name: string, file: File) {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('name', name);
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/lectures`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to create lecture');
    return response.json();
  }

  // ... similar for all other endpoints
  ```

- Add error handling wrapper:
  ```typescript
  export class APIError extends Error {
    constructor(public message: string, public status: number) {
      super(message);
    }
  }
  ```

**Acceptance Criteria:**
- All backend endpoints have corresponding client functions
- Proper TypeScript types for all requests/responses
- Error handling for network failures
- Easy to use from React components

**Dependencies:** Phase 3 (backend APIs must exist)

---

#### Task 4.3: Replace Mock Data in App.tsx
- Remove localStorage mock data logic
- Replace `simulateConceptExtraction()` with real API call
- Update `addCourse` to call `api.createCourse()`
- Update `addLecture` to call `api.createLecture()`
- Load courses and lectures from backend on mount:
  ```typescript
  useEffect(() => {
    async function loadData() {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData.data);

        // Load lectures for each course
        const lecturesData = await Promise.all(
          coursesData.data.map(c => getLectures(c.id))
        );
        setLectures(lecturesData.flat());
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    loadData();
  }, []);
  ```

**Acceptance Criteria:**
- App loads real data from backend
- Creating course/lecture calls backend API
- Deleting operations work correctly
- Concepts generated from uploaded files
- No console errors

**Dependencies:** Task 4.2

---

#### Task 4.4: Update ReviewSession with Real APIs
- Replace `simulateAIResponse()` with real conversation API call
- Replace `simulateFeedbackGeneration()` with real feedback API call
- Start session on component mount:
  ```typescript
  useEffect(() => {
    async function startSession() {
      const session = await startReviewSession(concept.id, audience);
      setSessionId(session.data.id);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: session.data.initialMessage
      }]);
    }
    startSession();
  }, []);
  ```

- Update `handleSend` to call backend:
  ```typescript
  const handleSend = async () => {
    const response = await sendMessage(sessionId, input);
    setMessages(prev => [...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: response.data.message }
    ]);
  };
  ```

**Acceptance Criteria:**
- Real conversation with AI
- Responses appropriate to audience level
- Session persists conversation history
- Feedback screen shows real AI analysis
- Progress status updates after session

**Dependencies:** Task 4.3

---

#### Task 4.5: Implement Real Audio Recording
- Install MediaRecorder polyfill if needed
- Update `ReviewSession.tsx`:
  ```typescript
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setIsTranscribing(true);

        try {
          const text = await transcribeAudio(audioBlob);
          setInput(text);
        } catch (error) {
          console.error('Transcription failed:', error);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      alert('Microphone access denied');
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }
  ```

**Acceptance Criteria:**
- Requests microphone permission
- Records audio on button click
- Stops recording on second click
- Sends audio to transcription API
- Displays transcribed text in input field
- Handles permission denial gracefully

**Dependencies:** Task 3.4 (Whisper API)

---

### Phase 5: Feature Completion & Polish (Effort: S, Priority: MEDIUM)

**Tasks:**

#### Task 5.1: Progress Status Colors
- Verify `StatusBadge.tsx` has correct colors:
  ```typescript
  const statusColors = {
    'Not Started': 'bg-gray-200 text-gray-700',
    'Reviewing': 'bg-amber-200 text-amber-800',
    'Understood': 'bg-green-200 text-green-800',
    'Mastered': 'bg-green-600 text-white'
  };
  ```

**Acceptance Criteria:**
- Colors match design system
- Status changes reflect in UI immediately

---

#### Task 5.2: Delete Cascade Verification
- Test deleting course removes all lectures and concepts
- Test deleting lecture removes all concepts
- Verify confirmation dialogs appear

**Acceptance Criteria:**
- No orphaned records in database
- UI updates correctly after deletion

---

#### Task 5.3: Concept Sorting
- Verify concepts sorted by `last_reviewed DESC` in API
- Null `last_reviewed` values appear at bottom

**Acceptance Criteria:**
- Most recently reviewed concepts at top
- New concepts at bottom

---

### Phase 6: Error Handling & Validation (Effort: M, Priority: HIGH)

**Tasks:**

#### Task 6.1: Backend Error Handling
- Implement try-catch in all controllers
- Add input validation middleware (express-validator)
- Return proper HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad request (invalid input)
  - 404: Not found
  - 500: Server error
- Implement API retry logic with exponential backoff for Anthropic/Whisper

**Acceptance Criteria:**
- All endpoints have error handling
- Validation errors return helpful messages
- API failures don't crash server
- Rate limit errors handled gracefully

---

#### Task 6.2: Frontend Error Boundaries
- Create error boundary component
- Wrap main app in error boundary
- Display user-friendly error messages
- Add loading states to all async operations

**Acceptance Criteria:**
- App doesn't crash on errors
- User sees helpful error messages
- Loading spinners show during API calls

---

#### Task 6.3: File Upload Validation
- Frontend: Filter file picker to .txt only
- Backend: Validate file type and size
- Show clear error for invalid files

**Acceptance Criteria:**
- Can't select non-.txt files
- Files > 5MB rejected with clear message
- Empty files handled gracefully

---

### Phase 7: Testing (Effort: L, Priority: HIGH)

**Tasks:**

#### Task 7.1: Backend API Testing
- Test all endpoints with curl/Postman:
  - Create/read/delete courses
  - Upload lecture, verify concepts generated
  - Start/continue/end review session
  - Transcribe sample audio
- Test error cases:
  - Invalid IDs
  - Missing required fields
  - Duplicate names
  - Large file uploads

**Acceptance Criteria:**
- All happy paths work
- Error cases return proper responses
- No server crashes

---

#### Task 7.2: AI Integration Testing
- Test concept generation with various lecture notes:
  - Short notes (~100 words)
  - Medium notes (~500 words)
  - Long notes (~2000 words)
  - Very technical content
  - Non-technical content
- Test conversation with all 3 audience levels
- Test feedback analysis with different session lengths

**Acceptance Criteria:**
- Concepts always between 5-15
- Concepts are relevant and meaningful
- Conversation maintains appropriate difficulty
- Feedback is specific and actionable

---

#### Task 7.3: End-to-End User Flow
- Complete full user journey:
  1. Create course
  2. Add lecture with real notes
  3. View generated concepts
  4. Start review session
  5. Chat with AI (type and voice)
  6. End session and view feedback
  7. Verify progress updated
  8. Return to concept list
- Test delete operations at each level
- Test navigation with back buttons

**Acceptance Criteria:**
- Can complete entire flow without errors
- Data persists correctly
- Navigation works smoothly
- Progress tracking accurate

---

#### Task 7.4: Browser Compatibility
- Test on Chrome, Firefox, Safari
- Test MediaRecorder API support
- Test responsive design (mobile/tablet/desktop)

**Acceptance Criteria:**
- Works on all major browsers
- Microphone works (or shows helpful error)
- Responsive design looks good

---

### Phase 8: Deployment Preparation (Effort: S, Priority: MEDIUM)

**Tasks:**

#### Task 8.1: Environment Documentation
- Create `backend/.env.example`:
  ```
  PORT=3001
  ANTHROPIC_API_KEY=your_anthropic_key_here
  OPENAI_API_KEY=your_openai_key_here
  DATABASE_PATH=./backend/database/superfeynman.db
  ```
- Create `frontend/.env.example`:
  ```
  VITE_API_URL=http://localhost:3001
  ```
- Update README with setup instructions

**Acceptance Criteria:**
- Clear setup instructions
- Environment variable documentation
- API key instructions

---

#### Task 8.2: Start Scripts
- Add to `backend/package.json`:
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
  ```
- Add to `frontend/package.json`:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```

**Acceptance Criteria:**
- `npm run dev` starts both servers
- Production build works

---

#### Task 8.3: CORS Configuration
- Configure CORS for production:
  ```javascript
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  };
  app.use(cors(corsOptions));
  ```

**Acceptance Criteria:**
- CORS works in development
- Ready for production deployment

---

## Risk Assessment & Mitigation

### High Risk

**Risk:** Anthropic API rate limiting during testing
- **Impact:** Can't test conversation/feedback features
- **Mitigation:** Implement caching, use mock responses during development, implement exponential backoff
- **Contingency:** Have backup API key, implement request queuing

**Risk:** Whisper API transcription quality issues
- **Impact:** Poor user experience with voice input
- **Mitigation:** Test with various audio qualities, add manual edit option
- **Contingency:** Make voice optional, emphasize text input

**Risk:** SQLite performance with large conversations
- **Impact:** Slow queries, poor UX
- **Mitigation:** Proper indexing, limit conversation history storage
- **Contingency:** Pagination, conversation summaries

### Medium Risk

**Risk:** Browser MediaRecorder compatibility
- **Impact:** Voice recording doesn't work on some browsers
- **Mitigation:** Feature detection, clear browser requirements
- **Contingency:** Text-only mode, browser upgrade prompts

**Risk:** File upload edge cases (corrupted files, wrong encoding)
- **Impact:** App crashes or concept generation fails
- **Mitigation:** Strict validation, error handling, file encoding detection
- **Contingency:** Manual concept entry, better error messages

### Low Risk

**Risk:** Complex state management across screens
- **Impact:** Navigation bugs, lost state
- **Mitigation:** Proper React state management, use existing mock structure
- **Contingency:** Add Redux or Zustand if needed

---

## Success Metrics

### Functional Completeness
- [ ] All 8 screens working
- [ ] All CRUD operations functional
- [ ] AI integrations working (concept gen, conversation, feedback)
- [ ] Voice dictation working
- [ ] Progress tracking accurate

### Quality Metrics
- [ ] No critical bugs in happy path
- [ ] < 2 second response time for API calls
- [ ] Concept generation 90%+ relevant
- [ ] Feedback specific and actionable
- [ ] 95%+ transcription accuracy

### User Experience
- [ ] Can complete full flow without errors
- [ ] Clear error messages when things fail
- [ ] Responsive design works on mobile
- [ ] Loading states for all async operations

---

## Required Resources

### API Keys
- Anthropic Claude API key (required)
- OpenAI API key (required)

### Development Tools
- Node.js 18+
- npm or yarn
- SQLite browser (for database inspection)
- Postman or curl (for API testing)
- Modern browser with microphone

### Time Estimates
- **Phase 1:** 2 hours
- **Phase 2:** 3 hours
- **Phase 3:** 5 hours (most complex)
- **Phase 4:** 3 hours
- **Phase 5:** 1 hour
- **Phase 6:** 2 hours
- **Phase 7:** 3 hours
- **Phase 8:** 1 hour

**Total:** ~20 hours (2-3 days with testing)

---

## Critical Path

Must be completed in order:
1. **Phase 1** → Enables all backend work
2. **Phase 2** → Enables AI integration testing
3. **Phase 3, Task 3.1** → Blocks lecture upload testing
4. **Phase 3, Tasks 3.2-3.3** → Blocks conversation testing
5. **Phase 4** → Connects everything together

Can be parallelized:
- Frontend structure (4.1) with Backend (1-3)
- Audio recording (4.5) with other features
- Documentation (8) anytime

---

## Next Steps

1. ✅ Read this plan completely
2. ⏳ Create context.md and tasks.md files
3. ⏳ Begin Phase 1, Task 1.1
4. ⏳ Update context.md as you progress

**Start here:** Phase 1, Task 1.1 - Initialize Backend Structure
