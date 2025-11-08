---
name: frontend-dev
description: Frontend development guide for Super Feynman using React 18+ and Tailwind CSS. Use when creating components, pages, styling, state management, data fetching, routing, or working with frontend code. Covers modern React patterns with Hooks, Tailwind utility styling, component organization, and user interactions including audio recording.
---

# Frontend Development - Super Feynman

## Purpose

Provide React + Tailwind CSS patterns specifically for the Super Feynman learning application frontend.

## When to Use This Skill

Automatically activates when:
- Creating React components or pages
- Styling with Tailwind CSS
- Setting up routing
- Fetching data from backend APIs
- Managing state with hooks
- Handling forms and user input
- Implementing audio recording
- Working with loading and error states

---

## Quick Start

### New Component Checklist

- [ ] Functional component with hooks
- [ ] Props with JSDoc comments
- [ ] Tailwind classes for styling
- [ ] `useState` for local state
- [ ] `useEffect` with cleanup
- [ ] Loading states (no early returns!)
- [ ] Error handling
- [ ] `useCallback` for event handlers
- [ ] `useMemo` for expensive computations

---

## Core Patterns

### 1. Functional Component Template

```javascript
import React, { useState, useEffect, useCallback } from 'react';

/**
 * ComponentName - Brief description
 * @param {Object} props
 * @param {string} props.title - Component title
 */
const ComponentName = ({ title }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        return () => {
            // Cleanup
        };
    }, []);

    const handleAction = useCallback(() => {
        // Handler logic
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">{title}</h1>
        </div>
    );
};

export default ComponentName;
```

### 2. No Early Returns for Loading

```javascript
// ❌ BAD - Causes layout shift
if (loading) return <Spinner />;

// ✅ GOOD - Consistent layout
return (
    <Layout>
        {loading ? <Spinner /> : <Content />}
    </Layout>
);
```

### 3. Custom Hooks for Data Fetching

```javascript
export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    return { courses, loading, error, refetch: fetchCourses };
};
```

---

## Styling with Tailwind

### Common Patterns

```javascript
// Container
<div className="container mx-auto px-4 py-8 max-w-6xl">

// Card
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">

// Button
<button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Status Badge
<span className="px-3 py-1 rounded-full text-sm bg-green-200 text-green-800">
```

---

## Directory Structure

```
frontend/src/
├── components/
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx
│   ├── Button.jsx
│   └── Header.jsx
├── pages/
│   ├── Home.jsx
│   ├── CourseDetail.jsx
│   ├── LectureDetail.jsx
│   └── ReviewSession.jsx
├── services/
│   └── api.js
├── hooks/
│   ├── useCourses.js
│   ├── useLectures.js
│   └── useAudioRecorder.js
├── utils/
├── App.jsx
└── main.jsx
```

---

## Navigation Guide

For detailed implementations, see the resources:

| Need to... | Resource File |
|------------|--------------|
| Complete frontend setup guide | [complete-frontend-guide.md](resources/complete-frontend-guide.md) |
| Component patterns & templates | [component-patterns.md](resources/component-patterns.md) |
| Tailwind styling examples | [tailwind-styling.md](resources/tailwind-styling.md) |
| Data fetching & custom hooks | [data-fetching-hooks.md](resources/data-fetching-hooks.md) |
| Audio recording implementation | [audio-recording.md](resources/audio-recording.md) |

---

## Quick Reference

### Common Imports

```javascript
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
```

### Tailwind Color Scheme

```javascript
// tailwind.config.js
colors: {
    primary: { DEFAULT: '#3B82F6', dark: '#2563EB' },
    success: { DEFAULT: '#10B981', dark: '#059669' },
    warning: { DEFAULT: '#F59E0B' },
}
```

---

## Best Practices

✅ **DO:**
- Use functional components with hooks
- Memoize callbacks with `useCallback`
- Cleanup effects (timers, subscriptions)
- Handle loading and error states
- Use Tailwind utility classes
- Validate user inputs

❌ **DON'T:**
- Use early returns for loading (causes layout shift)
- Forget to cleanup useEffect
- Put too much logic in components
- Mix styling approaches
- Skip error handling

---

## Related Skills

- **backend-dev** - Backend APIs that frontend consumes
- **api-integration** - External API patterns (Anthropic, Whisper)

---

**Skill Status**: Optimized for Super Feynman hackathon ✅
**Progressive Disclosure**: See resources/ for detailed guides ✅
