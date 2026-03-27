
import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface DatePickerProps {
  value: string; // ISO format YYYY-MM-DD
  onChange: (date: string) => void;
  onClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, onClose }) => {
  const initialDate = value ? new Date(value + 'T12:00:00') : new Date();
  const [viewDate, setViewDate] = useState(initialDate);
  const selectedDate = initialDate;

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill leading empty days
    const firstDay = date.getDay();
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [viewDate]);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-2xl w-full max-w-[340px] animate-pop-in border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase py-2">
            {day}
          </div>
        ))}
        {daysInMonth.map((date, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {date ? (
              <button
                onClick={() => handleDateSelect(date)}
                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all relative ${
                  isSelected(date)
                    ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <span className="text-sm">{date.getDate()}</span>
                {isToday(date) && !isSelected(date) && (
                  <div className="absolute bottom-1.5 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
        <button 
          onClick={() => handleDateSelect(new Date())}
          className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-sm font-bold active:scale-95 transition-all"
        >
          Hoje
        </button>
        <button 
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold active:scale-95 transition-all"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
