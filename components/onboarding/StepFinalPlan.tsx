
import React from 'react';
import { OnboardingScreen, OnboardingFooter } from './OnboardingComponents';
import type { UserData } from '../../types';
import { 
    ShieldCheckIcon, 
    CalendarIcon, 
    SyringeIcon, 
    WaterDropIcon, 
    FlameIcon, 
    PersonStandingIcon, 
    BarChartIcon, 
    BookOpenIcon 
} from '../core/Icons';

interface StepFinalPlanProps {
  onNext: () => void;
  data: Omit<UserData, 'id'>;
}

export const StepFinalPlan: React.FC<StepFinalPlanProps> = ({ onNext, data }) => {
  const currentWeight = data.weight;
  const startWeight = data.startWeight || currentWeight; // Fallback se não definido
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
  
  const getBmiLabel = (val: number) => {
      if (val < 18.5) return "Abaixo do peso";
      if (val < 24.9) return "Saudável";
      if (val < 29.9) return "Sobrepeso";
      return "Obesidade";
  }

  // Timeline Progress Calculation
  // Se startWeight for igual ou menor que currentWeight (ex: ganho ou início), progresso é 0
  const totalLossNeeded = startWeight - targetWeight;
  const currentLoss = startWeight - currentWeight;
  
  let progressPercentage = 0;
  if (totalLossNeeded > 0) {
      progressPercentage = Math.min(Math.max((currentLoss / totalLossNeeded) * 100, 0), 100);
  }

  return (
    <OnboardingScreen>
      <div className="flex-none pt-safe-top px-6 pb-4 z-20 bg-white dark:bg-black">
          {/* Header Redesigned as Requested */}
          <div className="mb-6 mt-2">
              <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                Seu Plano Personalizado
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 leading-relaxed">
                Aqui está seu plano de sucesso.
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

      <div className="flex-grow overflow-y-auto hide-scrollbar px-6 pb-4 space-y-5">
          
          {/* 1. Timeline Section (Fixed) */}
          <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Cronograma Estimado</h3>
              </div>
              
              <div className="relative pt-6 pb-2 px-1">
                  {/* Base Line */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                  
                  {/* Progress Fill */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-black dark:bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>

                  <div className="relative flex justify-between w-full">
                      {/* Start Point */}
                      <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-[3px] z-10 bg-white dark:bg-black ${progressPercentage > 0 ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-600'}`}></div>
                          <div className="mt-3 text-center">
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Início</span>
                              <span className="block text-sm font-bold text-gray-900 dark:text-white">{startWeight.toFixed(0)}kg</span>
                          </div>
                      </div>

                      {/* Goal Point */}
                      <div className="flex flex-col items-center">
                          <div className="w-4 h-4 rounded-full border-[3px] border-black dark:border-white bg-black dark:bg-white z-10 shadow-lg ring-4 ring-white dark:ring-[#1C1C1E]"></div>
                          <div className="mt-3 text-center">
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Meta ({targetDate})</span>
                              <span className="block text-sm font-bold text-gray-900 dark:text-white">{targetWeight.toFixed(0)}kg</span>
                          </div>
                      </div>
                  </div>
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
