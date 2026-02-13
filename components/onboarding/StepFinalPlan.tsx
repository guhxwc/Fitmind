
import React, { useEffect, useState } from 'react';
import { OnboardingScreen, OnboardingFooter } from './OnboardingComponents';
import type { UserData } from '../../types';
import { 
    ShieldCheckIcon, 
    SyringeIcon, 
    WaterDropIcon, 
    FlameIcon, 
    PersonStandingIcon, 
    BarChartIcon, 
    BookOpenIcon,
    ScaleIcon,
    ChevronLeftIcon,
    XMarkIcon
} from '../core/Icons';

interface StepFinalPlanProps {
  onNext: () => void;
  onBack: () => void;
  data: Omit<UserData, 'id'>;
}

export const StepFinalPlan: React.FC<StepFinalPlanProps> = ({ onNext, onBack, data }) => {
  const currentWeight = data.weight;
  const startWeight = data.startWeight || currentWeight; 
  const targetWeight = data.targetWeight;
  
  // Calculations
  const waterGoal = (currentWeight * 0.035).toFixed(1);
  const proteinGoal = Math.round(currentWeight * 1.6);
  
  const heightM = data.height / 100;
  const bmi = currentWeight / (heightM * heightM);
  const targetBMI = targetWeight / (heightM * heightM);

  // Animation triggers
  const [animateChart, setAnimateChart] = useState(false);
  useEffect(() => {
      setTimeout(() => setAnimateChart(true), 100);
  }, []);

  return (
    <OnboardingScreen>
      <style>{`
        @keyframes drawPath {
            from { stroke-dashoffset: 1000; }
            to { stroke-dashoffset: 0; }
        }
        @keyframes fadeInChart {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .chart-path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: drawPath 2.5s ease-out forwards;
        }
        .chart-area {
            opacity: 0;
            animation: fadeInChart 1.5s ease forwards 0.5s;
        }
        .data-point {
            opacity: 0;
            animation: fadeInChart 0.5s ease forwards;
        }
      `}</style>

      {/* 1. Navegação Topo (Fixa mas transparente) */}
      <div className="flex-none pt-4 pb-2 z-30 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
          >
              <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
          >
              <XMarkIcon className="w-5 h-5" />
          </button>
      </div>

      {/* 2. Conteúdo Rolável (Título Incluído) */}
      <div className="flex-grow overflow-y-auto hide-scrollbar -mx-6 px-6 py-2">
          
          {/* Título e Badges (Agora rolam com a página) */}
          <div className="flex flex-col items-center text-center mb-8 mt-2 animate-fade-in">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
                Seu Plano Personalizado
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-5">
                Estruturado para maximizar os efeitos do {data.medication.name} enquanto preserva sua saúde.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                      <ShieldCheckIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Perfil Analisado</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      <BookOpenIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Base Científica</span>
                  </div>
              </div>
          </div>

          <div className="space-y-6 pb-8">
              {/* Card de Peso (Visual iOS 18) */}
              <div className="relative w-full bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-transform active:scale-[0.99]">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
                              <ScaleIcon className="w-4 h-4 text-blue-500" />
                              Peso Inicial
                          </div>
                          <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-extrabold tracking-tighter text-gray-900 dark:text-white leading-none">{startWeight.toFixed(1).replace('.', ',')}</span>
                              <span className="text-base font-bold text-gray-400 dark:text-gray-500">kg</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 text-[12px] font-bold border border-green-100 dark:border-green-900/30">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                          <span>Meta: {targetWeight}kg</span>
                      </div>
                  </div>

                  {/* SVG Chart Compacto */}
                  <div className="relative h-32 w-full mb-4">
                      {animateChart && (
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                              <defs>
                                  <linearGradient id="gradientWeight" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
                                      <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
                                  </linearGradient>
                              </defs>
                              <path 
                                className="chart-area" 
                                d="M0,20 C120,20 200,80 400,80 L400,120 L0,120 Z" 
                                fill="url(#gradientWeight)"
                              />
                              <path 
                                className="chart-path" 
                                d="M0,20 C120,20 200,80 400,80" 
                                fill="none" 
                                stroke="#007AFF" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                              <circle className="data-point" cx="0" cy="20" r="5" fill="#fff" stroke="#007AFF" strokeWidth="3" style={{ animationDelay: '0.8s' }} />
                              <circle className="data-point" cx="400" cy="80" r="5" fill="#007AFF" stroke="#fff" strokeWidth="3" style={{ animationDelay: '1.2s' }} />
                          </svg>
                      )}
                  </div>
              </div>

              {/* Grid de Metas Diárias */}
              <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide px-1">Sua Rotina Diária</h3>
                  <div className="grid grid-cols-2 gap-3">
                      {/* Água */}
                      <div className="col-span-1 bg-blue-500 p-5 rounded-[28px] shadow-lg shadow-blue-500/20 flex flex-col justify-between h-40 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                          <div className="relative z-10 flex justify-between items-start">
                              <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-sm">
                                  <WaterDropIcon className="w-5 h-5" />
                              </div>
                          </div>
                          <div className="relative z-10 text-white">
                              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Água</p>
                              <p className="text-3xl font-extrabold tracking-tight">{waterGoal}<span className="text-lg opacity-80 font-bold ml-0.5">L</span></p>
                          </div>
                      </div>

                      {/* Proteína e Medicação (Pilhados) */}
                      <div className="col-span-1 flex flex-col gap-3 h-40">
                          <div className="flex-1 bg-white dark:bg-[#1C1C1E] p-4 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                              <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Proteína</p>
                                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{proteinGoal}g</p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                                  <FlameIcon className="w-4 h-4" />
                              </div>
                          </div>
                          
                          <div className="flex-1 bg-white dark:bg-[#1C1C1E] p-4 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                              <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Aplicação</p>
                                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">{data.medication.nextApplication.substring(0,3)}</p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                                  <SyringeIcon className="w-4 h-4" />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Saúde Metabólica (IMC) */}
              <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                        <PersonStandingIcon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Saúde Metabólica (IMC)</h3>
                  </div>

                  <div className="flex justify-between items-end mb-3">
                      <div>
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{bmi.toFixed(1)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Atual</span>
                      </div>
                      <div className="text-right">
                          <span className="text-2xl font-extrabold text-green-600 dark:text-green-400">{targetBMI.toFixed(1)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Meta</span>
                      </div>
                  </div>

                  {/* Gradient Bar */}
                  <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 w-[25%] bg-blue-300"></div>
                      <div className="absolute top-0 bottom-0 left-[25%] w-[35%] bg-green-400"></div>
                      <div className="absolute top-0 bottom-0 left-[60%] w-[25%] bg-yellow-400"></div>
                      <div className="absolute top-0 bottom-0 left-[85%] w-[15%] bg-red-400"></div>
                      
                      <div 
                        className="absolute top-0 bottom-0 w-1.5 h-full bg-black dark:bg-white z-10 shadow-md transform -translate-x-1/2"
                        style={{ left: `${Math.min(Math.max((bmi - 15) / (40 - 15) * 100, 0), 100)}%` }}
                      ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>Baixo</span>
                      <span>Ideal</span>
                      <span>Sobre</span>
                      <span>Obes.</span>
                  </div>
              </div>

              {/* Disclaimer */}
              <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 font-medium px-4 leading-relaxed">
                  As metas e cálculos são estimativas baseadas nos dados fornecidos. Sempre consulte seu médico.
              </p>
          </div>
      </div>

      <OnboardingFooter onContinue={onNext} label="Começar Jornada" />
    </OnboardingScreen>
  );
};
