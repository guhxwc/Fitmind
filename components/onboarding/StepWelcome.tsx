import React from 'react';
import { OnboardingScreen, OnboardingFooter } from './OnboardingComponents';

interface StepWelcomeProps {
  onNext: () => void;
}

export const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext }) => {
  return (
    <OnboardingScreen>
      <div className="flex-grow flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 bg-gray-900 dark:bg-gray-100 rounded-3xl mb-6 flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Bem-vindo ao FitMind</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-sm">Seu parceiro inteligente na jornada de saúde com GLP-1.</p>
      </div>
      <OnboardingFooter onContinue={onNext} label="Começar" />
    </OnboardingScreen>
  );
};