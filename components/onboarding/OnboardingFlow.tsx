
import React, { useState, useEffect } from 'react';
import type { UserData } from '../../types';
import { DEFAULT_USER_DATA } from '../../constants';
import { StepWelcome } from './StepWelcome';
import { StepName } from './StepName';
import { StepGender } from './StepGender';
import { StepAge } from './StepAge';
import { StepMeasurementsImageStyle } from './StepMeasurementsImageStyle';
import { StepMedication } from './StepMedication';
import { StepDose } from './StepDose';
import { StepCravingDay } from './StepCravingDay';
import { StepGlpStatus } from './StepGlpStatus';
import { StepFrequency } from './StepFrequency';
import { StepStartDate } from './StepStartDate';
import { StepWeightRuler } from './StepWeightRuler';
import { StepPaceSlider } from './StepPaceSlider';
import { StepActivityLevelImageStyle } from './StepActivityLevelImageStyle';
import { StepSuccessGraph } from './StepSuccessGraph';
import { StepMotivationImageStyle } from './StepMotivationImageStyle';
import { StepAnalyzing } from './StepAnalyzing';
import { StepSideEffectsImageStyle } from './StepSideEffectsImageStyle';
import { StepComparison } from './StepComparison';
import { StepFinalPlan } from './StepFinalPlan';
import { useToast } from '../ToastProvider';
// Funnel Steps
import { 
  StepDuration, 
  StepFrustration, 
  StepFutureWorry, 
  StepOneThing, 
  StepDreamOutcome, 
  StepInvestment 
} from './StepFunnelQuestions';

interface OnboardingFlowProps {
  onComplete: (data: Omit<UserData, 'id'>) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState<Omit<UserData, 'id'>>(DEFAULT_USER_DATA);
  const { addToast } = useToast();

  useEffect(() => {
      // Micro-Rewards Logic
      if (step === 6) {
          addToast("Você está 30% mais perto do seu plano personalizado!", "success", { duration: 3000 });
      } else if (step === 12) {
          addToast("Quase lá! Você está 67% completo.", "success", { duration: 3000 });
      }
  }, [step, addToast]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(0, prev - 1));

  const updateUserData = (updates: Partial<Omit<UserData, 'id'>>) => {
    setUserData((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    onComplete(userData);
  };
  
  const TOTAL_STEPS = 24;

  // The sequence of screens
  const steps = [
    <StepWelcome key="welcome" onNext={nextStep} />, 
    <StepName key="name" onNext={nextStep} onBack={prevStep} value={userData.name} onSelect={(name) => updateUserData({ name })} step={1} totalSteps={TOTAL_STEPS} />,
    <StepGender key="gender" onNext={nextStep} onBack={prevStep} value={userData.gender} onSelect={(gender) => updateUserData({ gender })} totalSteps={TOTAL_STEPS} />,
    <StepAge key="age" onNext={nextStep} onBack={prevStep} value={userData.age} onSelect={(age) => updateUserData({ age })} totalSteps={TOTAL_STEPS} />,
    <StepGlpStatus key="glp" onNext={nextStep} onBack={prevStep} value={userData.glpStatus} onSelect={(status) => updateUserData({ glpStatus: status })} step={4} total={TOTAL_STEPS} />,
    <StepMedication key="med" onNext={nextStep} onBack={prevStep} value={userData.medication.name} onSelect={(name) => updateUserData({ medication: { ...userData.medication, name } })} totalSteps={TOTAL_STEPS} />,
    <StepDose key="dose" onNext={nextStep} onBack={prevStep} medicationName={userData.medication.name} value={userData.medication.dose} onSelect={(dose) => updateUserData({ medication: { ...userData.medication, dose } })} totalSteps={TOTAL_STEPS} />,
    <StepCravingDay key="craving" onNext={nextStep} onBack={prevStep} value={userData.medication.nextApplication} onSelect={(day) => updateUserData({ medication: { ...userData.medication, nextApplication: day } })} totalSteps={TOTAL_STEPS} />,
    <StepFrequency key="freq" onNext={nextStep} onBack={prevStep} value={userData.applicationFrequency} onSelect={(freq) => updateUserData({ applicationFrequency: freq })} step={8} total={TOTAL_STEPS} />,
    
    // Wrapped Measurement Step with Lead Magnet Banner
    <div key="measure-wrapper" className="flex flex-col h-full">
        {step === 9 && (
            <div className="mx-6 mt-safe-top bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 animate-slide-up">
                <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-1">🎁 Presente para você</p>
                <p className="text-sm text-green-800 dark:text-green-200 leading-tight">
                    Enquanto você completa, baixe grátis nosso guia: <strong>'Os 5 Erros que Anulam o Efeito do GLP-1'</strong>.
                </p>
                <button 
                    onClick={() => addToast("Guia enviado para seu email!", "success")}
                    className="mt-2 text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                >
                    Baixar Guia Grátis
                </button>
            </div>
        )}
        <StepMeasurementsImageStyle onNext={nextStep} onBack={prevStep} height={userData.height} weight={userData.weight} onSelect={(h, w) => updateUserData({ height: h, weight: w })} step={9} total={TOTAL_STEPS} />
    </div>,

    <StepStartDate key="start" onNext={nextStep} onBack={prevStep} onSelect={(date) => updateUserData({ startWeightDate: date })} step={10} total={TOTAL_STEPS} />,
    <StepWeightRuler key="startW" title="Qual o peso de quando você começou?" onNext={nextStep} onBack={prevStep} value={userData.startWeight} onSelect={(w) => updateUserData({ startWeight: w })} step={11} total={TOTAL_STEPS} />,
    <StepWeightRuler key="targetW" title="Qual sua meta de peso atual?" isGoal onNext={nextStep} onBack={prevStep} value={userData.targetWeight} startWeight={userData.weight} onSelect={(w) => updateUserData({ targetWeight: w })} step={12} total={TOTAL_STEPS} />,
    <StepPaceSlider key="pace" onNext={nextStep} onBack={prevStep} value={userData.pace} onSelect={(p) => updateUserData({ pace: p })} step={13} total={TOTAL_STEPS} />,
    <StepActivityLevelImageStyle key="activity" onNext={nextStep} onBack={prevStep} value={userData.activityLevel} onSelect={(a) => updateUserData({ activityLevel: a })} step={14} total={TOTAL_STEPS} />,
    <StepSuccessGraph key="graph" onNext={nextStep} onBack={prevStep} step={15} total={TOTAL_STEPS} />,
    <StepSideEffectsImageStyle key="effects" onNext={nextStep} onBack={prevStep} onSelect={(eff) => updateUserData({ mainSideEffect: eff })} step={16} total={TOTAL_STEPS} />,
    <StepMotivationImageStyle key="motiv" onNext={nextStep} onBack={prevStep} value={userData.motivation} onSelect={(m) => updateUserData({ motivation: m })} step={17} total={TOTAL_STEPS} />,
    
    // --- New Funnel Steps ---
    <StepDuration key="duration" onNext={nextStep} onBack={prevStep} value={userData.journeyDuration || ''} onSelect={(val) => updateUserData({ journeyDuration: val })} step={18} total={TOTAL_STEPS} />,
    <StepFrustration key="frust" onNext={nextStep} onBack={prevStep} value={userData.biggestFrustration || ''} onSelect={(val) => updateUserData({ biggestFrustration: val })} step={19} total={TOTAL_STEPS} />,
    <StepFutureWorry key="worry" onNext={nextStep} onBack={prevStep} value={userData.futureWorry || ''} onSelect={(val) => updateUserData({ futureWorry: val })} step={20} total={TOTAL_STEPS} />,
    <StepOneThing key="oneThing" onNext={nextStep} onBack={prevStep} value={userData.oneThingGuaranteed || ''} onSelect={(val) => updateUserData({ oneThingGuaranteed: val })} step={21} total={TOTAL_STEPS} />,
    <StepDreamOutcome key="dream" onNext={nextStep} onBack={prevStep} value={userData.dreamOutcome || ''} onSelect={(val) => updateUserData({ dreamOutcome: val })} step={22} total={TOTAL_STEPS} />,
    <StepInvestment key="invest" onNext={nextStep} onBack={prevStep} value={userData.monthlyInvestment || ''} onSelect={(val) => updateUserData({ monthlyInvestment: val })} step={23} total={TOTAL_STEPS} />,
    // ------------------------

    <StepComparison key="comp" onNext={nextStep} onBack={prevStep} step={24} total={TOTAL_STEPS} />,
    <StepAnalyzing key="analyze" onComplete={nextStep} />,
    <StepFinalPlan key="final" onNext={handleComplete} data={userData} />,
  ];

  return <div className="h-screen overflow-hidden bg-white dark:bg-black">{steps[step]}</div>;
};
