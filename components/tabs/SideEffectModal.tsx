import React, { useState } from 'react';
import type { SideEffectEntry, SideEffect, SideEffectName, SideEffectIntensity } from '../../types';

interface SideEffectModalProps {
  date: Date;
  initialEntry?: SideEffectEntry | null;
  onClose: () => void;
  onSave: (data: { effects: SideEffect[], notes?: string }) => void;
}

const COMMON_EFFECTS: SideEffectName[] = ['Náusea', 'Dor de cabeça', 'Fadiga', 'Apetite reduzido', 'Tontura', 'Constipação'];
const INTENSITIES: SideEffectIntensity[] = ['Leve', 'Moderado', 'Severo'];

const IntensityButton: React.FC<{
  label: SideEffectIntensity;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, isSelected, onClick }) => {
    const baseStyle = "w-full text-center py-2 rounded-lg font-semibold transition-all duration-200";
    const selectedStyle = "bg-black dark:bg-white text-white dark:text-black";
    const defaultStyle = "bg-gray-200/70 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600";
    
    return (
        <button onClick={onClick} className={`${baseStyle} ${isSelected ? selectedStyle : defaultStyle}`}>
            {label}
        </button>
    );
};


export const SideEffectModal: React.FC<SideEffectModalProps> = ({ date, initialEntry, onClose, onSave }) => {
  const [effects, setEffects] = useState<SideEffect[]>(initialEntry?.effects || []);
  const [notes, setNotes] = useState(initialEntry?.notes || '');

  const toggleEffect = (name: SideEffectName) => {
    const existingEffect = effects.find(e => e.name === name);
    if (existingEffect) {
      setEffects(effects.filter(e => e.name !== name));
    } else {
      setEffects([...effects, { name, intensity: 'Leve' }]);
    }
  };

  const setIntensity = (name: SideEffectName, intensity: SideEffectIntensity) => {
    setEffects(effects.map(e => e.name === name ? { ...e, intensity } : e));
  };
  
  const handleSave = () => {
      onSave({ effects, notes });
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white dark:bg-black w-full max-w-md h-[90%] rounded-t-3xl p-6 flex flex-col animate-slide-up">
        <div className="flex-shrink-0 flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Efeitos Colaterais</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-semibold">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        <div className="flex-grow overflow-y-auto space-y-6">
            <section>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Sintomas comuns</h3>
                <div className="flex flex-wrap gap-2">
                    {COMMON_EFFECTS.map(name => {
                        const isSelected = effects.some(e => e.name === name);
                        return (
                             <button
                                key={name}
                                onClick={() => toggleEffect(name)}
                                className={`px-4 py-2 rounded-full font-semibold border-2 transition-colors ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-gray-100/80 dark:bg-gray-800/80 border-gray-100/80 dark:border-gray-800/80 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}`}
                             >
                                 {name}
                             </button>
                        )
                    })}
                </div>
            </section>
            
            {effects.length > 0 && (
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Intensidade</h3>
                    {effects.map(effect => (
                        <div key={effect.name} className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl animate-fade-in">
                            <p className="font-bold text-gray-900 dark:text-gray-100 mb-3">{effect.name}</p>
                            <div className="grid grid-cols-3 gap-2 bg-white dark:bg-gray-900 p-1 rounded-xl">
                                {INTENSITIES.map(intensity => (
                                    <IntensityButton
                                        key={intensity}
                                        label={intensity}
                                        isSelected={effect.intensity === intensity}
                                        onClick={() => setIntensity(effect.name, intensity)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            <section>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Notas Adicionais</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Algum detalhe importante? (opcional)"
                    className="w-full h-24 bg-gray-100/60 dark:bg-gray-800/50 rounded-xl p-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
            </section>
        </div>

        <div className="mt-auto pt-6">
            <button onClick={handleSave} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold">
                Salvar Registros
            </button>
        </div>
      </div>
    </div>
  );
};