
import React from 'react';
import { OnboardingScreen, OnboardingFooter } from './OnboardingComponents';

interface StepWelcomeProps {
  onNext: () => void;
}

export const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext }) => {
  return (
    <OnboardingScreen>
      <div className="flex-grow flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 animate-slide-up">
            <div className="w-24 h-24 bg-black dark:bg-white rounded-[32px] mb-10 flex items-center justify-center mx-auto shadow-2xl shadow-black/20 dark:shadow-white/20 transform hover:scale-105 transition-transform duration-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            
            <h1 className="text-[40px] leading-[1.1] font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              Sua jornada para uma <span className="text-blue-600 dark:text-blue-400">vida melhor</span> começa agora.
            </h1>
            
            <p className="text-[18px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10 max-w-[300px] mx-auto">
              Vamos personalizar seu plano de saúde com base no seu perfil e objetivos únicos.
            </p>
            
            <div className="inline-flex items-center gap-3 bg-white dark:bg-[#1C1C1E] px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1C1C1E] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
               </div>
               <span className="text-sm font-bold text-gray-600 dark:text-gray-300">+15k usuários ativos</span>
            </div>
        </div>
      </div>
      
      <div className="px-6 pb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button
            onClick={onNext}
            className="w-full bg-black dark:bg-white text-white dark:text-black h-[64px] rounded-[24px] text-[18px] font-bold tracking-tight transition-all active:scale-[0.98] shadow-2xl shadow-black/10 dark:shadow-white/10 flex items-center justify-center gap-3 group"
        >
            Começar Agora
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-4 font-medium">
            Leva apenas 2 minutos para completar seu perfil.
        </p>
      </div>
    </OnboardingScreen>
  );
};
