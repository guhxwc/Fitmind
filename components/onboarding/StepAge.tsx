
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, SimpleInput } from './OnboardingComponents';

interface StepAgeProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (age: number) => void;
  value: number;
  totalSteps: number;
}

export const StepAge: React.FC<StepAgeProps> = ({ onNext, onBack, onSelect, value, totalSteps }) => {
  const [age, setAge] = useState<string>(value ? value.toString() : '');

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Qual é a sua idade?"
        subtitle="Usamos isso para calcular seu metabolismo."
        onBack={onBack}
        step={3} 
        totalSteps={totalSteps}
      />
      
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-[200px] mx-auto">
        <SimpleInput 
            value={age}
            onChange={setAge}
            label="Anos"
            placeholder="30"
            autoFocus
        />
      </div>
      
      <OnboardingFooter onContinue={() => { onSelect(Number(age)); onNext(); }} disabled={!age} />
    </OnboardingScreen>
  );
};
