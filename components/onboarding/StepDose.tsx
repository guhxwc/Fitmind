
import React from 'react';
import type { MedicationName } from '../../types';
import { MEDICATIONS } from '../../constants';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton, smoothScrollToBottom } from './OnboardingComponents';

interface StepDoseProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (dose: string) => void;
  medicationName: MedicationName;
  value: string;
  totalSteps: number;
}

export const StepDose: React.FC<StepDoseProps> = ({ onNext, onBack, onSelect, medicationName, value, totalSteps }) => {
  const medication = MEDICATIONS.find(m => m.name === medicationName);
  const doses = medication ? medication.doses : [];

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
        {doses.length > 0 ? (
          doses.map((dose) => (
            <OptionButton key={dose} onClick={() => { onSelect(dose); smoothScrollToBottom(); }} isSelected={value === dose}>
              {dose}
            </OptionButton>
          ))
        ) : (
          <div className="px-4">
            <input
              type="text"
              placeholder="Digite sua dose (ex: 10 mg)"
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all"
              value={value}
              onChange={(e) => onSelect(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2 px-1">
              Digite a dose conforme prescrito pelo seu médico.
            </p>
          </div>
        )}
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};
