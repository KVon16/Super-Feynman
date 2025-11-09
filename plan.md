# Overall Goal
Build "Super Feynman" - a web application for college students to systematically review and master concepts using the Feynman Technique through AI-powered conversational sessions with speech-to-text dictation support.

# UI Elements

## Screen 1: Home (Course List)
- **Header:** "Super Feynman" title at the top center
- **Empty State (first time):** Welcome message "Welcome, add your first course to get started" with an "Add a Course" button centered
- **Course List View (after adding courses):** Vertical list of course cards showing course names
- **Top Right:** Settings icon and Account icon
- **Navigation:** None (this is the root screen)

## Screen 2: Add Course Popup
- **Modal overlay** that appears on top of the home screen
- **Top Left:** "Course Name" label
- **Input field:** Text input for entering course name
- **Bottom Right:** "Create New Course" button
- **Styling:** Centered popup with white background, slight shadow

## Screen 3: Inside Course (Lecture/Topic List)
- **Header:** Course name at top with back button (top left)
- **Empty State:** "Add a lecture/topic" prompt with button
- **After adding:** Vertical list showing all lectures/topics for this course
- **Each lecture/topic item:** Shows lecture name with small delete icon on the right
- **Add button:** Floating "+" button or "Add Lecture/Topic" button at bottom

## Screen 4: Add Lecture/Topic Popup
- **Modal overlay**
- **Field 1:** "Lecture/Topic Name" label with text input
- **Field 2:** "Upload Notes" label with "Upload File" button (only .txt files)
- **File indicator:** Shows selected filename after upload
- **Bottom Right:** "Create" button

## Screen 5: Inside Lecture (Concept List)
- **Header:** Lecture name at top with back button (top left)
- **List of concepts:** Each concept shows:
  - Concept name (larger text)
  - Progress status badge (color-coded: Not Started / Reviewing / Understood / Mastered)
  - Small delete icon on the right
- **Sorting:** Most recently reviewed concepts appear at the top
- **Loading state:** Shows "Processing your notes..." with spinner while LLM generates concepts

## Screen 6: Audience Selection Popup
- **Modal overlay** triggered when tapping a concept
- **Title:** "Choose your audience level"
- **Three buttons (vertically stacked):**
  - "Explain to your classmate"
  - "Explain to a middle schooler"
  - "Explain to a kid"
- **Bottom:** "Cancel" button

## Screen 7: Review Session (Chat Interface)
- **Header:** 
  - Back button (top left)
  - Concept name (center)
  - "End Session" button (top right)
- **Instruction text:** Small gray text near top: "Explain the concept in your own words. The AI will ask questions to check your understanding."
- **Chat area:** 
  - Scrollable message container
  - LLM messages aligned left (light gray background bubble)
  - User messages aligned right (blue background bubble)
- **Input area (bottom):**
  - Text input field
  - Microphone/dictation button (circular, always visible)
  - Send button
- **Recording state:** When recording, show pulsing red animation on microphone button
- **Processing state:** Show "Transcribing..." text below input while converting speech to text

## Screen 8: Feedback Screen
- **Loading state:** "Analyzing your session..." with spinner
- **Content sections (after loading):**
  - **Progress Update Banner:** "Progress: [Old Status] → [New Status]" (highlighted/colored)
  - **Overall Quality:** Paragraph summarizing how well you explained
  - **Clear Parts:** Bulleted list of what you explained well
  - **Unclear Parts:** Bulleted list of areas needing improvement
  - **Jargon Used:** List of complex terms you used
  - **Struggled With:** Specific concepts/parts you had difficulty explaining
- **Bottom buttons:**
  - "Retry This Concept" button (left)
  - "Back to Concepts" button (right)

## Delete Confirmation Popup
- **Modal overlay**
- **Title:** "Delete [Course/Lecture/Concept]?"
- **Message:** "This action cannot be undone."
- **Buttons:** "Cancel" and "Delete" (red)

# Functions and Interaction Logic

## Course Management
1. **Add Course:**
   - Click "Add a Course" → popup appears
   - Enter course name → click "Create New Course"
   - Popup closes, navigate directly into that new course
   - Course appears in home list when returning

2. **Delete Course:**
   - Click delete icon on course → confirmation popup
   - Confirm → course removed from list
   - All associated lectures/topics/concepts also deleted from database

3. **View Course:**
   - Click on any course card → navigate to lecture/topic list screen

## Lecture/Topic Management
1. **Add Lecture/Topic:**
   - Click "Add Lecture/Topic" → popup appears
   - Enter lecture name
   - Click "Upload File" → system file picker opens (filter: .txt only)
   - Select file → filename displays
   - Click "Create" → popup closes, show loading spinner
   - Backend processes: reads text file, sends to Anthropic API with prompt to break content into bite-sized concepts (5-15 concepts)
   - Once processed, display concept list with all concepts marked "Not Started"

2. **Delete Lecture/Topic:**
   - Click delete icon → confirmation popup
   - Confirm → lecture removed, all concepts deleted

## Concept Review Flow
1. **Start Review:**
   - Click on any concept → audience selection popup appears
   - Select audience level (classmate/middle schooler/kid)
   - Navigate to chat interface
   - LLM sends first message asking user to explain the concept

2. **Chat Interaction:**
   - **Typing:** User can type response in text field, click send
   - **Dictation:** 
     - Click microphone button → starts recording (button shows pulsing animation)
     - Click again → stops recording
     - Show "Transcribing..." indicator
     - Send audio to OpenAI Whisper API
     - Display transcribed text as user message
     - LLM responds with follow-up question or probe
   - Continue for 5-10 conversational turns

3. **End Session:**
   - User clicks "End Session" button (or after 10 turns)
   - Show loading: "Analyzing your session..."
   - Backend sends full conversation to Anthropic API for analysis
   - API returns structured feedback (quality, clear/unclear parts, jargon, struggles)
   - Update concept progress status (move up one level)
   - Display feedback screen

4. **Post-Feedback Actions:**
   - **Retry:** Returns to audience selection, starts new session for same concept
   - **Back to Concepts:** Returns to concept list, updated concept now at top with new status

## Progress Status Levels
- **Level 1:** Not Started (gray)
- **Level 2:** Reviewing (yellow)
- **Level 3:** Understood (light green)
- **Level 4:** Mastered (dark green)
- Progress can only increase (not decrease) in MVP

## Navigation
- Back buttons (top left) on all sub-screens return to previous screen
- Maintain navigation stack properly

# Technical Requirements

## Tech Stack
- **Frontend:** React 18+ with Tailwind CSS for styling
- **Backend:** Node.js with Express.js (JavaScript)
- **Database:** SQLite with proper schema design
- **File Upload:** Multer middleware for handling .txt file uploads
- **APIs:**
  - Anthropic API (Claude) for concept generation, conversation, and feedback analysis
  - OpenAI Whisper API for speech-to-text transcription

## Database Schema

### Tables:
1. **courses**
   - id (PRIMARY KEY)
   - name (TEXT)
   - created_at (TIMESTAMP)

2. **lectures**
   - id (PRIMARY KEY)
   - course_id (FOREIGN KEY → courses.id)
   - name (TEXT)
   - file_content (TEXT, stores uploaded text)
   - created_at (TIMESTAMP)

3. **concepts**
   - id (PRIMARY KEY)
   - lecture_id (FOREIGN KEY → lectures.id)
   - concept_name (TEXT)
   - concept_description (TEXT, optional detailed description)
   - progress_status (TEXT: "Not Started" / "Reviewing" / "Understood" / "Mastered")
   - last_reviewed (TIMESTAMP, nullable)
   - created_at (TIMESTAMP)

4. **review_sessions** (optional but recommended for tracking)
   - id (PRIMARY KEY)
   - concept_id (FOREIGN KEY → concepts.id)
   - audience_level (TEXT)
   - conversation_history (JSON)
   - feedback (JSON)
   - created_at (TIMESTAMP)

## API Integration Details

### Anthropic API Usage:
1. **Concept Generation:**
   - Endpoint: `/v1/messages`
   - Model: `claude-sonnet-4-5`
   - Prompt: "Break down the following lecture notes into 5-15 bite-sized, distinct concepts that a student should understand. Return as JSON array with 'concept_name' and 'concept_description' fields."
   - Input: Full text file content

2. **Review Conversation:**
   - Streaming conversation with system prompt adapting to audience level
   - System prompt includes: audience level, concept name, instruction to ask probing questions (not just yes/no)
   - Maintain conversation history in state

3. **Feedback Analysis:**
   - Send full conversation history
   - Prompt: "Analyze this Feynman Technique review session. Provide: 1) Overall explanation quality summary, 2) What was explained clearly, 3) What was unclear, 4) Jargon terms used, 5) Specific parts the student struggled with. Return as structured JSON."

### OpenAI Whisper API:
- Endpoint: `/v1/audio/transcriptions`
- Model: `whisper-1`
- Input: Audio blob from frontend (format: webm or mp3)
- Output: Transcribed text

## File Handling
- Accept only .txt files (enforce in frontend and backend)
- Maximum file size: 5MB
- Store file content in database (not filesystem) for simplicity
- Sanitize file content before sending to LLM

## Error Handling
- Network errors: Show user-friendly messages
- API rate limits: Handle gracefully with retry logic
- File upload failures: Clear error messages
- Invalid file types: Block with alert

## Performance Considerations
- Show loading states for all API calls
- Implement proper async/await patterns
- Consider implementing basic caching for concept lists

# UI Style

## Design System
- **Color Palette:**
  - Primary: Anthropic Orange (#D97757) for buttons and user messages
  - Secondary: Dark Charcoal (#131314) for text and headers
  - Success: Green gradient (#10B981 → #059669) for "Mastered" status
  - Warning: Warm Amber (#F59E0B) for "Reviewing" status
  - Gray: Slate (#6B7280) for "Not Started" and UI elements
  - Background: Cream (#FAF9F0)
  - White: (#FFFFFF) for cards and popups
  - Accent: Light Orange (#E89B7F) for hover states and highlights

- **Typography:**
  - Font: System default (sans-serif) or Inter
  - Headers: Bold, 24-28px
  - Body: Regular, 16px
  - Small text: 14px

- **Spacing:**
  - Use consistent padding (16px, 24px, 32px)
  - Card shadows for depth
  - Rounded corners (8px for cards, 20px for buttons)

- **Interactive Elements:**
  - Buttons: Rounded, bold text, hover states
  - Microphone button: Circular, prominent, red when recording
  - Cards: Subtle shadow, hover lift effect

- **Responsive Design:**
  - Mobile-first approach
  - Breakpoints: 640px (sm), 768px (md), 1024px (lg)
  - Stack elements vertically on mobile

## Visual Hierarchy
- Clear distinction between different status levels (color coding)
- Emphasize primary actions (larger, colored buttons)
- De-emphasize secondary actions (outline buttons, smaller)
- Use whitespace effectively to avoid clutter

## Accessibility Considerations
- Proper contrast ratios (WCAG AA)
- Focus states for keyboard navigation
- Loading states with proper ARIA labels
- Clear error messages

---

# Implementation Notes for Claude Code

1. **Start with backend API routes** and database setup first
2. **Test Anthropic API integration** early (concept generation & conversation)
3. **Build frontend screen by screen** following the flow
4. **Integrate Whisper last** as it's an enhancement
5. **Use environment variables** for API keys (.env file)
6. **Implement proper error boundaries** in React
7. **Test the complete flow** with real lecture notes

## Development Priority Order:
1. ✅ Database schema & setup
2. ✅ Basic Express server with routes
3. ✅ Course CRUD operations
4. ✅ Lecture/Topic CRUD with file upload
5. ✅ Concept generation (Anthropic API)
6. ✅ React frontend structure & routing
7. ✅ Home → Course → Lecture → Concept screens
8. ✅ Chat interface for review
9. ✅ Conversation logic with Anthropic API
10. ✅ Feedback generation and display
11. ✅ Progress tracking updates
12. ✅ Whisper API integration for dictation
13. ✅ Polish UI/UX and error handling
14. ✅ Testing end-to-end flow