
import React, { useEffect, useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepComparisonProps {
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}

const ComparisonRow: React.FC<{ label: string; valWithout: number; valWith: number; delay: number }> = ({ label, valWithout, valWith, delay }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimate(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div className="mb-5 last:mb-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{label}</p>
            <div className="flex gap-3 items-center">
                {/* Without Bar */}
                <div className="relative h-8 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center px-3" style={{ width: `${valWithout}%` }}>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{valWithout}%</span>
                </div>

                {/* With Bar */}
                <div 
                    className="relative h-8 bg-black dark:bg-white rounded-lg flex items-center px-3 transition-all duration-1000 ease-out shadow-lg shadow-black/10 dark:shadow-white/10" 
                    style={{ width: animate ? `${valWith}%` : '0%', opacity: animate ? 1 : 0 }}
                >
                    <span className="text-[10px] font-bold text-white dark:text-black">{valWith}%</span>
                </div>
            </div>
        </div>
    );
};

export const StepComparison: React.FC<StepComparisonProps> = ({ onNext, onBack, step, total }) => {
  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Transforme seus resultados" 
        subtitle="Veja o que muda quando você acompanha com o FitMind."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />

      <div className="flex-grow flex flex-col px-1 overflow-y-auto hide-scrollbar pb-4">
        
        {/* Comparison Card */}
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] shadow-soft mb-6 border border-gray-100 dark:border-white/5">
            {/* Headers */}
            <div className="flex justify-between mb-6 px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-[15%]">Sem</span>
                <span className="text-xs font-extrabold text-black dark:text-white uppercase tracking-widest text-right">Com o FitMind</span>
            </div>

            <div className="space-y-1">
                <ComparisonRow label="Progresso na Perda de Peso" valWithout={15} valWith={85} delay={300} />
                <ComparisonRow label="Controle de Efeitos Colaterais" valWithout={20} valWith={85} delay={450} />
                <ComparisonRow label="Consistência no Tratamento" valWithout={25} valWith={90} delay={600} />
                <ComparisonRow label="Motivação Diária" valWithout={30} valWith={95} delay={750} />
                <ComparisonRow label="Resultados Visíveis" valWithout={35} valWith={90} delay={900} />
            </div>
        </div>

        {/* Insight Box */}
        <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-2xl flex gap-4 items-start border border-transparent dark:border-gray-800">
            <div className="text-2xl pt-0.5">🚀</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                Usuários que acompanham consistentemente veem até <span className="font-bold text-gray-900 dark:text-white">3x melhores resultados</span> na jornada GLP-1.
            </p>
        </div>

      </div>

      <OnboardingFooter onContinue={onNext} label="Continuar" />
    </OnboardingScreen>
  );
};
