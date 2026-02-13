
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
    ScaleIcon
} from '../core/Icons';

interface StepFinalPlanProps {
  onNext: () => void;
  data: Omit<UserData, 'id'>;
}

export const StepFinalPlan: React.FC<StepFinalPlanProps> = ({ onNext, data }) => {
  const currentWeight = data.weight;
  const startWeight = data.startWeight || currentWeight; 
  const targetWeight = data.targetWeight;
  
  // Calculations
  const waterGoal = (currentWeight * 0.035).toFixed(1);
  const proteinGoal = Math.round(currentWeight * 1.6);
  
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  
  // Calculate Target Date (approx 0.8kg per week)
  const diff = Math.max(0, currentWeight - targetWeight);
  const weeksToGoal = Math.max(1, Math.ceil(diff / 0.8));
  const targetDateObj = new Date();
  targetDateObj.setDate(today.getDate() + (weeksToGoal * 7));
  const targetDate = targetDateObj.toLocaleDateString('pt-BR', options);

  // BMI Calculation
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

      <div className="flex-none pt-safe-top px-6 pb-4 z-20 bg-white dark:bg-black">
          <div className="mb-6 mt-2">
              <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                Seu Plano Personalizado
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 leading-relaxed">
                Baseado em 28 estudos clínicos e no perfil de 15.000 usuários. Este é o caminho para sua transformação.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                      <ShieldCheckIcon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Baseado no seu perfil</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      <BookOpenIcon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Evidência Científica</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="flex-grow overflow-y-auto hide-scrollbar px-6 pb-4 space-y-6">
          
          {/* iOS 18 Style Weight Tracker Card */}
          <div className="relative w-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[36px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700 animate-slide-up">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                  <div>
                      <div className="text-[13px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
                          <ScaleIcon className="w-4 h-4 text-blue-500" />
                          Peso Atual
                      </div>
                      <div className="flex items-baseline gap-1">
                          <span className="text-[42px] font-bold tracking-tighter text-gray-900 dark:text-white leading-none">{startWeight.toFixed(1).replace('.', ',')}</span>
                          <span className="text-lg font-semibold text-gray-400 dark:text-gray-500">kg</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100/50 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400 text-[13px] font-bold">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                      <span>Meta: {targetWeight}kg</span>
                  </div>
              </div>

              {/* SVG Chart */}
              <div className="relative h-[180px] w-full mb-6">
                  {animateChart && (
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 180" preserveAspectRatio="none">
                          <defs>
                              <linearGradient id="gradientWeight" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
                              </linearGradient>
                          </defs>
                          
                          {/* Area Fill - Inverted for Weight Loss (High Start -> Low End) */}
                          <path 
                            className="chart-area" 
                            d="M0,40 C120,40 200,140 400,140 L400,180 L0,180 Z" 
                            fill="url(#gradientWeight)"
                          />
                          
                          {/* Line Path */}
                          <path 
                            className="chart-path" 
                            d="M0,40 C120,40 200,140 400,140" 
                            fill="none" 
                            stroke="#007AFF" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            filter="drop-shadow(0 4px 8px rgba(0, 122, 255, 0.3))"
                          />
                          
                          {/* Points */}
                          <circle className="data-point" cx="0" cy="40" r="6" fill="#fff" stroke="#007AFF" strokeWidth="3" style={{ animationDelay: '0.8s' }} />
                          <circle className="data-point" cx="200" cy="90" r="5" fill="#fff" stroke="#007AFF" strokeWidth="3" style={{ animationDelay: '1s' }} />
                          <circle className="data-point" cx="400" cy="140" r="6" fill="#007AFF" stroke="#fff" strokeWidth="3" style={{ animationDelay: '1.2s' }} />
                      </svg>
                  )}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between px-2 mb-6">
                  <span className="text-[12px] font-bold text-gray-900 dark:text-white">Hoje</span>
                  <span className="text-[12px] font-medium text-gray-400">Progresso</span>
                  <span className="text-[12px] font-bold text-gray-400">Meta</span>
              </div>

              {/* Period Selector (Visual Only) */}
              <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
                  {['D', 'S', 'M', '6M', 'A'].map((p, i) => (
                      <div key={p} className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg cursor-default ${i === 2 ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}>
                          {p}
                      </div>
                  ))}
              </div>
          </div>

          {/* 2. Protocol Cards Grid */}
          <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide px-1">Rotina Diária</h3>
              <div className="grid grid-cols-2 gap-3">
                  {/* Medication Card */}
                  <div className="col-span-1 bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between h-[150px]">
                      <div className="flex items-start justify-between">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                              <SyringeIcon className="w-5 h-5" />
                          </div>
                      </div>
                      <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Próxima Dose</p>
                          <p className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{data.medication.nextApplication}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{data.applicationFrequency}</p>
                      </div>
                  </div>

                  {/* Water Card Redesigned */}
                  <div className="col-span-1 bg-blue-500 p-5 rounded-[24px] shadow-lg shadow-blue-500/20 flex flex-col justify-between h-[150px] relative overflow-hidden group">
                      {/* Decorative Wave */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/10 skew-y-6 transform origin-bottom-left translate-y-4 group-hover:translate-y-2 transition-transform"></div>
                      <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

                      <div className="flex items-start justify-between relative z-10">
                          <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-sm">
                              <WaterDropIcon className="w-5 h-5" />
                          </div>
                      </div>
                      <div className="relative z-10 text-white">
                          <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Meta Hídrica</p>
                          <p className="text-3xl font-extrabold tracking-tight">{waterGoal}<span className="text-lg opacity-80 font-bold">L</span></p>
                      </div>
                  </div>

                  {/* Protein Card */}
                  <div className="col-span-2 bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 border border-orange-100 dark:border-orange-900/30">
                              <FlameIcon className="w-6 h-6" />
                          </div>
                          <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Proteína Diária</p>
                              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{proteinGoal}g</p>
                          </div>
                      </div>
                      <div className="text-right px-2">
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md uppercase tracking-wide">Essencial</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* 3. Metabolic Health (Improved Gauge) */}
          <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                    <PersonStandingIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Saúde Metabólica (IMC)</h3>
              </div>

              <div className="flex justify-between items-end mb-4">
                  <div>
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{bmi.toFixed(1)}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Atual</p>
                  </div>
                  
                  <div className="pb-2 text-gray-300 dark:text-gray-600">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>

                  <div className="text-right">
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{targetBMI.toFixed(1)}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Meta</p>
                  </div>
              </div>

              {/* Gradient Bar - Fixed range for visualization (15 to 40) */}
              <div className="relative h-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 w-[25%] bg-blue-300"></div> {/* Underweight */}
                  <div className="absolute top-0 bottom-0 left-[25%] w-[35%] bg-green-400"></div> {/* Normal */}
                  <div className="absolute top-0 bottom-0 left-[60%] w-[25%] bg-yellow-400"></div> {/* Overweight */}
                  <div className="absolute top-0 bottom-0 left-[85%] w-[15%] bg-red-400"></div> {/* Obese */}
                  
                  {/* Current Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{ left: `${Math.min(Math.max((bmi - 15) / (40 - 15) * 100, 0), 100)}%` }}
                  ></div>
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>Abaixo</span>
                  <span>Ideal</span>
                  <span>Sobre</span>
                  <span>Obes.</span>
              </div>
          </div>

          {/* 4. Sources */}
          <div className="p-4 rounded-[20px] bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                  <BarChartIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referências</span>
              </div>
              <div className="space-y-3">
                  <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
                          <span className="text-[10px] font-bold">1</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Eficácia e Riscos do GLP-1 (Nature Medicine)</p>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
                          <span className="text-[10px] font-bold">2</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Tratamento da Obesidade (Harvard Magazine)</p>
                  </div>
              </div>
          </div>

      </div>

      <OnboardingFooter onContinue={onNext} label="Começar Agora" />
    </OnboardingScreen>
  );
};
