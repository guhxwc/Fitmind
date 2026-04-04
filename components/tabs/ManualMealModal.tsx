import React, { useState } from 'react';
import type { Meal } from '../../types';
import { PlusIcon } from '../core/Icons';
import Portal from '../core/Portal';
import { useScrollLock } from '../../hooks/useScrollLock';

interface ManualMealModalProps {
  onClose: () => void;
  onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void;
  initialName?: string;
  initialMealType?: string;
}

const InputField: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  placeholder?: string;
}> = ({ label, type, value, onChange, unit, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="relative mt-1">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {unit && <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>
    </div>
);

export const ManualMealModal: React.FC<ManualMealModalProps> = ({ onClose, onAddMeal, initialName = '', initialMealType }) => {
  const [name, setName] = useState(initialName);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [mealType, setMealType] = useState(initialMealType || 'Almoço');

  useScrollLock(true);

  const mealTypes = ['Café da manhã', 'Almoço', 'Jantar', 'Lanche'];

  const handleSave = () => {
    const caloriesNum = parseInt(calories, 10);
    const proteinNum = parseInt(protein, 10);
    
    if (name.trim() && !isNaN(caloriesNum) && !isNaN(proteinNum) && caloriesNum > 0 && proteinNum >= 0) {
      onAddMeal({
        name: name.trim(),
        calories: caloriesNum,
        protein: proteinNum,
        type: mealType as any,
      });
      onClose();
    }
  };

  const canSave = name.trim() !== '' && calories !== '' && protein !== '';

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
        <div className="bg-white dark:bg-black w-full max-w-md rounded-[32px] p-8 flex flex-col animate-pop-in shadow-2xl relative max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <div className="flex-shrink-0 flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Registrar Refeição</h2>
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-6 hide-scrollbar">
              <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Tipo de Refeição</label>
                  <div className="grid grid-cols-2 gap-2">
                      {mealTypes.map(type => (
                          <button
                              key={type}
                              onClick={() => setMealType(type)}
                              className={`py-3 px-3 rounded-xl text-sm font-bold transition-all ${
                                  mealType === type
                                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                                  : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
                              }`}
                          >
                              {type}
                          </button>
                      ))}
                  </div>
              </div>
              <InputField 
                  label="Nome da Refeição"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Frango com batata doce"
              />
              <div className="grid grid-cols-2 gap-4">
                  <InputField 
                      label="Calorias"
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      unit="kcal"
                      placeholder="500"
                  />
                  <InputField 
                      label="Proteína"
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      unit="g"
                      placeholder="40"
                  />
              </div>
          </div>
          
          <div className="mt-8">
              <button 
                  onClick={handleSave} 
                  disabled={!canSave}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl text-lg font-bold disabled:opacity-50 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                  <PlusIcon className="w-6 h-6" />
                  Adicionar Refeição
              </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};