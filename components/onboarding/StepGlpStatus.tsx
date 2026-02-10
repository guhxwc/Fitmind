
import React from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton } from './OnboardingComponents';

interface StepGlpStatusProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (status: 'using' | 'starting') => void;
  value: 'using' | 'starting';
  step: number;
  total: number;
}

export const StepGlpStatus: React.FC<StepGlpStatusProps> = ({ onNext, onBack, onSelect, value, step, total }) => {
  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Pronto para se sentir você novamente?" 
        subtitle="Onde você está na sua jornada GLP-1?"
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 space-y-2 pb-4">
        <OptionButton 
          isSelected={value === 'using'} 
          onClick={() => { onSelect('using'); }}
        >
          <div className="flex items-center gap-4">
             <span className="text-2xl">🪄</span>
             <span>Já estou usando GLP-1</span>
          </div>
        </OptionButton>
        <OptionButton 
          isSelected={value === 'starting'} 
          onClick={() => { onSelect('starting'); }}
        >
          <div className="flex items-center gap-4">
             <span className="text-2xl">▶️</span>
             <span>Quero começar com GLP-1</span>
          </div>
        </OptionButton>
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};
