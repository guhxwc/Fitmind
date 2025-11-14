
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepNameProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (name: string) => void;
  value: string;
  totalSteps: number;
}

export const StepName: React.FC<StepNameProps> = ({ onNext, onBack, onSelect, value, totalSteps }) => {
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
        step={1}
        totalSteps={totalSteps}
      />
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-20 px-6 text-center text-4xl font-bold bg-gray-100/80 rounded-2xl shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-black focus:shadow-md"
            placeholder="Seu nome"
            autoFocus
          />
        </div>
      </div>
      <OnboardingFooter onContinue={handleContinue} disabled={!name || name.length < 2} />
    </OnboardingScreen>
  );
};
