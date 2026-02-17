
import React from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton, smoothScrollToBottom } from './OnboardingComponents';

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
          onClick={() => { onSelect('using'); smoothScrollToBottom(); }}
        >
          <div className="flex items-center gap-4">
             <span className="text-2xl">🪄</span>
             <span>Já estou usando GLP-1</span>
          </div>
        </OptionButton>
        <OptionButton 
          isSelected={value === 'starting'} 
          onClick={() => { onSelect('starting'); smoothScrollToBottom(); }}
        >
          <div className="flex items-center gap-4">
             <span className="text-2xl">▶️</span>
             <span>Quero começar com GLP-1</span>
          </div>
        </OptionButton>

        <div className="mt-6 px-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                *GLP-1 refere-se à classe de medicamentos como Ozempic®, Mounjaro®, Wegovy® e Saxenda®, utilizados para tratamento de diabetes e controle de peso.
            </p>
        </div>
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};
