import React, { useState, useEffect } from 'react';
import type { MedicationName } from '../../types';
import { MEDICATIONS } from '../../constants';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton, smoothScrollToBottom } from './OnboardingComponents';
import { saveCustomDose, formatDoseInput } from '../../lib/doses';

interface StepDoseProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (dose: string) => void;
  medicationName: MedicationName;
  value: string;
  totalSteps: number;
}

export const StepDose: React.FC<StepDoseProps> = ({ onNext, onBack, onSelect, medicationName, value, totalSteps }) => {
  const standardDoses = MEDICATIONS.find(m => m.name === medicationName)?.doses || [];
  
  const isCustomValue = Boolean(value && !standardDoses.includes(value));
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(() => {
    if (standardDoses.length === 0) return true;
    return isCustomValue;
  });
  const [customInputValue, setCustomInputValue] = useState<string>(() => {
    if (isCustomValue) return value;
    return '';
  });

  // Sincroniza se a medicação mudar ou se o valor externo mudar
  useEffect(() => {
    if (standardDoses.length === 0) {
      setIsOtherSelected(true);
      if (value) setCustomInputValue(value);
      return;
    }
    if (value && !standardDoses.includes(value)) {
      setIsOtherSelected(true);
      setCustomInputValue(value);
    } else if (value && standardDoses.includes(value)) {
      setIsOtherSelected(false);
    }
  }, [medicationName, value]);

  const handleSelectStandardDose = (dose: string) => {
    setIsOtherSelected(false);
    onSelect(dose);
    smoothScrollToBottom();
  };

  const handleSelectOther = () => {
    setIsOtherSelected(true);
    if (customInputValue.trim()) {
      const formatted = formatDoseInput(customInputValue);
      if (formatted) onSelect(formatted);
    }
    smoothScrollToBottom();
  };

  const handleCustomInputChange = (text: string) => {
    setCustomInputValue(text);
    const formatted = formatDoseInput(text);
    if (formatted) {
      onSelect(formatted);
    }
  };

  const handleConfirmCustomDose = () => {
    const formatted = formatDoseInput(customInputValue);
    if (!formatted) return;

    saveCustomDose(medicationName, formatted);
    setCustomInputValue(formatted);
    onSelect(formatted);
    smoothScrollToBottom();
  };

  const handleContinue = () => {
    if (isOtherSelected) {
      const formatted = formatDoseInput(customInputValue);
      if (!formatted) return;
      saveCustomDose(medicationName, formatted);
      onSelect(formatted);
      onNext();
    } else {
      if (value) {
        onNext();
      }
    }
  };

  const isContinueDisabled = isOtherSelected ? !customInputValue.trim() : !value;

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
        {standardDoses.map((dose) => (
          <OptionButton
            key={dose}
            onClick={() => handleSelectStandardDose(dose)}
            isSelected={!isOtherSelected && value === dose}
          >
            {dose}
          </OptionButton>
        ))}

        {/* Botão Outra com design idêntico e espaçamento padrão */}
        <OptionButton
          onClick={handleSelectOther}
          isSelected={isOtherSelected}
        >
          Outra
        </OptionButton>

        {isOtherSelected && (
          <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 mb-4 animate-scale-in">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Informe a sua dose
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Ex: 0,75 mg ou 3 mg"
                className="flex-1 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-base"
                value={customInputValue}
                onChange={(e) => handleCustomInputChange(e.target.value)}
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
                className="px-5 py-3.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 text-sm shadow-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
      <OnboardingFooter onContinue={handleContinue} disabled={isContinueDisabled} />
    </OnboardingScreen>
  );
};

