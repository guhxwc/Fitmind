
import React from 'react';
import type { Gender } from '../../types';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton, smoothScrollToBottom } from './OnboardingComponents';

interface StepGenderProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (gender: Gender) => void;
  value: Gender;
  totalSteps: number;
}

export const StepGender: React.FC<StepGenderProps> = ({ onNext, onBack, onSelect, value, totalSteps }) => {
  const genders: Gender[] = ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'];

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Como você se identifica?"
        subtitle="Usamos alguns detalhes simples para melhorar seu acompanhamento nutricional, atividade física e plano de atividades. Tudo baseado em como seu corpo funciona."
        onBack={onBack}
        step={2}
        totalSteps={totalSteps}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {genders.map((gender) => (
          <OptionButton key={gender} onClick={() => { onSelect(gender); smoothScrollToBottom(); }} isSelected={value === gender}>
            {gender}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};
