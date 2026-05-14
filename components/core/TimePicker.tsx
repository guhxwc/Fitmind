
import React, { useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string; // Format HH:mm
  onChange: (time: string) => void;
  onClose: () => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, onClose }) => {
  const initialHour = parseInt(value.split(':')[0], 10);
  const initialMinute = parseInt(value.split(':')[1], 10);
  
  const MULTIPLIER = 40;
  const CENTER_HOUR_OFFSET = Math.floor(MULTIPLIER / 2) * 24;
  const CENTER_MINUTE_OFFSET = Math.floor(MULTIPLIER / 2) * 60;

  const hoursIndexRef = useRef(CENTER_HOUR_OFFSET + initialHour);
  const minutesIndexRef = useRef(CENTER_MINUTE_OFFSET + initialMinute);
  
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const hoursList = Array.from({ length: 24 * MULTIPLIER }, (_, i) => i % 24);
  const minutesList = Array.from({ length: 60 * MULTIPLIER }, (_, i) => i % 60);

  useEffect(() => {
    const hContainer = hoursRef.current;
    const mContainer = minutesRef.current;
    
    let hLastIndex = hoursIndexRef.current;
    let mLastIndex = minutesIndexRef.current;

    if (hContainer) hContainer.scrollTop = hLastIndex * 48;
    if (mContainer) mContainer.scrollTop = mLastIndex * 48;

    const setupHighlightForContainer = (
      container: HTMLDivElement | null,
      indexRef: React.MutableRefObject<number>,
      lastIndexObj: { value: number }
    ) => {
      if (!container) return;
      const update = () => {
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / 48);
        indexRef.current = index;

        if (index !== lastIndexObj.value) {
          if (lastIndexObj.value >= 0 && lastIndexObj.value < container.children.length) {
             const oldSpan = container.children[lastIndexObj.value].firstChild as HTMLElement;
             if (oldSpan) oldSpan.className = "text-3xl font-medium text-gray-300 dark:text-gray-600 scale-90";
          }
          if (index >= 0 && index < container.children.length) {
             const newSpan = container.children[index].firstChild as HTMLElement;
             if (newSpan) newSpan.className = "text-3xl font-bold text-black dark:text-white scale-110";
          }
          lastIndexObj.value = index;
        }
      };
      
      container.addEventListener('scroll', update, { passive: true });
      
      // Initial style setup
      if (lastIndexObj.value >= 0 && lastIndexObj.value < container.children.length) {
         const initialSpan = container.children[lastIndexObj.value].firstChild as HTMLElement;
         if (initialSpan) initialSpan.className = "text-3xl font-bold text-black dark:text-white scale-110";
      }

      return update;
    };

    const hWrap = { value: hLastIndex };
    const mWrap = { value: mLastIndex };

    const updateH = setupHighlightForContainer(hContainer, hoursIndexRef, hWrap);
    const updateM = setupHighlightForContainer(mContainer, minutesIndexRef, mWrap);

    return () => {
      if (hContainer && updateH) hContainer.removeEventListener('scroll', updateH);
      if (mContainer && updateM) mContainer.removeEventListener('scroll', updateM);
    };
  }, []); // Run once on mount

  const handleConfirm = () => {
    const h = String(hoursList[hoursIndexRef.current] || 0).padStart(2, '0');
    const m = String(minutesList[minutesIndexRef.current] || 0).padStart(2, '0');
    onChange(`${h}:${m}`);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] w-full max-w-[320px] animate-pop-in border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center tracking-tight">Selecionar Horário</h3>
      
      <div className="flex items-center justify-center gap-2 h-[192px] relative overflow-hidden select-none">
        {/* Selection Highlight */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl -z-10 pointer-events-none"></div>
        
        {/* Hours Wheel */}
        <div 
          ref={hoursRef}
          className="w-16 h-full overflow-y-auto snap-y snap-mandatory py-[72px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {hoursList.map((h, i) => (
            <div key={i} className="h-12 flex items-center justify-center snap-center">
              <span className="text-3xl font-medium text-gray-300 dark:text-gray-600 scale-90">
                {String(h).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        <span className="text-3xl font-bold text-gray-300 dark:text-gray-600 mb-1 pointer-events-none">:</span>

        {/* Minutes Wheel */}
        <div 
          ref={minutesRef}
          className="w-16 h-full overflow-y-auto snap-y snap-mandatory py-[72px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {minutesList.map((m, i) => (
            <div key={i} className="h-12 flex items-center justify-center snap-center">
              <span className="text-3xl font-medium text-gray-300 dark:text-gray-600 scale-90">
                {String(m).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-4 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={handleConfirm}
          className="flex-1 py-4 px-4 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-all shadow-md"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};
