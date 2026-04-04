
import { useEffect } from 'react';

export const useScrollLock = (lock: boolean) => {
  useEffect(() => {
    if (lock) {
      const root = document.getElementById('root');
      if (!root) return;
      
      const originalStyle = window.getComputedStyle(root).overflowY;
      root.style.overflowY = 'hidden';
      return () => {
        root.style.overflowY = originalStyle;
      };
    }
  }, [lock]);
};
