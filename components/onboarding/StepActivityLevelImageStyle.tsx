
import React from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';
import type { ActivityLevel } from '../../types';

interface StepActivityLevelImageStyleProps {
  onNext: () => void;
  onBack: () => void;
  value: ActivityLevel;
  onSelect: (a: ActivityLevel) => void;
  step: number;
  total: number;
}

export const StepActivityLevelImageStyle: React.FC<StepActivityLevelImageStyleProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const levels: { label: ActivityLevel; icon: string; desc: string }[] = [
    { label: 'Sedentário', icon: '🛋️', desc: 'Pouco ou nenhum exercício' },
    { label: 'Levemente ativo', icon: '🚶', desc: 'Exercício leve 1-3 dias/semana' },
    { label: 'Moderadamente ativo', icon: '🏃', desc: 'Exercício moderado 3-5 dias/semana' },
    { label: 'Ativo', icon: '🏋️', desc: 'Exercício pesado 6-7 dias/semana' },
    { label: 'Muito ativo', icon: '🔥', desc: 'Trabalho físico pesado ou treino 2x dia' },
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Qual seu nível de atividade?" 
        subtitle="Para calcularmos seu gasto calórico diário com precisão."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow space-y-3 overflow-y-auto pb-4">
        {levels.map((level) => (
            <button
                key={level.label}
                onClick={() => { onSelect(level.label); onNext(); }}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group active:scale-[0.98] ${
                    value === level.label
                    ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
            >
                <div className="text-3xl">{level.icon}</div>
                <div>
                    <span className="font-bold text-base block">{level.label}</span>
                    <span className={`text-xs ${value === level.label ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{level.desc}</span>
                </div>
            </button>
        ))}
      </div>
    </OnboardingScreen>
  );
};
