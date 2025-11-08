# Component Patterns - Super Feynman Frontend

Complete guide to React component patterns, best practices, and common implementations.

---

## Functional Component Template

```javascript
import React, { useState, useEffect, useCallback } from 'react';

/**
 * ComponentName - Brief description
 *
 * @param {Object} props
 * @param {string} props.title - Component title
 * @param {Function} props.onAction - Callback when action occurs
 */
const ComponentName = ({ title, onAction }) => {
    // 1. State declarations
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Effects
    useEffect(() => {
        // Fetch data or setup
        fetchData();

        // Cleanup function
        return () => {
            // Clean up subscriptions, timers, etc.
        };
    }, []); // Dependencies

    // 3. Event handlers (memoized)
    const handleAction = useCallback(() => {
        onAction?.();
    }, [onAction]);

    // 4. Helper functions
    const fetchData = async () => {
        try {
            setLoading(true);
            // API call
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 5. Render logic
    if (error) {
        return (
            <div className="text-red-500 p-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            {loading ? (
                <div className="flex justify-center">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    {/* Your content */}
                </div>
            )}
        </div>
    );
};

export default ComponentName;
```

---

## Key Principles

### 1. No Early Returns for Loading States (unless it's an error)

**Why:** Prevents layout shift and provides better UX

```javascript
// ❌ BAD - Causes layout shift
const Component = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    if (loading) return <LoadingSpinner />;

    return <div>{data}</div>;
};

// ✅ GOOD - Consistent layout
const Component = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    return (
        <div className="min-h-screen">
            <Header /> {/* Always visible */}
            <div className="container mx-auto p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div>{data}</div>
                )}
            </div>
        </div>
    );
};
```

### 2. Cleanup in useEffect

```javascript
useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer); // Always cleanup!
}, []);
```

### 3. Memoization

- `useCallback` for functions passed as props
- `useMemo` for expensive computations

```javascript
// Memoize callbacks
const handleClick = useCallback(() => {
    onAction?.();
}, [onAction]);

// Memoize expensive computations
const expensiveValue = useMemo(() => {
    return heavyComputation(data);
}, [data]);
```

---

## Loading & Error States

### Loading Spinner Component

```javascript
// components/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'md', text = '' }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin`} />
            {text && <p className="mt-2 text-gray-600">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
```

### Error Display Component

```javascript
const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{message}</p>
                {onRetry && (
                    <button onClick={onRetry} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500">
                        Try again →
                    </button>
                )}
            </div>
        </div>
    </div>
);
```

---

## Forms & Validation

### Controlled Inputs

```javascript
const AddCourseForm = ({ onSubmit, onCancel }) => {
    const [courseName, setCourseName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!courseName.trim()) {
            setError('Course name is required');
            return;
        }

        if (courseName.length < 3) {
            setError('Course name must be at least 3 characters');
            return;
        }

        onSubmit(courseName);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                </label>
                <input
                    type="text"
                    value={courseName}
                    onChange={(e) => {
                        setCourseName(e.target.value);
                        setError(''); // Clear error on change
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter course name"
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                    Create Course
                </button>
            </div>
        </form>
    );
};
```

### File Upload

```javascript
const FileUploadInput = ({ onFileSelect }) => {
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.txt')) {
                setFileName(file.name);
                const reader = new FileReader();
                reader.onload = (event) => {
                    onFileSelect(event.target.result);
                };
                reader.readAsText(file);
            } else {
                alert('Only .txt files are allowed');
                e.target.value = '';
            }
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Notes
            </label>
            <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />
            <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                </svg>
                {fileName || 'Choose File'}
            </label>
        </div>
    );
};
```

---

## Complete Example: Modal Component

```javascript
// components/Modal.jsx
import React, { useEffect } from 'react';

const Modal = ({ children, onClose }) => {
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;
```

---

## Best Practices Summary

✅ **DO:**
- Use functional components with hooks
- Memoize callbacks with `useCallback`
- Cleanup effects (timers, subscriptions)
- Keep components focused and small
- Extract reusable components
- Handle loading and error states
- Validate user inputs

❌ **DON'T:**
- Use early returns for loading states (causes layout shift)
- Forget to cleanup useEffect
- Put too much logic in components
- Inline complex functions
- Forget key props in lists
