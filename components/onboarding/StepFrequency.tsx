
import React from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton } from './OnboardingComponents';

interface StepFrequencyProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (freq: string) => void;
  value: string;
  step: number;
  total: number;
}

export const StepFrequency: React.FC<StepFrequencyProps> = ({ onNext, onBack, onSelect, value, step, total }) => {
  const options = ['Diariamente', 'Semanalmente', 'A cada duas semanas', 'Mensalmente', 'Ainda não sei'];
  
  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Com que frequência você aplica?" 
        subtitle="Para enviar lembretes no horário certo"
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {options.map(opt => (
          <OptionButton 
            key={opt}
            isSelected={value === opt} 
            onClick={() => onSelect(opt)}
          >
            {opt}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};
