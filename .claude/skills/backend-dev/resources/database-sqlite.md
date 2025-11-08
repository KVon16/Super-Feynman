# SQLite Database - Super Feynman Backend

Complete guide to SQLite setup, schema design, and query patterns for Super Feynman.

---

## Setup SQLite with better-sqlite3

```bash
npm install better-sqlite3
```

---

## Database Connection

```javascript
// db/database.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../super-feynman.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Initialize database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Better concurrency

// Create tables from schema if database is new
if (!fs.existsSync(dbPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('[Database] Schema created successfully');
}

module.exports = db;
```

---

## Database Schema

```sql
-- db/schema.sql
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
    progress_status TEXT DEFAULT 'Not Started',
    last_reviewed DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_id INTEGER NOT NULL,
    audience_level TEXT NOT NULL,
    conversation_history TEXT NOT NULL,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_concepts_lecture_id ON concepts(lecture_id);
CREATE INDEX IF NOT EXISTS idx_concepts_progress ON concepts(progress_status);
CREATE INDEX IF NOT EXISTS idx_review_sessions_concept_id ON review_sessions(concept_id);
```

---

## Query Functions

### Course Queries

```javascript
// db/queries.js
const db = require('./database');

// Get all courses
const getAllCourses = () => {
    return db.prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
};

// Get course by ID
const getCourseById = (id) => {
    return db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
};

// Create course
const createCourse = (name) => {
    const stmt = db.prepare('INSERT INTO courses (name) VALUES (?)');
    const result = stmt.run(name);
    return getCourseById(result.lastInsertRowid);
};

// Delete course
const deleteCourse = (id) => {
    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    return stmt.run(id);
};
```

### Lecture Queries

```javascript
// Get lectures by course ID
const getLecturesByCourseId = (courseId) => {
    return db.prepare('SELECT * FROM lectures WHERE course_id = ? ORDER BY created_at DESC').all(courseId);
};

// Get lecture by ID
const getLectureById = (id) => {
    return db.prepare('SELECT * FROM lectures WHERE id = ?').get(id);
};

// Create lecture
const createLecture = (courseId, name, fileContent) => {
    const stmt = db.prepare('INSERT INTO lectures (course_id, name, file_content) VALUES (?, ?, ?)');
    const result = stmt.run(courseId, name, fileContent);
    return getLectureById(result.lastInsertRowid);
};

// Delete lecture
const deleteLecture = (id) => {
    const stmt = db.prepare('DELETE FROM lectures WHERE id = ?');
    return stmt.run(id);
};

// Delete all lectures for a course
const deleteLecturesByCourseId = (courseId) => {
    const stmt = db.prepare('DELETE FROM lectures WHERE course_id = ?');
    return stmt.run(courseId);
};
```

### Concept Queries

```javascript
// Get concepts by lecture ID
const getConceptsByLectureId = (lectureId) => {
    return db.prepare(`
        SELECT * FROM concepts
        WHERE lecture_id = ?
        ORDER BY last_reviewed DESC, created_at DESC
    `).all(lectureId);
};

// Get concept by ID
const getConceptById = (id) => {
    return db.prepare('SELECT * FROM concepts WHERE id = ?').get(id);
};

// Create concept
const createConcept = (lectureId, conceptName, conceptDescription, progressStatus = 'Not Started') => {
    const stmt = db.prepare(`
        INSERT INTO concepts (lecture_id, concept_name, concept_description, progress_status)
        VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(lectureId, conceptName, conceptDescription, progressStatus);
    return getConceptById(result.lastInsertRowid);
};

// Update concept progress
const updateConceptProgress = (conceptId, progressStatus) => {
    const stmt = db.prepare(`
        UPDATE concepts
        SET progress_status = ?, last_reviewed = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    stmt.run(progressStatus, conceptId);
    return getConceptById(conceptId);
};

// Delete concept
const deleteConcept = (id) => {
    const stmt = db.prepare('DELETE FROM concepts WHERE id = ?');
    return stmt.run(id);
};
```

### Review Session Queries

```javascript
// Create review session
const createReviewSession = (conceptId, audienceLevel, conversationHistory, feedback = null) => {
    const stmt = db.prepare(`
        INSERT INTO review_sessions (concept_id, audience_level, conversation_history, feedback)
        VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
        conceptId,
        audienceLevel,
        JSON.stringify(conversationHistory),
        feedback ? JSON.stringify(feedback) : null
    );
    return db.prepare('SELECT * FROM review_sessions WHERE id = ?').get(result.lastInsertRowid);
};

// Get review sessions by concept ID
const getReviewSessionsByConceptId = (conceptId) => {
    return db.prepare(`
        SELECT * FROM review_sessions
        WHERE concept_id = ?
        ORDER BY created_at DESC
    `).all(conceptId);
};
```

### Export All Queries

```javascript
module.exports = {
    // Courses
    getAllCourses,
    getCourseById,
    createCourse,
    deleteCourse,
    // Lectures
    getLecturesByCourseId,
    getLectureById,
    createLecture,
    deleteLecture,
    deleteLecturesByCourseId,
    // Concepts
    getConceptsByLectureId,
    getConceptById,
    createConcept,
    updateConceptProgress,
    deleteConcept,
    // Review Sessions
    createReviewSession,
    getReviewSessionsByConceptId
};
```

---

## Database Best Practices

### Using Prepared Statements

```javascript
// ✅ GOOD - Prevents SQL injection
const stmt = db.prepare('SELECT * FROM courses WHERE id = ?');
const course = stmt.get(userId);

// ❌ BAD - SQL injection vulnerability
const course = db.prepare(`SELECT * FROM courses WHERE id = ${userId}`).get();
```

### Transaction Example

```javascript
const createLectureWithConcepts = (courseId, name, fileContent, concepts) => {
    const transaction = db.transaction(() => {
        // Create lecture
        const lecture = createLecture(courseId, name, fileContent);

        // Create concepts
        for (const concept of concepts) {
            createConcept(lecture.id, concept.name, concept.description);
        }

        return lecture;
    });

    return transaction();
};
```

---

## Testing Database

### Database Check

```bash
# In backend directory
node -e "const db = require('./src/db/database'); console.log('DB connected:', db.prepare('SELECT 1').get());"
```

### Manual Query

```javascript
const db = require('./db/database');

// Test query
const courses = db.prepare('SELECT * FROM courses').all();
console.log('Courses:', courses);
```

---

## Best Practices

✅ **DO:**
- Use prepared statements (prevents SQL injection)
- Create indexes for frequently queried columns
- Use transactions for multi-step operations
- Use foreign keys with ON DELETE CASCADE
- Return created objects after insert
- Use WAL mode for better concurrency

❌ **DON'T:**
- Use string concatenation for SQL queries
- Forget to add indexes
- Skip error handling
- Store binary data in TEXT fields
- Use SELECT * in production queries (specify columns)
