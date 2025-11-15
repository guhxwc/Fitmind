
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

const InputBox: React.FC<{label: string, value: number, onChange: (value: number) => void, unit: string, placeholder: string, autoFocus?: boolean}> = ({label, value, onChange, unit, placeholder, autoFocus}) => {
  return (
    <div className="w-full">
        <label className="text-lg font-medium text-gray-700">{label}</label>
        <div className="relative mt-2">
            <input
                type="number"
                value={value === 0 ? '' : value}
                onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
                className="w-full p-4 pr-14 text-xl font-semibold text-gray-900 bg-gray-100/80 rounded-xl shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-black focus:shadow-md"
                placeholder={placeholder}
                autoFocus={autoFocus}
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-lg text-gray-400 pointer-events-none">{unit}</span>
        </div>
    </div>
  )
}

interface StepMeasurementsProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (height: number, weight: number) => void;
  height: number;
  weight: number;
  totalSteps: number;
}

export const StepMeasurements: React.FC<StepMeasurementsProps> = ({ onNext, onBack, onSelect, height, weight, totalSteps }) => {
  const [currentHeight, setCurrentHeight] = useState(height);
  const [currentWeight, setCurrentWeight] = useState(weight);
  
  const handleContinue = () => {
      onSelect(currentHeight, currentWeight);
      onNext();
  }

  return (
    <OnboardingScreen>
      <OnboardingHeader
        title="Quais são suas medidas?"
        subtitle="Sua altura e peso nos ajudam a calcular seu IMC e personalizar suas metas diárias."
        onBack={onBack}
        step={4}
        totalSteps={totalSteps}
      />
      <div className="flex-grow flex flex-col items-center justify-center space-y-6">
        <InputBox label="Altura" unit="cm" value={currentHeight} onChange={setCurrentHeight} placeholder="175" />
        <InputBox label="Peso" unit="kg" value={currentWeight} onChange={setCurrentWeight} placeholder="70" />
      </div>
      <OnboardingFooter onContinue={handleContinue} disabled={!currentHeight || !currentWeight} />
    </OnboardingScreen>
  );
};