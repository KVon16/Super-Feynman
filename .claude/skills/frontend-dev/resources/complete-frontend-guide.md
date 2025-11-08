# Frontend Development Guide - Super Feynman
## React 18+ with Tailwind CSS

Comprehensive overview and quick reference for Super Feynman frontend development.

---

## Quick Start

### New Component Checklist

- [ ] Use functional components with hooks
- [ ] Props with JSDoc comments
- [ ] Tailwind classes for styling
- [ ] `useState` for local state
- [ ] `useEffect` for side effects (with cleanup!)
- [ ] Loading states (no early returns)
- [ ] Error handling
- [ ] Memoize expensive computations with `useMemo`
- [ ] Memoize callbacks with `useCallback`

### Project Setup

```bash
# Create React app with Vite
npm create vite@latest super-feynman-frontend -- --template react

# Install dependencies
cd super-feynman-frontend
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional dependencies
npm install react-router-dom axios
```

---

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx
│   ├── Button.jsx
│   └── Header.jsx
├── pages/               # Page components (screens)
│   ├── Home.jsx
│   ├── CourseDetail.jsx
│   ├── LectureDetail.jsx
│   └── ReviewSession.jsx
├── services/            # API integration
│   └── api.js
├── hooks/               # Custom hooks
│   ├── useCourses.js
│   ├── useLectures.js
│   └── useAudioRecorder.js
├── utils/               # Utility functions
│   └── helpers.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## Topic Guide

This guide is organized into specialized topics. Choose what you need:

### 📦 Component Patterns
**File:** [component-patterns.md](component-patterns.md)

Topics covered:
- Functional component template
- Loading & error states (no early returns!)
- Forms & validation
- Complete component examples

### 🎨 Tailwind CSS Styling
**File:** [tailwind-styling.md](tailwind-styling.md)

Topics covered:
- Tailwind configuration
- Common UI patterns (buttons, cards, modals)
- Responsive design
- Form styling
- Typography and colors

### 🔄 Data Fetching & State
**File:** [data-fetching-hooks.md](data-fetching-hooks.md)

Topics covered:
- API service layer setup
- Custom hooks for data fetching
- State management patterns
- Complete examples with useCourses

### 🎤 Audio Recording
**File:** [audio-recording.md](audio-recording.md)

Topics covered:
- useAudioRecorder custom hook
- Microphone button component
- Speech-to-text integration
- Review session with audio

### 🧭 Routing & Navigation
**File:** [routing-navigation.md](routing-navigation.md)

Topics covered:
- React Router setup
- Navigation patterns (useNavigate, useParams)
- Page templates
- Protected routes

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
    background: { DEFAULT: '#F9FAFB' }
}
```

---

## Best Practices Summary

✅ **DO:**
- Use functional components with hooks
- Memoize callbacks with `useCallback`
- Cleanup effects (timers, subscriptions)
- Use Tailwind utility classes
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
- Mix styling approaches (stick to Tailwind)

---

## Getting Help

- **Component Patterns**: See [component-patterns.md](component-patterns.md)
- **Styling Issues**: See [tailwind-styling.md](tailwind-styling.md)
- **Data Fetching**: See [data-fetching-hooks.md](data-fetching-hooks.md)
- **Audio Recording**: See [audio-recording.md](audio-recording.md)
- **Routing**: See [routing-navigation.md](routing-navigation.md)

Good luck with your hackathon! 🎨
