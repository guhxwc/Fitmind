import React, { useState } from 'react';
import Portal from '../core/Portal';

interface DailyNoteModalProps {
  date: Date;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export const DailyNoteModal: React.FC<DailyNoteModalProps> = ({ date, initialContent, onClose, onSave }) => {
  const [content, setContent] = useState(initialContent);
  
  const handleSave = () => {
    onSave(content);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-black w-full max-w-md rounded-[32px] p-8 flex flex-col animate-pop-in shadow-2xl relative max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
          <div className="flex-shrink-0 flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Nota do dia</h2>
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <p className="text-gray-400 dark:text-gray-500 mb-6 font-bold text-xs uppercase tracking-widest">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite suas anotações aqui..."
            className="w-full min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 text-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white border border-gray-100 dark:border-gray-800 resize-none"
            autoFocus
          />
          <div className="mt-8">
              <button onClick={handleSave} className="w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl text-lg font-bold shadow-xl active:scale-95 transition-all">
                  Salvar Nota
              </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};