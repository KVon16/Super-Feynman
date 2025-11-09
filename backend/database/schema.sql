-- Super Feynman Database Schema
-- SQLite database for managing courses, lectures, concepts, and review sessions

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lectures Table
CREATE TABLE IF NOT EXISTS lectures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  file_content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Concepts Table
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

-- Review Sessions Table
CREATE TABLE IF NOT EXISTS review_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL,
  audience_level TEXT NOT NULL CHECK(audience_level IN ('classmate', 'middleschooler', 'kid')),
  conversation_history TEXT NOT NULL, -- JSON array
  feedback TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_concepts_lecture_id ON concepts(lecture_id);
CREATE INDEX IF NOT EXISTS idx_concepts_last_reviewed ON concepts(last_reviewed DESC);
CREATE INDEX IF NOT EXISTS idx_review_sessions_concept_id ON review_sessions(concept_id);
