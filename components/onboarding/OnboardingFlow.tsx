
import React, { useState } from 'react';
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

interface OnboardingFlowProps {
  onComplete: (data: Omit<UserData, 'id'>) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState<Omit<UserData, 'id'>>(DEFAULT_USER_DATA);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(0, prev - 1));

  const updateUserData = (updates: Partial<Omit<UserData, 'id'>>) => {
    setUserData((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    onComplete(userData);
  };
  
  const TOTAL_STEPS = 18;

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
    <StepMeasurementsImageStyle key="measure" onNext={nextStep} onBack={prevStep} height={userData.height} weight={userData.weight} onSelect={(h, w) => updateUserData({ height: h, weight: w })} step={9} total={TOTAL_STEPS} />,
    <StepStartDate key="start" onNext={nextStep} onBack={prevStep} onSelect={(date) => updateUserData({ startWeightDate: date })} step={10} total={TOTAL_STEPS} />,
    <StepWeightRuler key="startW" title="Qual o peso de quando você começou?" onNext={nextStep} onBack={prevStep} value={userData.startWeight} onSelect={(w) => updateUserData({ startWeight: w })} step={11} total={TOTAL_STEPS} />,
    <StepWeightRuler key="targetW" title="Qual sua meta de peso atual?" isGoal onNext={nextStep} onBack={prevStep} value={userData.targetWeight} startWeight={userData.weight} onSelect={(w) => updateUserData({ targetWeight: w })} step={12} total={TOTAL_STEPS} />,
    <StepPaceSlider key="pace" onNext={nextStep} onBack={prevStep} value={userData.pace} onSelect={(p) => updateUserData({ pace: p })} step={13} total={TOTAL_STEPS} />,
    <StepActivityLevelImageStyle key="activity" onNext={nextStep} onBack={prevStep} value={userData.activityLevel} onSelect={(a) => updateUserData({ activityLevel: a })} step={14} total={TOTAL_STEPS} />,
    <StepSuccessGraph key="graph" onNext={nextStep} onBack={prevStep} step={15} total={TOTAL_STEPS} />,
    <StepSideEffectsImageStyle key="effects" onNext={nextStep} onBack={prevStep} onSelect={(eff) => updateUserData({ mainSideEffect: eff })} step={16} total={TOTAL_STEPS} />,
    <StepMotivationImageStyle key="motiv" onNext={nextStep} onBack={prevStep} value={userData.motivation} onSelect={(m) => updateUserData({ motivation: m })} step={17} total={TOTAL_STEPS} />,
    <StepComparison key="comp" onNext={nextStep} onBack={prevStep} step={18} total={TOTAL_STEPS} />,
    <StepAnalyzing key="analyze" onComplete={nextStep} />,
    <StepFinalPlan key="final" onNext={handleComplete} data={userData} />,
  ];

  return <div className="h-screen overflow-hidden bg-white dark:bg-black">{steps[step]}</div>;
};
