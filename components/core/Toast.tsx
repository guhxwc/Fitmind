import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: number) => void;
}

const icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
  ),
};

const colors = {
    success: { bg: 'bg-green-500', text: 'text-white' },
    error: { bg: 'bg-red-500', text: 'text-white' },
    info: { bg: 'bg-gray-800 dark:bg-gray-200', text: 'text-white dark:text-black' },
};


export const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === 0) return; // Don't auto-close if duration is 0
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    const interval = setInterval(() => {
      setProgress(prev => prev - (100 / (duration / 100)));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [id, duration, onClose]);

  return (
    <div className={`w-full max-w-sm rounded-xl shadow-lg p-4 flex items-start gap-3 relative overflow-hidden ${colors[type].bg} ${colors[type].text}`}>
        <div className="flex-shrink-0 mt-0.5">
            {icons[type]}
        </div>
        <div className="flex-grow">
            <p className="font-semibold">{message}</p>
        </div>
        <button onClick={() => onClose(id)} className="flex-shrink-0 opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        {duration > 0 && <div className="absolute bottom-0 left-0 h-1 bg-white/30 dark:bg-black/20" style={{ width: `${progress}%` }} />}
    </div>
  );
};