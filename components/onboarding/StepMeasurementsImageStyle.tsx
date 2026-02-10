
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepMeasurementsImageStyleProps {
  onNext: () => void;
  onBack: () => void;
  height: number;
  weight: number;
  onSelect: (h: number, w: number) => void;
  step: number;
  total: number;
}

const MeasurementCard: React.FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
    unit: string;
    placeholder: string;
    icon: React.ReactNode;
}> = ({ label, value, onChange, unit, placeholder, icon }) => {
    return (
        <div className="flex-1 bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent focus-within:shadow-lg focus-within:-translate-y-1 relative group">
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
                <div className="text-gray-300 dark:text-gray-600">
                    {icon}
                </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-baseline relative">
                    <input 
                        type="number" 
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-transparent text-center text-5xl font-extrabold text-gray-900 dark:text-white focus:outline-none placeholder-gray-200 dark:placeholder-gray-700 p-0 m-0 leading-none tracking-tight"
                    />
                </div>
                <span className="text-sm font-semibold text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">{unit}</span>
            </div>
        </div>
    );
};

export const StepMeasurementsImageStyle: React.FC<StepMeasurementsImageStyleProps> = ({ onNext, onBack, height, weight, onSelect, step, total }) => {
  const [h, setH] = useState<string>(height ? height.toString() : '');
  const [w, setW] = useState<string>(weight ? weight.toString() : '');

  const handleContinue = () => {
      onSelect(Number(h), Number(w));
      onNext();
  }

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Suas Medidas" 
        subtitle="Precisamos disso para calibrar seu plano metabólico."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      
      <div className="flex-grow flex flex-col justify-center w-full px-1">
          <div className="flex flex-row gap-4 w-full h-52">
              <MeasurementCard 
                  label="Altura"
                  value={h}
                  onChange={setH}
                  unit="cm"
                  placeholder="170"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M8 21h8"/><path d="M8 3h8"/></svg>}
              />
              <MeasurementCard 
                  label="Peso"
                  value={w}
                  onChange={setW}
                  unit="kg"
                  placeholder="70"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>}
              />
          </div>
          
          <div className="mt-10 text-center px-8 opacity-60">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
                  Seus dados são privados e usados apenas para o cálculo do IMC e TMB.
              </p>
          </div>
      </div>

      <OnboardingFooter onContinue={handleContinue} disabled={!h || !w} />
    </OnboardingScreen>
  );
};
