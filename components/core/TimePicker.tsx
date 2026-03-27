
import React, { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string; // Format HH:mm
  onChange: (time: string) => void;
  onClose: () => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, onClose }) => {
  const [hours, setHours] = useState(parseInt(value.split(':')[0], 10));
  const [minutes, setMinutes] = useState(parseInt(value.split(':')[1], 10));
  
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, type: 'hours' | 'minutes') => {
    if (!ref.current) return;
    const itemHeight = 48; // h-12
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    
    if (type === 'hours') {
      setHours(hoursList[index % 24]);
    } else {
      setMinutes(minutesList[index % 60]);
    }
  };

  useEffect(() => {
    const itemHeight = 48;
    if (hoursRef.current) hoursRef.current.scrollTop = hours * itemHeight;
    if (minutesRef.current) minutesRef.current.scrollTop = minutes * itemHeight;
  }, []);

  const handleConfirm = () => {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    onChange(`${h}:${m}`);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-8 shadow-2xl w-full max-w-[320px] animate-pop-in border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center uppercase tracking-widest text-xs opacity-50">Selecionar Horário</h3>
      
      <div className="flex items-center justify-center gap-4 h-48 relative overflow-hidden">
        {/* Selection Highlight */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl -z-10 border border-gray-100 dark:border-gray-800"></div>
        
        {/* Hours Wheel */}
        <div 
          ref={hoursRef}
          onScroll={() => handleScroll(hoursRef, 'hours')}
          className="w-20 h-full overflow-y-auto snap-y snap-mandatory hide-scrollbar py-18"
        >
          {hoursList.map(h => (
            <div key={h} className="h-12 flex items-center justify-center snap-center">
              <span className={`text-2xl font-bold transition-all duration-200 ${hours === h ? 'text-black dark:text-white scale-125' : 'text-gray-300 dark:text-gray-600'}`}>
                {String(h).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        <span className="text-2xl font-bold text-gray-400 dark:text-gray-600">:</span>

        {/* Minutes Wheel */}
        <div 
          ref={minutesRef}
          onScroll={() => handleScroll(minutesRef, 'minutes')}
          className="w-20 h-full overflow-y-auto snap-y snap-mandatory hide-scrollbar py-18"
        >
          {minutesList.map(m => (
            <div key={m} className="h-12 flex items-center justify-center snap-center">
              <span className={`text-2xl font-bold transition-all duration-200 ${minutes === m ? 'text-black dark:text-white scale-125' : 'text-gray-300 dark:text-gray-600'}`}>
                {String(m).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-4 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-sm font-bold active:scale-95 transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={handleConfirm}
          className="flex-1 py-4 px-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold active:scale-95 transition-all shadow-lg"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};
