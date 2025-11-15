import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps, ToastType } from './core/Toast';

type ToastOptions = Omit<ToastProps, 'id' | 'message' | 'onClose' | 'type'>;

interface ToastContextType {
  addToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const id = Date.now() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message, type, ...options }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[100] space-y-3">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-fade-in">
             <Toast {...toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
