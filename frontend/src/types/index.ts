/**
 * Centralized type definitions for Super Feynman
 * Single source of truth for all types across the application
 */

// ============================================================================
// Base Types
// ============================================================================

export type ProgressStatus = 'Not Started' | 'Reviewing' | 'Understood' | 'Mastered';
export type AudienceLevel = 'classmate' | 'middleschooler' | 'kid';

// ============================================================================
// Backend API Types (snake_case format from database/API)
// ============================================================================

export interface BackendConcept {
  id: number;
  lecture_id: number;
  concept_name: string;
  concept_description: string;
  progress_status: ProgressStatus;
  last_reviewed: string | null;
  created_at: string;
}

export interface BackendLecture {
  id: number;
  course_id: number;
  lecture_name: string;
  file_path: string;
  created_at: string;
}

export interface BackendCourse {
  id: number;
  name: string;
  created_at: string;
}

// ============================================================================
// Frontend UI Types (camelCase format for React components)
// ============================================================================

/**
 * Concept in frontend format
 */
export interface Concept {
  id: string;
  name: string;
  description: string;
  status: ProgressStatus;
  lastReviewed?: Date;
}

/**
 * Lecture with associated concepts
 */
export interface Lecture {
  id: string;
  courseId: string;
  name: string;
  concepts: Concept[];
}

/**
 * Course with metadata
 */
export interface Course {
  id: string;
  name: string;
}

/**
 * Message in chat/review session (API format)
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Message with UI-specific ID for React keys
 */
export interface UIMessage extends Message {
  id: string;
}

/**
 * Feedback data collected after review session
 */
export interface FeedbackData {
  oldStatus: ProgressStatus;
  newStatus: ProgressStatus;
  overallQuality: string;
  clearParts: string[];
  unclearParts: string[];
  jargonUsed: string[];
  struggledWith: string[];
}

/**
 * Screen state for navigation
 */
export type Screen =
  | { type: 'home' }
  | { type: 'course'; courseId: string }
  | { type: 'lecture'; courseId: string; lectureId: string }
  | { type: 'review'; lectureId: string; conceptId: string; courseId: string; audience: string }
  | { type: 'feedback'; lectureId: string; conceptId: string; courseId: string; feedback: FeedbackData };

// ============================================================================
// API Response Types
// ============================================================================

export interface StartReviewSessionResponse {
  sessionId: string;
  initialMessage: string;
}

export interface SendMessageResponse {
  response: string;
}

export interface EndReviewSessionResponse {
  feedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
}

export interface TranscribeAudioResponse {
  text: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a string is a valid audience level
 */
export function isValidAudienceLevel(value: string): value is AudienceLevel {
  return ['classmate', 'middleschooler', 'kid'].includes(value);
}

/**
 * Type guard to check if a string is a valid progress status
 */
export function isValidProgressStatus(value: string): value is ProgressStatus {
  return ['Not Started', 'Reviewing', 'Understood', 'Mastered'].includes(value);
}

// ============================================================================
// Error Types
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}
