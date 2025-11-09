import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { CourseView } from './components/CourseView';
import { LectureView } from './components/LectureView';
import { ReviewSession } from './components/ReviewSession';
import { FeedbackScreen } from './components/FeedbackScreen';
import * as api from './services/api';

export type ProgressStatus = 'Not Started' | 'Reviewing' | 'Understood' | 'Mastered';

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
  id: string;
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

type Screen =
  | { type: 'home' }
  | { type: 'course'; courseId: string }
  | { type: 'lecture'; lectureId: string; courseId: string }
  | { type: 'review'; conceptId: string; lectureId: string; courseId: string; audience: string }
  | { type: 'feedback'; conceptId: string; lectureId: string; courseId: string; feedback: FeedbackData };

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [screen, setScreen] = useState<Screen>({ type: 'home' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add Anthropic font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
  }, []);

  // Load all courses and lectures on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all courses
      const fetchedCourses = await api.getCourses();
      setCourses(fetchedCourses);

      // Fetch lectures for each course
      const allLectures: Lecture[] = [];
      for (const course of fetchedCourses) {
        const courseLectures = await api.getLectures(course.id);
        allLectures.push(...courseLectures);
      }
      setLectures(allLectures);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof api.APIError ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (name: string) => {
    try {
      const newCourse = await api.createCourse(name);
      setCourses([...courses, newCourse]);
      setScreen({ type: 'course', courseId: newCourse.id });
    } catch (err) {
      console.error('Error creating course:', err);
      alert(err instanceof api.APIError ? err.message : 'Failed to create course');
      throw err;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await api.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      setLectures(lectures.filter(l => l.courseId !== courseId));
      setScreen({ type: 'home' });
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err instanceof api.APIError ? err.message : 'Failed to delete course');
      throw err;
    }
  };

  const addLecture = async (courseId: string, name: string, file: File) => {
    try {
      // Call API to create lecture with file upload
      // Backend will automatically generate concepts using Anthropic API
      const newLecture = await api.createLecture(courseId, name, file);

      // Add lecture with concepts to state
      setLectures([...lectures, newLecture]);

      return newLecture.id;
    } catch (err) {
      console.error('Error creating lecture:', err);
      alert(err instanceof api.APIError ? err.message : 'Failed to create lecture');
      throw err;
    }
  };

  const deleteLecture = async (lectureId: string, courseId: string) => {
    try {
      await api.deleteLecture(lectureId);
      setLectures(lectures.filter(l => l.id !== lectureId));
      setScreen({ type: 'course', courseId });
    } catch (err) {
      console.error('Error deleting lecture:', err);
      alert(err instanceof api.APIError ? err.message : 'Failed to delete lecture');
      throw err;
    }
  };

  const deleteConcept = async (lectureId: string, conceptId: string) => {
    try {
      await api.deleteConcept(conceptId);

      // Update state to remove concept
      setLectures(lectures.map(lecture => {
        if (lecture.id === lectureId) {
          return {
            ...lecture,
            concepts: lecture.concepts.filter(c => c.id !== conceptId),
          };
        }
        return lecture;
      }));
    } catch (err) {
      console.error('Error deleting concept:', err);
      alert(err instanceof api.APIError ? err.message : 'Failed to delete concept');
      throw err;
    }
  };

  const updateConceptStatus = (lectureId: string, conceptId: string, newStatus: ProgressStatus) => {
    setLectures(lectures.map(lecture => {
      if (lecture.id === lectureId) {
        return {
          ...lecture,
          concepts: lecture.concepts.map(concept => {
            if (concept.id === conceptId) {
              return {
                ...concept,
                status: newStatus,
                lastReviewed: new Date(),
              };
            }
            return concept;
          }),
        };
      }
      return lecture;
    }));
  };

  // Show loading state on initial load
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading Super Feynman...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {screen.type === 'home' && (
        <Home
          courses={courses}
          onAddCourse={addCourse}
          onDeleteCourse={deleteCourse}
          onSelectCourse={(courseId) => setScreen({ type: 'course', courseId })}
        />
      )}

      {screen.type === 'course' && (
        <CourseView
          course={courses.find(c => c.id === screen.courseId)!}
          lectures={lectures.filter(l => l.courseId === screen.courseId)}
          onBack={() => setScreen({ type: 'home' })}
          onAddLecture={addLecture}
          onDeleteLecture={(lectureId) => deleteLecture(lectureId, screen.courseId)}
          onSelectLecture={(lectureId) => setScreen({ type: 'lecture', lectureId, courseId: screen.courseId })}
        />
      )}

      {screen.type === 'lecture' && (
        <LectureView
          lecture={lectures.find(l => l.id === screen.lectureId)!}
          onBack={() => setScreen({ type: 'course', courseId: screen.courseId })}
          onDeleteConcept={(conceptId) => deleteConcept(screen.lectureId, conceptId)}
          onSelectConcept={(conceptId, audience) =>
            setScreen({ type: 'review', conceptId, lectureId: screen.lectureId, courseId: screen.courseId, audience })
          }
        />
      )}

      {screen.type === 'review' && (
        <ReviewSession
          concept={lectures.find(l => l.id === screen.lectureId)?.concepts.find(c => c.id === screen.conceptId)!}
          audience={screen.audience}
          onEndSession={(feedback) =>
            setScreen({ type: 'feedback', conceptId: screen.conceptId, lectureId: screen.lectureId, courseId: screen.courseId, feedback })
          }
        />
      )}

      {screen.type === 'feedback' && (
        <FeedbackScreen
          concept={lectures.find(l => l.id === screen.lectureId)?.concepts.find(c => c.id === screen.conceptId)!}
          feedback={screen.feedback}
          onRetry={(audience) =>
            setScreen({ type: 'review', conceptId: screen.conceptId, lectureId: screen.lectureId, courseId: screen.courseId, audience })
          }
          onBackToConcepts={() => {
            // Update concept status
            updateConceptStatus(screen.lectureId, screen.conceptId, screen.feedback.newStatus);
            setScreen({ type: 'lecture', lectureId: screen.lectureId, courseId: screen.courseId });
          }}
        />
      )}
    </div>
  );
}
