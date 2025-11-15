import React, { useState } from 'react';
import type { Meal } from '../../types';
import { FlameIcon, LeafIcon, PlusIcon, UtensilsIcon } from '../core/Icons';

interface ManualMealModalProps {
  onClose: () => void;
  onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void;
}

const InputRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit?: string;
    placeholder: string;
    type?: string;
    inputMode?: 'text' | 'decimal' | 'numeric';
    autoFocus?: boolean;
}> = ({ icon, label, value, onChange, unit, placeholder, type = 'text', inputMode = 'text', autoFocus = false }) => (
    <div className="bg-gray-100/60 p-4 rounded-xl">
        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">{icon}{label}</label>
        <div className="relative mt-1">
            <input
                type={type}
                inputMode={inputMode}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="w-full bg-transparent text-2xl font-bold text-gray-900 focus:outline-none pr-12"
            />
            {unit && <span className="absolute inset-y-0 right-0 flex items-center text-lg font-medium text-gray-400 pointer-events-none">{unit}</span>}
        </div>
    </div>
);

export const ManualMealModal: React.FC<ManualMealModalProps> = ({ onClose, onAddMeal }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');

  const handleAddClick = () => {
    const numCalories = parseInt(calories, 10);
    const numProtein = parseInt(protein, 10);
    if (name.trim() && !isNaN(numCalories) && !isNaN(numProtein) && numCalories > 0 && numProtein >= 0) {
        onAddMeal({
            name: name.trim(),
            calories: numCalories,
            protein: numProtein
        });
        onClose();
    }
  }

  const isFormValid = name.trim() !== '' && calories !== '' && protein !== '' && parseInt(calories, 10) > 0 && parseInt(protein, 10) >= 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md h-[90%] rounded-t-3xl p-6 flex flex-col animate-slide-up">
        <div className="flex-shrink-0 flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Registrar Refeição</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4">
            <InputRow
                icon={<UtensilsIcon className="w-5 h-5 text-gray-500"/>}
                label="Nome da Refeição"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Salada com frango"
                autoFocus={true}
            />
            <InputRow
                icon={<FlameIcon className="w-5 h-5 text-orange-500" />}
                label="Calorias"
                value={calories}
                onChange={(e) => setCalories(e.target.value.replace(/\D/g,''))}
                unit="kcal"
                placeholder="0"
                type="text"
                inputMode="numeric"
            />
            <InputRow
                icon={<LeafIcon className="w-5 h-5 text-green-500" />}
                label="Proteína"
                value={protein}
                onChange={(e) => setProtein(e.target.value.replace(/\D/g,''))}
                unit="g"
                placeholder="0"
                type="text"
                inputMode="numeric"
            />
        </div>

        <div className="mt-auto pt-6">
            <button
              onClick={handleAddClick}
              disabled={!isFormValid}
              className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-6 h-6" />
              Adicionar Refeição
            </button>
        </div>
      </div>
    </div>
  );
};