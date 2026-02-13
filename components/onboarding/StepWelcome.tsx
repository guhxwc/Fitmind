
import React from 'react';
import { OnboardingScreen, OnboardingFooter } from './OnboardingComponents';

interface StepWelcomeProps {
  onNext: () => void;
}

export const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext }) => {
  return (
    <OnboardingScreen>
      <div className="flex-grow flex flex-col justify-center items-center text-center relative px-6">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-24 h-24 bg-black dark:bg-white rounded-[28px] mb-8 flex items-center justify-center shadow-2xl animate-pop-in">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 max-w-md mx-auto leading-tight">
            Você Merece Resultados Reais com Seu GLP-1
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg font-medium max-w-sm mx-auto leading-relaxed">
            Mais de 15.000 pessoas estão maximizando seus resultados e minimizando efeitos colaterais. Você é o próximo.
        </p>
      </div>
      <OnboardingFooter onContinue={onNext} label="Começar Meu Plano Gratuito" />
    </OnboardingScreen>
  );
};
