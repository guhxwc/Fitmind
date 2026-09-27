import React, { useState, useEffect } from 'react';
import type { MedicationName } from '../../types';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton, smoothScrollToBottom } from './OnboardingComponents';
import { getAllDosesForMedication, saveCustomDose, formatDoseInput } from '../../lib/doses';

interface StepDoseProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (dose: string) => void;
  medicationName: MedicationName;
  value: string;
  totalSteps: number;
}

export const StepDose: React.FC<StepDoseProps> = ({ onNext, onBack, onSelect, medicationName, value, totalSteps }) => {
  const [doses, setDoses] = useState<string[]>(() => getAllDosesForMedication(medicationName));
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customInputValue, setCustomInputValue] = useState<string>('');

  // Sincroniza a lista de doses se a medicação mudar ou se o valor atual for personalizado
  useEffect(() => {
    const list = getAllDosesForMedication(medicationName);
    if (value && !list.includes(value)) {
      list.push(value);
    }
    setDoses(list);
  }, [medicationName, value]);

  const handleSelectDose = (dose: string) => {
    setShowCustomInput(false);
    onSelect(dose);
    smoothScrollToBottom();
  };

  const handleConfirmCustomDose = () => {
    const formatted = formatDoseInput(customInputValue);
    if (!formatted) return;

    // Salva a dose para que ela fique disponível nas próximas vezes
    saveCustomDose(medicationName, formatted);

    // Atualiza a lista local para exibi-la imediatamente como opção
    setDoses(prev => (prev.includes(formatted) ? prev : [...prev, formatted]));

    onSelect(formatted);
    setShowCustomInput(false);
    setCustomInputValue('');
    smoothScrollToBottom();
  };

  const isCurrentValueCustom = value && !doses.includes(value);

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Qual dose você vai começar?"
        subtitle="Geralmente se inicia com a menor dose disponível."
        onBack={onBack}
        step={6}
        totalSteps={totalSteps}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {doses.length > 0 && (
          <div className="space-y-1">
            {doses.map((dose) => (
              <OptionButton
                key={dose}
                onClick={() => handleSelectDose(dose)}
                isSelected={value === dose && !showCustomInput}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{dose}</span>
                </div>
              </OptionButton>
            ))}
          </div>
        )}

        {/* Botão de "Outra dose" / Opção Personalizada */}
        {!showCustomInput ? (
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(true);
              smoothScrollToBottom();
            }}
            className={`w-full text-left px-6 py-5 mb-4 rounded-2xl transition-all duration-200 border flex items-center justify-between group active:scale-[0.99] min-h-[64px] ${
              showCustomInput || isCurrentValueCustom
                ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-md'
                : 'bg-white dark:bg-[#1C1C1E] border-dashed border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]'
            }`}
          >
            <span className="text-[16px] font-semibold tracking-tight flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span>Outra dose (personalizada)</span>
            </span>
            <span className="text-sm font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
              Digitar +
            </span>
          </button>
        ) : (
          <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl border-2 border-emerald-500 shadow-md mb-4 animate-scale-in">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Informe a sua dose
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Ex: 0,75 mg ou 3 mg"
                className="flex-1 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmCustomDose();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleConfirmCustomDose}
                disabled={!customInputValue.trim()}
                className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all active:scale-95 shadow-sm text-sm"
              >
                Salvar
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Essa dose será salva e ficará disponível automaticamente para você selecionar nas próximas vezes.
            </p>
          </div>
        )}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!value && !customInputValue} />
    </OnboardingScreen>
  );
};
