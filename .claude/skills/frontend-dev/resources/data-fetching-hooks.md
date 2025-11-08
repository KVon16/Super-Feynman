# Data Fetching & Custom Hooks - Super Feynman Frontend

Complete guide to data fetching patterns, state management, and custom hooks.

---

## API Service Layer

```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Courses
export const courseApi = {
    getAll: () => apiClient.get('/courses'),
    create: (name) => apiClient.post('/courses', { name }),
    delete: (id) => apiClient.delete(`/courses/${id}`),
};

// Lectures
export const lectureApi = {
    getByCourseId: (courseId) => apiClient.get(`/courses/${courseId}/lectures`),
    create: (courseId, name, fileContent) =>
        apiClient.post('/lectures', { courseId, name, fileContent }),
    delete: (id) => apiClient.delete(`/lectures/${id}`),
};

// Concepts
export const conceptApi = {
    getByLectureId: (lectureId) => apiClient.get(`/lectures/${lectureId}/concepts`),
    updateProgress: (conceptId, status) =>
        apiClient.patch(`/concepts/${conceptId}/progress`, { status }),
};

export default apiClient;
```

---

## Custom Hook for Data Fetching

### Basic Pattern: useCourses

```javascript
// hooks/useCourses.js
import { useState, useEffect } from 'react';
import { courseApi } from '../services/api';

export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseApi.getAll();
            setCourses(response.data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const addCourse = async (name) => {
        try {
            const response = await courseApi.create(name);
            setCourses([...courses, response.data.data]);
            return response.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to create course');
        }
    };

    const deleteCourse = async (id) => {
        try {
            await courseApi.delete(id);
            setCourses(courses.filter(c => c.id !== id));
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to delete course');
        }
    };

    return { courses, loading, error, addCourse, deleteCourse, refetch: fetchCourses };
};
```

### Advanced Pattern: useLectures with Parameters

```javascript
// hooks/useLectures.js
import { useState, useEffect } from 'react';
import { lectureApi } from '../services/api';

export const useLectures = (courseId) => {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (courseId) {
            fetchLectures();
        }
    }, [courseId]);

    const fetchLectures = async () => {
        try {
            setLoading(true);
            const response = await lectureApi.getByCourseId(courseId);
            setLectures(response.data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addLecture = async (name, fileContent) => {
        try {
            const response = await lectureApi.create(courseId, name, fileContent);
            setLectures([response.data.data, ...lectures]);
            return response.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to create lecture');
        }
    };

    const deleteLecture = async (id) => {
        try {
            await lectureApi.delete(id);
            setLectures(lectures.filter(l => l.id !== id));
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to delete lecture');
        }
    };

    return { lectures, loading, error, addLecture, deleteLecture, refetch: fetchLectures };
};
```

---

## State Management

### Local State (useState)

```javascript
const [courses, setCourses] = useState([]);
const [selectedCourse, setSelectedCourse] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### Lifting State Up

```javascript
// Parent component manages state
const Home = () => {
    const [courses, setCourses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <>
            <CourseList courses={courses} onAdd={() => setShowAddModal(true)} />
            {showAddModal && (
                <AddCourseModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={(course) => {
                        setCourses([...courses, course]);
                        setShowAddModal(false);
                    }}
                />
            )}
        </>
    );
};
```

### Context for Global State (Optional)

```javascript
// contexts/AppContext.js
import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
```

---

## Complete Example: Using Custom Hook

```javascript
// pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const Home = () => {
    const navigate = useNavigate();
    const { courses, loading, error, addCourse, deleteCourse } = useCourses();
    const [showModal, setShowModal] = useState(false);
    const [courseName, setCourseName] = useState('');

    const handleCreateCourse = async () => {
        if (!courseName.trim()) return;

        try {
            const newCourse = await addCourse(courseName);
            setShowModal(false);
            setCourseName('');
            navigate(`/course/${newCourse.id}`);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-center text-primary">
                        Super Feynman
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 text-lg mb-6">
                            Welcome, add your first course to get started
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
                        >
                            Add a Course
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">My Courses</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark"
                            >
                                + Add Course
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map(course => (
                                <div
                                    key={course.id}
                                    onClick={() => navigate(`/course/${course.id}`)}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-semibold">{course.name}</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete this course?')) {
                                                    deleteCourse(course.id);
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Add Course Modal */}
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="Course Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateCourse()}
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateCourse}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            Create Course
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Home;
```

---

## Best Practices

✅ **DO:**
- Create custom hooks for data fetching
- Return loading, error, and data states
- Include refetch functionality
- Use try-catch for error handling
- Clear errors on retry
- Memoize API functions when needed

❌ **DON'T:**
- Fetch data directly in components
- Forget to handle loading states
- Skip error handling
- Make redundant API calls
- Mutate state directly
- Forget cleanup in useEffect
