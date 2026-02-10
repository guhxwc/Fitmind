
import React from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepMotivationImageStyleProps {
  onNext: () => void;
  onBack: () => void;
  value: string[];
  onSelect: (m: string[]) => void;
  step: number;
  total: number;
}

export const StepMotivationImageStyle: React.FC<StepMotivationImageStyleProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const options = [
      "Eu quero me sentir mais confiante com meu próprio corpo",
      "Eu apenas quero um novo começo",
      "Eu quero melhorar minha energia e força",
      "Para melhorar minha saúde e gerenciar o GLP-1",
      "Eu quero fazer isso pelas pessoas que amo"
  ];

  const toggle = (opt: string) => {
      if (value.includes(opt)) {
          onSelect(value.filter(v => v !== opt));
      } else {
          onSelect([...value, opt]);
      }
  };

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="O que está levando você a alcançar essa meta?" 
        subtitle="Estou fazendo isso por..."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow space-y-3">
        {options.map(opt => (
            <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    value.includes(opt)
                    ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black'
                    : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300'
                }`}
            >
                <span className="font-bold text-sm leading-tight pr-4">{opt}</span>
                {value.includes(opt) && (
                    <div className="bg-white dark:bg-black rounded-full p-1 shadow-sm">
                        <svg className="w-4 h-4 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </button>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={value.length === 0} />
    </OnboardingScreen>
  );
};
