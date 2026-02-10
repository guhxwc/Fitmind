
import React, { useEffect, useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

export const StepSuccessGraph: React.FC<{ onNext: () => void; onBack: () => void; step: number; total: number }> = ({ onNext, onBack, step, total }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimate(true), 500);
        return () => clearTimeout(t);
    }, []);

    return (
        <OnboardingScreen>
            <OnboardingHeader 
                title="Seu Potencial de Sucesso" 
                subtitle="Com acompanhamento estruturado, você evita o efeito sanfona."
                onBack={onBack}
                step={step}
                totalSteps={total}
            />

            <div className="flex-grow flex flex-col justify-center px-4">
                <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px] shadow-sm border border-gray-200 dark:border-gray-800 relative h-72 w-full flex items-center justify-center overflow-hidden">
                    
                    {/* Y Axis Label */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        Peso (kg)
                    </div>

                    <svg className="w-full h-full pt-4 pr-2" viewBox="0 0 300 180" fill="none" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="40" y1="150" x2="280" y2="150" strokeWidth="1" strokeDasharray="4 4" className="stroke-gray-200 dark:stroke-gray-700" />
                        <line x1="40" y1="30" x2="280" y2="30" strokeWidth="1" strokeDasharray="4 4" className="stroke-gray-200 dark:stroke-gray-700" />

                        {/* Baseline Graph (Wavy/Yo-Yo effect) */}
                        <path 
                            d="M 40 150 C 70 140, 90 120, 110 130 S 150 140, 170 120 S 210 135, 230 130 S 260 140, 280 135" 
                            stroke="#D1D1D6" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="400"
                            strokeDashoffset={animate ? "0" : "400"}
                            className="transition-all duration-[2000ms] ease-out opacity-50"
                        />
                        <text x="280" y="120" className="fill-gray-400 text-[10px] font-bold text-right" textAnchor="end">Comum</text>

                        {/* FitMind Graph (Optimized Curve with slight realistic undulations but trending down) */}
                        <path 
                            d="M 40 150 C 80 145, 100 110, 130 100 S 180 80, 210 60 S 250 45, 280 40" 
                            stroke="#34C759" 
                            strokeWidth="5" 
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="400"
                            strokeDashoffset={animate ? "0" : "400"}
                            className="transition-all duration-[2500ms] ease-out delay-500"
                        />
                        {animate && <circle cx="280" cy="40" r="6" className="fill-white dark:fill-black stroke-green-500 stroke-[3px]" />}
                        <text x="280" y="25" className="fill-black dark:fill-white text-[12px] font-extrabold" textAnchor="end">FitMind</text>

                        {/* Markers */}
                        <text x="40" y="170" className="fill-gray-400 text-[10px] font-bold uppercase" textAnchor="middle">Hoje</text>
                        <text x="280" y="170" className="fill-gray-400 text-[10px] font-bold uppercase" textAnchor="middle">Meta</text>
                    </svg>
                </div>
                
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl text-center border border-blue-100 dark:border-blue-900/30">
                    <p className="text-blue-700 dark:text-blue-300 text-sm font-bold">
                        Estabilidade: Nosso método reduz a variação de peso em 70%.
                    </p>
                </div>
            </div>

            <OnboardingFooter onContinue={onNext} />
        </OnboardingScreen>
    );
};
