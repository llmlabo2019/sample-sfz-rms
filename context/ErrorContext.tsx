'use client';
import { createContext, useContext, useState } from 'react';

const ErrorContext = createContext({
  message: '',
  show: false,
  setError: (msg: string) => {},
  clearError: () => {}
});

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);

  const setError = (msg: string) => {
    setMessage(msg);
    setShow(true);
  };

  const clearError = () => {
    setMessage('');
    setShow(false);
  };

  return (
    <ErrorContext.Provider value={{ message, show, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
