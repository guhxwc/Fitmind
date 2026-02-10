
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepPaceSliderProps {
  onNext: () => void;
  onBack: () => void;
  value: number;
  onSelect: (p: number) => void;
  step: number;
  total: number;
}

export const StepPaceSlider: React.FC<StepPaceSliderProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const [pace, setPace] = useState(value);

  const getTip = () => {
      if (pace <= 0.5) return "Ritmo sustentável. Foco total em manter massa magra e saúde.";
      if (pace <= 1.2) return "Ritmo moderado. O equilíbrio ideal entre resultado e esforço.";
      return "Ritmo acelerado. Requer disciplina estrita na dieta.";
  };

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Velocidade da perda" 
        subtitle="Quão rápido você quer atingir a sua meta?"
        onBack={onBack}
        step={step}
        totalSteps={total}
      />

      <div className="flex-grow flex flex-col items-center justify-center w-full px-6">
        
        {/* Number Display */}
        <div className="text-center mb-12">
            <span className="text-[64px] font-extrabold tracking-tighter text-gray-900 dark:text-white leading-none">{pace.toFixed(1)}</span>
            <span className="text-xl font-medium text-gray-500 ml-2">kg/semana</span>
        </div>

        {/* Animals Row */}
        <div className="w-full flex justify-between items-end px-2 mb-4">
            <div className={`transition-all duration-300 flex flex-col items-center ${pace <= 0.5 ? 'scale-125 opacity-100 grayscale-0' : 'scale-100 opacity-30 grayscale'}`}>
                <span className="text-4xl mb-2">🦥</span>
            </div>
            <div className={`transition-all duration-300 flex flex-col items-center ${pace > 0.5 && pace <= 1.2 ? 'scale-125 opacity-100 grayscale-0' : 'scale-100 opacity-30 grayscale'}`}>
                <span className="text-4xl mb-2">🐇</span>
            </div>
            <div className={`transition-all duration-300 flex flex-col items-center ${pace > 1.2 ? 'scale-125 opacity-100 grayscale-0' : 'scale-100 opacity-30 grayscale'}`}>
                <span className="text-4xl mb-2">🐆</span>
            </div>
        </div>

        {/* Slider */}
        <div className="w-full relative py-4">
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full">
                <div 
                    className="h-full bg-black dark:bg-white rounded-full transition-all"
                    style={{ width: `${(pace / 2.0) * 100}%` }}
                ></div>
            </div>
            <input 
                type="range" 
                min="0.1" 
                max="2.0" 
                step="0.1" 
                value={pace} 
                onChange={(e) => setPace(Number(e.target.value))}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
        <div className="w-full flex justify-between mt-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>Lento</span>
            <span>Rápido</span>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl text-center border border-gray-100 dark:border-gray-800 w-full mt-10 shadow-sm">
            <p className="text-gray-600 dark:text-gray-300 font-medium text-sm leading-relaxed">
                {getTip()}
            </p>
        </div>
      </div>

      <OnboardingFooter onContinue={() => { onSelect(pace); onNext(); }} />
    </OnboardingScreen>
  );
};
