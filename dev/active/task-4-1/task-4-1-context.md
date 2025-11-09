# Task 4.1: Context

**Last Updated:** 2025-11-09

---

## Key Files

- `/figma-mocks/` - Original React components with mock data
- `/figma-mocks/App.tsx` - Main application component
- `/figma-mocks/components/` - UI components (StatusBadge, Modal, etc.)
- `/figma-mocks/globals.css` - Tailwind CSS styles

---

## Current State

- Frontend UI mocks exist in `figma-mocks/` directory
- Built with React 18+, TypeScript, Tailwind CSS, shadcn/ui
- Using mock data and simulated API calls
- No proper project structure or build setup

---

## Decisions

1. **Framework**: Using Vite for React project (fast builds, modern tooling)
2. **Location**: Create separate `/frontend` directory for clean separation
3. **Migration**: Move all figma-mocks contents to `frontend/src/`
4. **Environment**: Use `.env` file for API URL configuration

---

## Tech Stack

- React 18+
- TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components

---

## Notes

- Backend API runs on port 3001
- Frontend dev server will run on port 5173 (Vite default)
- Need to configure CORS on backend for frontend access
