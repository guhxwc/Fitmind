
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepDobProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (date: { day: number, month: number, year: number }) => void;
  value: { day: number, month: number, year: number };
}

export const StepDob: React.FC<StepDobProps> = ({ onNext, onBack, onSelect, value }) => {
  const [day, setDay] = useState(value.day || 1);
  const [month, setMonth] = useState(value.month || 1);
  const [year, setYear] = useState(value.year || 2000);

  const handleSelect = () => {
      onSelect({ day, month, year });
      onNext();
  }

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Data de Nascimento"
        subtitle="Para personalizar seu plano de saúde."
        onBack={onBack}
        step={2}
        totalSteps={7}
      />
      <div className="flex-grow flex flex-col justify-center items-center gap-4">
        <div className="flex gap-2 w-full max-w-sm">
            <div className="flex-1 bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Dia</label>
                <input 
                    type="number" 
                    value={day} 
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full text-2xl font-bold text-center bg-transparent outline-none text-gray-900 dark:text-white"
                    placeholder="DD"
                />
            </div>
            <div className="flex-1 bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Mês</label>
                <input 
                    type="number" 
                    value={month} 
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full text-2xl font-bold text-center bg-transparent outline-none text-gray-900 dark:text-white"
                    placeholder="MM"
                />
            </div>
            <div className="flex-[1.5] bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Ano</label>
                <input 
                    type="number" 
                    value={year} 
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-2xl font-bold text-center bg-transparent outline-none text-gray-900 dark:text-white"
                    placeholder="AAAA"
                />
            </div>
        </div>
      </div>
      <OnboardingFooter onContinue={handleSelect} />
    </OnboardingScreen>
  );
};
