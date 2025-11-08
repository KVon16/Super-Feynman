# Routing & Navigation - Super Feynman Frontend

Complete guide to routing with React Router and navigation patterns.

---

## React Router Setup

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import LectureDetail from './pages/LectureDetail';
import ReviewSession from './pages/ReviewSession';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/course/:courseId" element={<CourseDetail />} />
                <Route path="/lecture/:lectureId" element={<LectureDetail />} />
                <Route path="/review/:conceptId" element={<ReviewSession />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
```

---

## Navigation Patterns

### Using useNavigate

```javascript
import { useNavigate } from 'react-router-dom';

const Component = () => {
    const navigate = useNavigate();

    const goToCourse = (id) => {
        navigate(`/course/${id}`);
    };

    const goBack = () => {
        navigate(-1); // Go back one page
    };

    const goHome = () => {
        navigate('/');
    };

    return (
        <div>
            <button onClick={goBack} className="...">← Back</button>
            <button onClick={goHome} className="...">Home</button>
            <button onClick={() => goToCourse(123)}>View Course</button>
        </div>
    );
};
```

### Using useParams

```javascript
import { useParams } from 'react-router-dom';

const CourseDetail = () => {
    const { courseId } = useParams();

    useEffect(() => {
        // Fetch course data using courseId
        fetchCourse(courseId);
    }, [courseId]);

    return (
        <div>
            <h1>Course ID: {courseId}</h1>
        </div>
    );
};
```

---

## Page Template with Navigation

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

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Back Button */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary hover:text-primary-dark"
                    >
                        ← Back
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto p-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div>
                        {/* Page content */}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PageName;
```

---

## Navigation with State

### Passing State via Navigate

```javascript
// From source page
navigate('/review/123', {
    state: {
        conceptName: 'Photosynthesis',
        conceptDescription: 'Process by which plants...'
    }
});

// In destination page
import { useLocation } from 'react-router-dom';

const ReviewSession = () => {
    const location = useLocation();
    const { conceptName, conceptDescription } = location.state || {};

    return (
        <div>
            <h2>{conceptName}</h2>
            <p>{conceptDescription}</p>
        </div>
    );
};
```

---

## Link Components

### Basic Link

```javascript
import { Link } from 'react-router-dom';

<Link
    to={`/course/${courseId}`}
    className="text-primary hover:text-primary-dark"
>
    View Course
</Link>
```

### Card with Navigation

```javascript
const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/course/${course.id}`)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
            <h3 className="text-xl font-semibold">{course.name}</h3>
        </div>
    );
};
```

---

## Protected Routes (Optional)

```javascript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Usage in App.jsx
<Route
    path="/dashboard"
    element={
        <ProtectedRoute isAuthenticated={user !== null}>
            <Dashboard />
        </ProtectedRoute>
    }
/>
```

---

## 404 Not Found Page

```javascript
// pages/NotFound.jsx
const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

// In App.jsx routes
<Route path="*" element={<NotFound />} />
```

---

## Best Practices

✅ **DO:**
- Use descriptive route paths
- Extract route params with useParams
- Provide back navigation
- Handle missing data gracefully
- Show loading states during navigation
- Use Link for internal navigation
- Add 404 fallback route

❌ **DON'T:**
- Use window.location for internal navigation
- Forget to handle route params
- Navigate without user action on page load
- Skip loading states
- Hardcode URLs in multiple places
