/**
 * Error Context for Super Feynman
 * Provides unified error handling with toast-style notifications
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ErrorContextType {
  showError: (message: string) => void;
  clearError: () => void;
  error: string | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
    // Auto-dismiss after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm text-red-100">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-white hover:text-red-200 font-bold text-xl leading-none flex-shrink-0"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
}

/**
 * Hook to access error context
 * @throws {Error} If used outside ErrorProvider
 */
export function useError(): ErrorContextType {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
