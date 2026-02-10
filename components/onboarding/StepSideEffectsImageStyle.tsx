
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton } from './OnboardingComponents';

interface StepSideEffectsProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (eff: string) => void;
  step: number;
  total: number;
}

export const StepSideEffectsImageStyle: React.FC<StepSideEffectsProps> = ({ onNext, onBack, onSelect, step, total }) => {
  const [selected, setSelected] = useState('');
  
  const options = [
      { label: 'Náusea', icon: '🤢' },
      { label: 'Fadiga', icon: '😴' },
      { label: 'Constipação', icon: '🧱' },
      { label: 'Diarreia', icon: '🌊' },
      { label: 'Dor de cabeça', icon: '🤕' },
      { label: 'Perda de apetite', icon: '🤐' },
      { label: 'Nenhum', icon: '✨' }
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Qual efeito colateral mais te incomoda?" 
        subtitle="Vamos personalizar suas dicas de saúde baseadas nisso."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      {/* Aumentado o espaçamento vertical para space-y-3 para evitar sobreposição visual */}
      <div className="flex-grow space-y-3 overflow-y-auto pb-4 px-1">
        {options.map((opt) => (
            <OptionButton 
                key={opt.label}
                isSelected={selected === opt.label}
                onClick={() => { setSelected(opt.label); onSelect(opt.label); }}
            >
                <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-sm">{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                </div>
            </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!selected} />
    </OnboardingScreen>
  );
};
