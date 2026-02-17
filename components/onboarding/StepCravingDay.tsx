
import React from 'react';
import type { Weekday } from '../../types';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton, smoothScrollToBottom } from './OnboardingComponents';
import { WEEKDAYS } from '../../constants';

interface StepCravingDayProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (day: Weekday) => void;
  value: Weekday;
  totalSteps: number;
}

export const StepCravingDay: React.FC<StepCravingDayProps> = ({ onNext, onBack, onSelect, value, totalSteps }) => {
  const weekdays: Weekday[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Qual dia o desejo por comida é mais forte?"
        subtitle="Vamos agendar sua dose para funcionar quando seu desejo estiver mais forte."
        onBack={onBack}
        step={7}
        totalSteps={totalSteps}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {weekdays.map((day) => (
          <OptionButton key={day} onClick={() => { onSelect(day); smoothScrollToBottom(); }} isSelected={value === day}>
            {day}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};
