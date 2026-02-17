
import React from 'react';
import { OnboardingScreen, OnboardingFooter, OnboardingHeader } from './OnboardingComponents';

interface StepSocialProofProps {
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
}

export const StepSocialProof: React.FC<StepSocialProofProps> = ({ onNext, onBack, step, totalSteps }) => {
  // URLs diretas para as imagens com timestamp para evitar cache
  const timestamp = new Date().getTime();
  const beforeImageUrl = `https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/user-photos/imagem_antes.png?t=${timestamp}`;
  const afterImageUrl = `https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/user-photos/imagem_depois.png?t=${timestamp}`;

  return (
    <OnboardingScreen>
      <div className="flex-none pt-safe-top z-20 px-4">
        {/* Custom Header */}
        <div className="flex items-center justify-between h-12 mb-2">
            <button 
                onClick={onBack} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-900 dark:text-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            
            {/* Progress Bar */}
            <div className="flex-1 mx-4 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-black dark:bg-white rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                ></div>
            </div>
            
            <div className="w-10"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center px-6 pt-2 overflow-y-auto hide-scrollbar">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                Faça como a Gabrielly
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                E perca o peso desejado com o FitMind
            </p>
        </div>

        {/* Before/After Card */}
        <div className="w-full bg-white dark:bg-[#1C1C1E] rounded-[32px] p-2 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative">
            <div className="flex gap-2 h-72">
                {/* Before Photo */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[24px] relative overflow-hidden flex items-center justify-center group">
                    <img 
                        src={beforeImageUrl}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?auto=format&fit=crop&w=800&q=80';
                        }}
                        alt="Antes" 
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Antes</span>
                    </div>
                </div>

                {/* After Photo */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[24px] relative overflow-hidden flex items-center justify-center">
                    <img 
                        src={afterImageUrl}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80';
                        }}
                        alt="Depois" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 dark:bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-white dark:text-black uppercase tracking-wider">Depois</span>
                    </div>
                </div>
            </div>

            {/* Central Arrow Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white ml-0.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
        </div>

        {/* Stats Row */}
        <div className="flex w-full justify-between px-4 mb-8">
            <div className="text-center w-1/2 border-r border-gray-200 dark:border-gray-800">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">-20kg</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Peso Perdido</p>
            </div>
            <div className="text-center w-1/2">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">2 Meses</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Duração</p>
            </div>
        </div>

        {/* Testimonial Box */}
        <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 relative">
            <div className="absolute -top-3 left-6 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-lg border border-gray-100 dark:border-gray-700">
                💬
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic pt-2">
                "Estou impressionada com os resultados! FitMind tornou minha jornada muito mais simples."
            </p>
            <p className="text-xs font-bold text-gray-900 dark:text-white mt-3">
                — Gabrielly, Usuária FitMind
            </p>
        </div>

      </div>

      <OnboardingFooter onContinue={onNext} label="Continuar" />
    </OnboardingScreen>
  );
};
