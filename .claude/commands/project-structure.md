# Project Structure Guide - Super Feynman

Complete folder structure and file organization for rapid development.

---

## Recommended Project Structure

```
super-feynman/
├── backend/                          # Node.js Express server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── BaseController.js
│   │   │   ├── CourseController.js
│   │   │   ├── LectureController.js
│   │   │   └── ConceptController.js
│   │   ├── services/
│   │   │   ├── courseService.js
│   │   │   ├── lectureService.js
│   │   │   ├── conceptService.js
│   │   │   ├── anthropicService.js
│   │   │   └── whisperService.js
│   │   ├── routes/
│   │   │   ├── courseRoutes.js
│   │   │   ├── lectureRoutes.js
│   │   │   ├── conceptRoutes.js
│   │   │   └── transcribeRoutes.js
│   │   ├── db/
│   │   │   ├── database.js
│   │   │   ├── schema.sql
│   │   │   └── queries.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── upload.js
│   │   │   └── rateLimiter.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── retryHelper.js
│   │   │   └── apiErrors.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                      # Temporary file storage
│   │   ├── audio/
│   │   └── notes/
│   ├── .env                          # Environment variables (DO NOT COMMIT)
│   ├── .env.example                  # Template for .env (COMMIT THIS)
│   ├── .gitignore
│   ├── package.json
│   └── super-feynman.db              # SQLite database (auto-generated)
│
├── frontend/                         # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── DeleteConfirmation.jsx
│   │   ├── pages/                    # Page components (screens)
│   │   │   ├── Home.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── LectureDetail.jsx
│   │   │   ├── ReviewSession.jsx
│   │   │   └── FeedbackScreen.jsx
│   │   ├── services/                 # API integration
│   │   │   └── api.js
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useCourses.js
│   │   │   ├── useLectures.js
│   │   │   ├── useConcepts.js
│   │   │   └── useAudioRecorder.js
│   │   ├── utils/                    # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                          # Environment variables (DO NOT COMMIT)
│   ├── .env.example                  # Template (COMMIT THIS)
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .claude/                          # Claude Code skills (optional)
│   ├── skills/                       # Development skills from super-feynman-resources
│   │   ├── backend-dev/
│   │   ├── frontend-dev/
│   │   ├── api-integration/
│   │   └── skill-rules.json
│   └── commands/                     # Slash commands
│       ├── quick-start.md
│       └── project-structure.md
│
├── .gitignore                        # Root gitignore
└── README.md                         # Project README
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

### Frontend

- **Components**: `PascalCase` - `LoadingSpinner.jsx`
- **Pages**: `PascalCase` - `Home.jsx`
- **Hooks**: `camelCase with 'use' prefix` - `useCourses.js`
- **Services**: `camelCase` - `api.js`
- **Utilities**: `camelCase` - `helpers.js`

---

## Essential Configuration Files

### Backend .gitignore

```gitignore
# Dependencies
node_modules/

# Environment variables
.env

# Database
*.db
*.db-shm
*.db-wal

# Uploads
uploads/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### Backend .env.example

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_PATH=./super-feynman.db
```

### Backend package.json

```json
{
  "name": "super-feynman-backend",
  "version": "1.0.0",
  "description": "Backend for Super Feynman learning app",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "better-sqlite3": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.0",
    "multer": "^1.4.5-lts.1",
    "openai": "^4.20.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend .gitignore

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Build output
dist/
build/

# Logs
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### Frontend .env.example

```bash
VITE_API_URL=http://localhost:3001/api
```

### Frontend package.json

```json
{
  "name": "super-feynman-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.0"
  }
}
```

---

## Module Organization

### Backend Exports

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

### Frontend Exports

```javascript
// services/api.js
export const courseApi = {
    getAll: () => { },
    create: () => { },
    delete: () => { }
};

export const lectureApi = { };
export const conceptApi = { };

// Default export
export default apiClient;
```

---

## Database Organization

### schema.sql

Contains all `CREATE TABLE` statements with:
- Primary keys
- Foreign keys with `ON DELETE CASCADE`
- Indexes for performance
- Default values
- Constraints

### queries.js

Organized by entity:

```javascript
module.exports = {
    // Courses
    getAllCourses,
    getCourseById,
    createCourse,
    deleteCourse,

    // Lectures
    getLecturesByCourseId,
    createLecture,
    deleteLecture,

    // Concepts
    getConceptsByLectureId,
    createConcept,
    updateConceptProgress,
    deleteConcept,

    // Review Sessions
    createReviewSession,
    getReviewSessionsByConceptId
};
```

---

## Routing Organization

### Backend Routes

```javascript
// app.js
const courseRoutes = require('./routes/courseRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const conceptRoutes = require('./routes/conceptRoutes');
const transcribeRoutes = require('./routes/transcribeRoutes');

app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/transcribe', transcribeRoutes);
```

### Frontend Routes

```javascript
// App.jsx
<Routes>
    <Route path="/" element={<Home />} />
    <Route path="/course/:courseId" element={<CourseDetail />} />
    <Route path="/lecture/:lectureId" element={<LectureDetail />} />
    <Route path="/review/:conceptId" element={<ReviewSession />} />
    <Route path="/feedback/:sessionId" element={<FeedbackScreen />} />
</Routes>
```

---

## Development Workflow

### 1. Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

Backend runs on: `http://localhost:3001`

### 2. Start Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Development Cycle

1. Make changes to backend
2. Test API endpoints with curl or Postman
3. Make changes to frontend
4. Test in browser
5. Iterate

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

## Common File Templates

### Controller Template

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

### Service Template

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

### React Page Template

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const PageName = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        // Fetch data
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4">
            <button onClick={() => navigate(-1)}>← Back</button>
            {/* Content */}
        </div>
    );
};

export default PageName;
```

---

## Testing Your Structure

### Backend Health Check

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Database Check

```bash
# In backend directory
node -e "const db = require('./src/db/database'); console.log('DB connected:', db.prepare('SELECT 1').get());"
```

### Frontend API Connection

```javascript
// In browser console
fetch('http://localhost:3001/api/courses')
    .then(r => r.json())
    .then(console.log);
```

---

## Best Practices

### DO ✅

- Keep related files in the same directory
- Use clear, descriptive file names
- One class/component per file
- Export one primary thing per file
- Organize imports (external → internal)
- Use absolute paths sparingly
- Keep files under 300 lines

### DON'T ❌

- Mix concerns (e.g., API calls in components)
- Create deeply nested directories
- Use vague names like `utils2.js`
- Export many unrelated things from one file
- Put business logic in routes
- Create files you don't need yet

---

## Next Steps

1. Create the folder structure
2. Set up package.json files
3. Install dependencies
4. Copy configuration files
5. Create initial database schema
6. Set up basic routes
7. Start building features

Your structure is ready to scale from hackathon to production! 🏗️
