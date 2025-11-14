
import React, { useState } from 'react';
import type { UserData } from '../../types';
import { DEFAULT_USER_DATA } from '../../constants';
import { StepWelcome } from './StepWelcome';
import { StepName } from './StepName';
import { StepGender } from './StepGender';
import { StepAge } from './StepAge';
import { StepMeasurements } from './StepMeasurements';
import { StepMedication } from './StepMedication';
import { StepDose } from './StepDose';
import { StepCravingDay } from './StepCravingDay';
import { StepAnalyzing } from './StepAnalyzing';

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
    const finalData = { ...userData };
    finalData.goals.water = parseFloat((finalData.weight * 0.035).toFixed(1));
    finalData.goals.protein = Math.round(finalData.weight * 1.6);
    const bmr = 10 * finalData.weight + 6.25 * finalData.height - 5 * finalData.age + (finalData.gender === 'Masculino' ? 5 : -161);
    finalData.goals.calories = Math.round(bmr * 1.375);
    
    setStep(step + 1);
    setTimeout(() => onComplete(finalData), 4000);
  };
  
  const TOTAL_STEPS = 7; // Welcome é passo 0, o resto é contado

  const steps = [
    <StepWelcome onNext={nextStep} />,
    <StepName onNext={nextStep} onBack={prevStep} onSelect={(name) => updateUserData({ name })} value={userData.name} totalSteps={TOTAL_STEPS} />,
    <StepGender onNext={nextStep} onBack={prevStep} onSelect={(gender) => updateUserData({ gender })} value={userData.gender} totalSteps={TOTAL_STEPS} />,
    <StepAge onNext={nextStep} onBack={prevStep} onSelect={(age) => updateUserData({ age })} value={userData.age} totalSteps={TOTAL_STEPS} />,
    <StepMeasurements onNext={nextStep} onBack={prevStep} onSelect={(height, weight) => updateUserData({ height, weight, targetWeight: weight - 5 })} height={userData.height} weight={userData.weight} totalSteps={TOTAL_STEPS} />,
    <StepMedication onNext={nextStep} onBack={prevStep} onSelect={(name) => updateUserData({ medication: { ...userData.medication, name }})} value={userData.medication.name} totalSteps={TOTAL_STEPS} />,
    <StepDose onNext={nextStep} onBack={prevStep} onSelect={(dose) => updateUserData({ medication: { ...userData.medication, dose }})} medicationName={userData.medication.name} value={userData.medication.dose} totalSteps={TOTAL_STEPS} />,
    <StepCravingDay onNext={handleComplete} onBack={prevStep} onSelect={(day) => updateUserData({ medication: { ...userData.medication, nextApplication: day }})} value={userData.medication.nextApplication} totalSteps={TOTAL_STEPS} />,
    <StepAnalyzing />,
  ];

  return <div className="h-screen">{steps[step]}</div>;
};