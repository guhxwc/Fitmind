import React, { useState } from 'react';
import Portal from './Portal';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from './Icons';

interface DatePickerModalProps {
  initialDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  maxDate?: Date;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({ initialDate, onSelect, onClose, maxDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (maxDate && newDate > maxDate) return;
    setSelectedDate(newDate);
    onSelect(newDate);
    setTimeout(onClose, 200); // Small delay for visual feedback
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const today = new Date();

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 z-[80] flex items-end justify-center backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] p-6 animate-slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Selecionar Data</h2>
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 active:scale-90 transition-transform">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-90">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button onClick={handleNextMonth} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-90">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === today.toDateString();
              const isFuture = maxDate ? date > maxDate : false;

              return (
                <button
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  disabled={isFuture}
                  className={`h-10 w-full rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-md scale-110 z-10 font-bold'
                      : isToday
                      ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold'
                      : isFuture
                      ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8">
              <button 
                  onClick={() => {
                      onSelect(new Date());
                      onClose();
                  }} 
                  className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              >
                  Voltar para Hoje
              </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
