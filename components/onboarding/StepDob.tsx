import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, Picker } from './OnboardingComponents';

interface StepDobProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (date: { day: number, month: number, year: number }) => void;
  value: { day: number, month: number, year: number };
}

export const StepDob: React.FC<StepDobProps> = ({ onNext, onBack, onSelect, value }) => {
  const [dob, setDob] = useState(value);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
  
  const handleSelect = () => {
      onSelect(dob);
      onNext();
  }

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Qual sua data de nascimento?"
        subtitle="Cada fase da vida tem necessidades diferentes."
        onBack={onBack}
        step={2}
        totalSteps={7}
      />
      <div className="flex-grow flex items-center justify-center space-x-2">
        <Picker items={days} onSelect={(day) => setDob(prev => ({ ...prev, day: Number(day) }))} initialValue={dob.day} />
        <Picker items={months} onSelect={(month) => setDob(prev => ({ ...prev, month: months.indexOf(String(month)) + 1 }))} initialValue={months[dob.month - 1]} />
        <Picker items={years} onSelect={(year) => setDob(prev => ({ ...prev, year: Number(year) }))} initialValue={dob.year} />
      </div>
      <OnboardingFooter onContinue={handleSelect} />
    </OnboardingScreen>
  );
};