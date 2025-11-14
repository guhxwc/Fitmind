import React from 'react';
import type { MedicationName } from '../../types';
import { MEDICATIONS } from '../../constants';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton } from './OnboardingComponents';

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
      <div className="flex-grow">
        {doses.map((dose) => (
          <OptionButton key={dose} onClick={() => onSelect(dose)} isSelected={value === dose}>
            {dose}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};