/**
 * API Client for Super Feynman
 *
 * Provides typed functions for all backend API endpoints with error handling
 */

const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================================================
// Error Handling
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

export type ProgressStatus = 'Not Started' | 'Reviewing' | 'Understood' | 'Mastered';
export type AudienceLevel = 'classmate' | 'middleschooler' | 'kid';

// Backend response types (snake_case from database)
interface BackendConcept {
  id: number;
  lecture_id: number;
  concept_name: string;
  concept_description: string;
  progress_status: ProgressStatus;
  last_reviewed: string | null;
  created_at: string;
}

interface BackendLecture {
  id: number;
  course_id: number;
  name: string;
  file_content: string;
  created_at: string;
  concepts?: BackendConcept[];
}

interface BackendCourse {
  id: number;
  name: string;
  created_at: string;
}

// Frontend types (camelCase for UI)
export interface Concept {
  id: string;
  name: string;
  description: string;
  status: ProgressStatus;
  lastReviewed?: Date;
}

export interface Lecture {
  id: string;
  name: string;
  courseId: string;
  concepts: Concept[];
}

export interface Course {
  id: string;
  name: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface FeedbackData {
  oldStatus: ProgressStatus;
  newStatus: ProgressStatus;
  overallQuality: string;
  clearParts: string[];
  unclearParts: string[];
  jargonUsed: string[];
  struggledWith: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform backend concept to frontend format
 */
function transformConcept(backendConcept: BackendConcept): Concept {
  return {
    id: backendConcept.id.toString(),
    name: backendConcept.concept_name,
    description: backendConcept.concept_description,
    status: backendConcept.progress_status,
    lastReviewed: backendConcept.last_reviewed ? new Date(backendConcept.last_reviewed) : undefined,
  };
}

/**
 * Transform backend lecture to frontend format
 */
function transformLecture(backendLecture: BackendLecture): Lecture {
  return {
    id: backendLecture.id.toString(),
    name: backendLecture.name,
    courseId: backendLecture.course_id.toString(),
    concepts: backendLecture.concepts ? backendLecture.concepts.map(transformConcept) : [],
  };
}

/**
 * Transform backend course to frontend format
 */
function transformCourse(backendCourse: BackendCourse): Course {
  return {
    id: backendCourse.id.toString(),
    name: backendCourse.name,
  };
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    // Parse response
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new APIError(
        data.error || data.message || `HTTP ${response.status} error`,
        response.status,
        data
      );
    }

    // Extract data from wrapped response format { success: true, data: <actual data> }
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or other errors
    throw new APIError(
      error instanceof Error ? error.message : 'Network request failed',
      0
    );
  }
}

// ============================================================================
// Course API Functions
// ============================================================================

/**
 * Create a new course
 */
export async function createCourse(name: string): Promise<Course> {
  const response = await fetchAPI<BackendCourse>('/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  return transformCourse(response);
}

/**
 * Get all courses
 */
export async function getCourses(): Promise<Course[]> {
  const response = await fetchAPI<BackendCourse[]>('/api/courses', {
    method: 'GET',
  });

  return response.map(transformCourse);
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<void> {
  await fetchAPI(`/api/courses/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Lecture API Functions
// ============================================================================

/**
 * Create a new lecture with file upload
 */
export async function createLecture(
  courseId: string,
  name: string,
  file: File
): Promise<Lecture> {
  const formData = new FormData();
  formData.append('courseId', courseId);
  formData.append('name', name);
  formData.append('file', file);

  const response = await fetchAPI<BackendLecture>('/api/lectures', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type - browser will set it with boundary for multipart/form-data
  });

  return transformLecture(response);
}

/**
 * Get all lectures for a course
 */
export async function getLectures(courseId: string): Promise<Lecture[]> {
  const response = await fetchAPI<BackendLecture[]>(`/api/lectures/${courseId}`, {
    method: 'GET',
  });

  return response.map(transformLecture);
}

/**
 * Delete a lecture
 */
export async function deleteLecture(id: string): Promise<void> {
  await fetchAPI(`/api/lectures/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Concept API Functions
// ============================================================================

/**
 * Get all concepts for a lecture
 */
export async function getConcepts(lectureId: string): Promise<Concept[]> {
  const response = await fetchAPI<BackendConcept[]>(`/api/concepts/${lectureId}`, {
    method: 'GET',
  });

  return response.map(transformConcept);
}

/**
 * Update concept progress status
 */
export async function updateConceptProgress(
  id: string,
  status: ProgressStatus
): Promise<Concept> {
  const response = await fetchAPI<BackendConcept>(`/api/concepts/${id}/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ progress_status: status }),
  });

  return transformConcept(response);
}

/**
 * Delete a concept
 */
export async function deleteConcept(id: string): Promise<void> {
  await fetchAPI(`/api/concepts/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Review Session API Functions
// ============================================================================

/**
 * Start a new review session
 */
export async function startReviewSession(
  conceptId: string,
  audienceLevel: AudienceLevel
): Promise<{ sessionId: string; initialMessage: string }> {
  const response = await fetchAPI<{ session_id: number; initial_message: string }>(
    '/api/review-sessions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        concept_id: parseInt(conceptId, 10),
        audience_level: audienceLevel,
      }),
    }
  );

  return {
    sessionId: response.session_id.toString(),
    initialMessage: response.initial_message,
  };
}

/**
 * Send a message in a review session
 */
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<{ aiResponse: string }> {
  const response = await fetchAPI<{ ai_response: string }>(
    `/api/review-sessions/${sessionId}/message`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_message: message }),
    }
  );

  return {
    aiResponse: response.ai_response,
  };
}

/**
 * End a review session and get feedback
 */
export async function endReviewSession(sessionId: string): Promise<FeedbackData> {
  const response = await fetchAPI<{
    feedback: {
      overallQuality: string;
      clearParts: string[];
      unclearParts: string[];
      jargonUsed: string[];
      struggledWith: string[];
    };
    old_status: ProgressStatus;
    new_status: ProgressStatus;
  }>(`/api/review-sessions/${sessionId}/end`, {
    method: 'POST',
  });

  return {
    oldStatus: response.old_status,
    newStatus: response.new_status,
    overallQuality: response.feedback.overallQuality,
    clearParts: response.feedback.clearParts,
    unclearParts: response.feedback.unclearParts,
    jargonUsed: response.feedback.jargonUsed,
    struggledWith: response.feedback.struggledWith,
  };
}

// ============================================================================
// Transcription API Function
// ============================================================================

/**
 * Transcribe audio to text using Whisper API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const response = await fetchAPI<{ text: string }>('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  return response.text;
}
