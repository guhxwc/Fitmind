
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepNameProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (name: string) => void;
  value: string;
  totalSteps: number;
  step: number;
}

export const StepName: React.FC<StepNameProps> = ({ onNext, onBack, onSelect, value, totalSteps, step }) => {
  const [name, setName] = useState(value);

  const handleContinue = () => {
    onSelect(name);
    onNext();
  };

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Como podemos te chamar?"
        subtitle="Seu nome nos ajuda a personalizar sua experiência."
        onBack={onBack}
        step={step}
        totalSteps={totalSteps}
      />
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full py-5 px-6 text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:shadow-md"
            placeholder="Seu nome"
          />
        </div>
      </div>
      <OnboardingFooter onContinue={handleContinue} disabled={!name || name.length < 2} />
    </OnboardingScreen>
  );
};
