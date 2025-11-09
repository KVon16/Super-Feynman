import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { CourseView } from './components/CourseView';
import { LectureView } from './components/LectureView';
import { ReviewSession } from './components/ReviewSession';
import { FeedbackScreen } from './components/FeedbackScreen';
import * as api from './services/api';
import {
  Course,
  Lecture,
  Concept,
  FeedbackData,
  ProgressStatus,
  Screen,
  APIError,
} from './types';
import { useError } from './contexts/ErrorContext';

// Re-export types for backward compatibility
export type { ProgressStatus, Concept, Lecture, Course, FeedbackData };

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [screen, setScreen] = useState<Screen>({ type: 'home' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useError();

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

      // Fetch lectures for all courses in parallel (fixes N+1 problem)
      const lecturePromises = fetchedCourses.map(course =>
        api.getLectures(course.id)
      );
      const lectureArrays = await Promise.all(lecturePromises);
      const allLectures = lectureArrays.flat();

      setLectures(allLectures);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof APIError ? err.message : 'Unable to load your courses and lectures. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (name: string) => {
    try {
      const newCourse = await api.createCourse(name);
      setCourses(prevCourses => [...prevCourses, newCourse]);
      setScreen({ type: 'course', courseId: newCourse.id });
    } catch (err) {
      console.error('Error creating course:', err);
      showError(err instanceof APIError ? err.message : 'Unable to create course. Please check your connection and try again.');
      throw err;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await api.deleteCourse(courseId);
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));
      setLectures(prevLectures => prevLectures.filter(l => l.courseId !== courseId));
      setScreen({ type: 'home' });
    } catch (err) {
      console.error('Error deleting course:', err);
      showError(err instanceof APIError ? err.message : 'Unable to delete course. Please try again.');
      throw err;
    }
  };

  const addLecture = async (courseId: string, name: string, file: File) => {
    try {
      // Call API to create lecture with file upload
      // Backend will automatically generate concepts using Anthropic API
      const newLecture = await api.createLecture(courseId, name, file);

      // Add lecture with concepts to state
      setLectures(prevLectures => [...prevLectures, newLecture]);

      return newLecture.id;
    } catch (err) {
      console.error('Error creating lecture:', err);
      showError(err instanceof APIError ? err.message : 'Unable to create lecture. Please check your file and try again.');
      throw err;
    }
  };

  const deleteLecture = async (lectureId: string, courseId: string) => {
    try {
      await api.deleteLecture(lectureId);
      setLectures(prevLectures => prevLectures.filter(l => l.id !== lectureId));
      setScreen({ type: 'course', courseId });
    } catch (err) {
      console.error('Error deleting lecture:', err);
      showError(err instanceof APIError ? err.message : 'Unable to delete lecture. Please try again.');
      throw err;
    }
  };

  const deleteConcept = async (lectureId: string, conceptId: string) => {
    try {
      await api.deleteConcept(conceptId);

      // Update state to remove concept
      setLectures(prevLectures => prevLectures.map(lecture => {
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
      showError(err instanceof APIError ? err.message : 'Unable to delete concept. Please try again.');
      throw err;
    }
  };

  const updateConceptStatus = (lectureId: string, conceptId: string, newStatus: ProgressStatus) => {
    setLectures(prevLectures => prevLectures.map(lecture => {
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

      {screen.type === 'course' && (() => {
        const course = courses.find(c => c.id === screen.courseId);
        if (!course) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4 text-lg">Course not found</p>
                <button
                  onClick={() => setScreen({ type: 'home' })}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Return Home
                </button>
              </div>
            </div>
          );
        }
        return (
          <CourseView
            course={course}
            lectures={lectures.filter(l => l.courseId === screen.courseId)}
            onBack={() => setScreen({ type: 'home' })}
            onAddLecture={addLecture}
            onDeleteLecture={(lectureId) => deleteLecture(lectureId, screen.courseId)}
            onSelectLecture={(lectureId) => setScreen({ type: 'lecture', lectureId, courseId: screen.courseId })}
          />
        );
      })()}

      {screen.type === 'lecture' && (() => {
        const lecture = lectures.find(l => l.id === screen.lectureId);
        if (!lecture) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4 text-lg">Lecture not found</p>
                <button
                  onClick={() => setScreen({ type: 'course', courseId: screen.courseId })}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Return to Course
                </button>
              </div>
            </div>
          );
        }
        return (
          <LectureView
            lecture={lecture}
            onBack={() => setScreen({ type: 'course', courseId: screen.courseId })}
            onDeleteConcept={(conceptId) => deleteConcept(screen.lectureId, conceptId)}
            onSelectConcept={(conceptId, audience) =>
              setScreen({ type: 'review', conceptId, lectureId: screen.lectureId, courseId: screen.courseId, audience })
            }
          />
        );
      })()}

      {screen.type === 'review' && (() => {
        const lecture = lectures.find(l => l.id === screen.lectureId);
        const concept = lecture?.concepts.find(c => c.id === screen.conceptId);
        if (!concept) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4 text-lg">Concept not found</p>
                <button
                  onClick={() => setScreen({ type: 'lecture', lectureId: screen.lectureId, courseId: screen.courseId })}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Return to Lecture
                </button>
              </div>
            </div>
          );
        }
        return (
          <ReviewSession
            concept={concept}
            audience={screen.audience}
            onEndSession={(feedback) =>
              setScreen({ type: 'feedback', conceptId: screen.conceptId, lectureId: screen.lectureId, courseId: screen.courseId, feedback })
            }
          />
        );
      })()}

      {screen.type === 'feedback' && (() => {
        const lecture = lectures.find(l => l.id === screen.lectureId);
        const concept = lecture?.concepts.find(c => c.id === screen.conceptId);
        if (!concept) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4 text-lg">Concept not found</p>
                <button
                  onClick={() => setScreen({ type: 'lecture', lectureId: screen.lectureId, courseId: screen.courseId })}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Return to Lecture
                </button>
              </div>
            </div>
          );
        }
        return (
          <FeedbackScreen
            concept={concept}
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
        );
      })()}
    </div>
  );
}
