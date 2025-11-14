import React from 'react';
import type { Gender } from '../../types';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton } from './OnboardingComponents';

interface StepGenderProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (gender: Gender) => void;
  value: Gender;
  totalSteps: number;
}

export const StepGender: React.FC<StepGenderProps> = ({ onNext, onBack, onSelect, value, totalSteps }) => {
  const genders: Gender[] = ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'];

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Como você se identifica?"
        subtitle="Isso nos ajuda a personalizar suas metas e acompanhamento."
        onBack={onBack}
        step={2}
        totalSteps={totalSteps}
      />
      <div className="flex-grow">
        {genders.map((gender) => (
          <OptionButton key={gender} onClick={() => onSelect(gender)} isSelected={value === gender}>
            {gender}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};