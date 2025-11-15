import React, { useState } from 'react';

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white dark:bg-black w-full max-w-md h-[70%] rounded-t-3xl p-6 flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nota do dia</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4 font-semibold">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite suas anotações aqui..."
          className="w-full h-full bg-gray-100/60 dark:bg-gray-800/50 rounded-xl p-4 text-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white flex-grow"
          autoFocus
        />
        <div className="mt-auto pt-6">
            <button onClick={handleSave} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold">
                Salvar Nota
            </button>
        </div>
      </div>
    </div>
  );
};