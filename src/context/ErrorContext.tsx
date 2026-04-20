import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

interface ErrorContextType {
  errors: ErrorMessage[];
  showError: (message: string, type?: 'error' | 'warning' | 'info') => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const showError = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newError: ErrorMessage = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };
    setErrors((prev) => [...prev, newError]);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      removeError(id);
    }, 6000);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((err) => err.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, showError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
