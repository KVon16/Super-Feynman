import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { CourseView } from './components/CourseView';
import { LectureView } from './components/LectureView';
import { ReviewSession } from './components/ReviewSession';
import { FeedbackScreen } from './components/FeedbackScreen';

export type ProgressStatus = 'Not Started' | 'Reviewing' | 'Understood' | 'Mastered';

export interface Concept {
  id: string;
  name: string;
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

  useEffect(() => {
    // Add Anthropic font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
  }, []);

  // Initialize with empty state
  useEffect(() => {
    // Could load from localStorage here
    const savedCourses = localStorage.getItem('superFeynman-courses');
    const savedLectures = localStorage.getItem('superFeynman-lectures');
    
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedLectures) setLectures(JSON.parse(savedLectures));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('superFeynman-courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('superFeynman-lectures', JSON.stringify(lectures));
  }, [lectures]);

  const addCourse = (name: string) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name,
    };
    setCourses([...courses, newCourse]);
    setScreen({ type: 'course', courseId: newCourse.id });
  };

  const deleteCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    setLectures(lectures.filter(l => l.courseId !== courseId));
    setScreen({ type: 'home' });
  };

  const addLecture = async (courseId: string, name: string, file: File) => {
    const lectureId = Date.now().toString();
    
    // Simulate processing the file
    const fileContent = await file.text();
    
    // Simulate API call to extract concepts
    const concepts = await simulateConceptExtraction(fileContent);
    
    const newLecture: Lecture = {
      id: lectureId,
      name,
      courseId,
      concepts,
    };
    
    setLectures([...lectures, newLecture]);
    return lectureId;
  };

  const deleteLecture = (lectureId: string, courseId: string) => {
    setLectures(lectures.filter(l => l.id !== lectureId));
    setScreen({ type: 'course', courseId });
  };

  const deleteConcept = (lectureId: string, conceptId: string) => {
    setLectures(lectures.map(lecture => {
      if (lecture.id === lectureId) {
        return {
          ...lecture,
          concepts: lecture.concepts.filter(c => c.id !== conceptId),
        };
      }
      return lecture;
    }));
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

// Simulate concept extraction from text
async function simulateConceptExtraction(text: string): Promise<Concept[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock concepts based on text length
  const wordCount = text.split(/\s+/).length;
  const conceptCount = Math.min(Math.max(Math.floor(wordCount / 50), 5), 15);
  
  const concepts: Concept[] = [];
  for (let i = 0; i < conceptCount; i++) {
    concepts.push({
      id: `${Date.now()}-${i}`,
      name: `Concept ${i + 1} from notes`,
      status: 'Not Started',
    });
  }
  
  return concepts;
}
