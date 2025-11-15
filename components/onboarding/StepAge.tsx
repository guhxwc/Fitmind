
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepAgeProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (age: number) => void;
  value: number;
  totalSteps: number;
}

export const StepAge: React.FC<StepAgeProps> = ({ onNext, onBack, onSelect, value, totalSteps }) => {
  const [age, setAge] = useState(value);

  const handleContinue = () => {
    onSelect(age);
    onNext();
  };

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Qual é a sua idade?"
        subtitle="Isso nos ajuda a personalizar suas metas."
        onBack={onBack}
        step={3}
        totalSteps={totalSteps}
      />
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-full max-w-xs">
          <input
            type="number"
            value={age === 0 ? '' : age}
            onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
            className="w-full py-8 px-4 text-center text-4xl sm:text-5xl font-bold text-gray-900 bg-gray-100/80 rounded-2xl shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-black focus:shadow-md"
            placeholder="30"
          />
          <span className="absolute bottom-4 right-5 text-lg text-gray-400 pointer-events-none">anos</span>
        </div>
      </div>
      <OnboardingFooter onContinue={handleContinue} disabled={!age || age < 18 || age > 100} />
    </OnboardingScreen>
  );
};