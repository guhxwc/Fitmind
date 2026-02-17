
import React from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepWeightGapProps {
  onNext: () => void;
  onBack: () => void;
  currentWeight: number;
  targetWeight: number;
  medicationName: string;
  step: number;
  totalSteps: number;
}

export const StepWeightGap: React.FC<StepWeightGapProps> = ({ 
  onNext, 
  onBack, 
  currentWeight, 
  targetWeight, 
  step, 
  totalSteps 
}) => {
  // Calculate difference
  const gap = Math.max(0, currentWeight - targetWeight).toFixed(1);
  
  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="" 
        subtitle=""
        onBack={onBack}
        step={step}
        totalSteps={totalSteps}
      />

      <div className="flex-grow flex flex-col items-center justify-center px-6 animate-fade-in pb-20 pt-32">
        
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-black dark:text-white mb-10 tracking-tight text-center">
            FitMind
        </h1>

        {/* Card */}
        <div className="bg-gray-200 dark:bg-gray-800 p-8 rounded-[32px] w-full shadow-sm text-center mb-8 border border-gray-300/50 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                Ainda tem <span className="text-blue-600 dark:text-blue-500">{gap} kg</span> pela frente? Vamos manter o ritmo juntos para você alcançar seu objetivo
            </h2>
        </div>
        
        {/* Text outside card */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto text-center font-medium">
            8 em 10 usuários do FitMind que já estão no GLP-1 quebram o platô em algumas semanas com o nosso método.
        </p>

      </div>

      <OnboardingFooter onContinue={onNext} />
    </OnboardingScreen>
  );
};
