import React from 'react';
import type { MedicationName } from '../../types';
import { MEDICATIONS } from '../../constants';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton } from './OnboardingComponents';

interface StepMedicationProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (name: MedicationName) => void;
  value: MedicationName;
  totalSteps: number;
}

export const StepMedication: React.FC<StepMedicationProps> = ({ onNext, onBack, onSelect, value, totalSteps }) => {
  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Qual medicamento GLP-1 você usa?"
        subtitle="Se não estiver listado, escolha 'Outro'."
        onBack={onBack}
        step={5}
        totalSteps={totalSteps}
      />
      <div className="flex-grow">
        {MEDICATIONS.map(({ name }) => (
          <OptionButton key={name} onClick={() => onSelect(name)} isSelected={value === name}>
            {name}®
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};