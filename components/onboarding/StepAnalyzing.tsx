
import React, { useState, useEffect } from 'react';

const CheckListItem: React.FC<{ text: string; done: boolean }> = ({ text, done }) => (
  <div className="flex items-center space-x-3 mb-4">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${done ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
      {done && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
    </div>
    <span className={`text-lg ${done ? 'text-gray-800' : 'text-gray-400'}`}>{text}</span>
  </div>
);

export const StepAnalyzing: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [checklist, setChecklist] = useState([false, false, false, false]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 35);

    const timeouts = [
      setTimeout(() => setChecklist(p => [true, ...p.slice(1)]), 500),
      setTimeout(() => setChecklist(p => [p[0], true, ...p.slice(2)]), 1500),
      setTimeout(() => setChecklist(p => [p[0], p[1], true, ...p.slice(3)]), 2500),
      setTimeout(() => setChecklist(p => [...p.slice(0, 3), true]), 3500),
    ];

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 bg-white">
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-12">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
          <circle
            className="text-black"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-800">
          {progress}%
        </div>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8">Analisando seu perfil...</h1>
      <div className="w-full max-w-xs">
        <CheckListItem text="Analisando perfil de saúde" done={checklist[0]} />
        <CheckListItem text="Calculando métricas" done={checklist[1]} />
        <CheckListItem text="Definindo objetivos" done={checklist[2]} />
        <CheckListItem text="Preparando seu plano" done={checklist[3]} />
      </div>
    </div>
  );
};