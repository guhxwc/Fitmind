import React, { useState, useEffect } from 'react';
import type { UserData } from '../../types';
import { DEFAULT_USER_DATA } from '../../constants';
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
import { StepWeightGap } from './StepWeightGap'; 
import { StepPaceSlider } from './StepPaceSlider';
import { StepActivityLevelImageStyle } from './StepActivityLevelImageStyle';
import { StepSuccessGraph } from './StepSuccessGraph';
import { StepMotivationImageStyle } from './StepMotivationImageStyle';
import { StepSocialProof } from './StepSocialProof'; 
import { StepAnalyzing } from './StepAnalyzing';
import { StepSideEffectsImageStyle } from './StepSideEffectsImageStyle';
import { StepComparison } from './StepComparison';
import { StepFinalPlan } from './StepFinalPlan';
import { useToast } from '../ToastProvider';
import { SubscriptionPage } from '../SubscriptionPage';
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
  initialData?: Omit<UserData, 'id'>;
  initialStep?: number;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, initialData, initialStep }) => {
  // Initialize step from props if available, else localStorage, else 0
  const [step, setStep] = useState(() => {
    if (initialStep !== undefined) return initialStep;
    const savedStep = localStorage.getItem('onboarding_step');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });

  const [userData, setUserData] = useState<Omit<UserData, 'id'>>(initialData || DEFAULT_USER_DATA);
  const [showSubscription, setShowSubscription] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
      // Save step to localStorage whenever it changes, unless we are in the forced return flow (initialStep used)
      if (initialStep === undefined) {
        localStorage.setItem('onboarding_step', step.toString());
      }
      
      // Scroll to top on step change
      const root = document.getElementById('root');
      if (root) {
          root.scrollTo(0, 0);
      }
      window.scrollTo(0, 0);
  }, [step, initialStep]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(0, prev - 1));

  const updateUserData = (updates: Partial<Omit<UserData, 'id'>>) => {
    setUserData((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    // Clear saved step on completion
    localStorage.removeItem('onboarding_step');
    onComplete(userData);
  };

  const handleFinalStepNext = () => {
      setShowSubscription(true);
  };

  const handleSubscriptionClose = () => {
      setShowSubscription(false);
      handleComplete();
  };

  const handleSubscriptionSuccess = (plan: 'annual' | 'monthly') => {
      const finalData = { 
          ...userData, 
          isPro: true, 
          subscriptionStatus: 'active' as const 
      };
      localStorage.removeItem('onboarding_step');
      onComplete(finalData);
  };
  
  // Total questions/interactive steps (excluding Analyzing and FinalPlan)
  const TOTAL_STEPS = 26;

  // The sequence of screens
  const steps = [
    // 1. Status
    <StepGlpStatus key="glp" onNext={nextStep} onBack={prevStep} value={userData.glpStatus} onSelect={(status) => updateUserData({ glpStatus: status })} step={1} total={TOTAL_STEPS} />,
    
    // 2. Medication
    <StepMedication key="med" onNext={nextStep} onBack={prevStep} value={userData.medication.name} onSelect={(name) => updateUserData({ medication: { ...userData.medication, name } })} totalSteps={TOTAL_STEPS} />,
    
    // 3. Dose
    <StepDose key="dose" onNext={nextStep} onBack={prevStep} medicationName={userData.medication.name} value={userData.medication.dose} onSelect={(dose) => updateUserData({ medication: { ...userData.medication, dose } })} totalSteps={TOTAL_STEPS} />,
    
    // 4. Craving Day
    <StepCravingDay key="craving" onNext={nextStep} onBack={prevStep} value={userData.medication.nextApplication} onSelect={(day) => updateUserData({ medication: { ...userData.medication, nextApplication: day } })} totalSteps={TOTAL_STEPS} />,
    
    // 5. Frequency
    <StepFrequency key="freq" onNext={nextStep} onBack={prevStep} value={userData.applicationFrequency} onSelect={(freq) => updateUserData({ applicationFrequency: freq })} step={5} total={TOTAL_STEPS} />,
    
    // 6. Gender
    <StepGender key="gender" onNext={nextStep} onBack={prevStep} value={userData.gender} onSelect={(gender) => updateUserData({ gender })} totalSteps={TOTAL_STEPS} />,
    
    // 7. Age
    <StepAge key="age" onNext={nextStep} onBack={prevStep} value={userData.age} onSelect={(age) => updateUserData({ age })} totalSteps={TOTAL_STEPS} />,

    // 8. Measurements
    <StepMeasurementsImageStyle key="measure" onNext={nextStep} onBack={prevStep} height={userData.height} weight={userData.weight} onSelect={(h, w) => updateUserData({ height: h, weight: w })} step={8} total={TOTAL_STEPS} />,

    <StepStartDate key="start" onNext={nextStep} onBack={prevStep} onSelect={(date) => updateUserData({ startWeightDate: date })} step={9} total={TOTAL_STEPS} />,
    <StepWeightRuler key="startW" title="Qual o peso de quando você começou?" onNext={nextStep} onBack={prevStep} value={userData.startWeight} onSelect={(w) => updateUserData({ startWeight: w })} step={10} total={TOTAL_STEPS} />,
    <StepWeightRuler key="targetW" title="Qual sua meta de peso atual?" isGoal onNext={nextStep} onBack={prevStep} value={userData.targetWeight} startWeight={userData.weight} onSelect={(w) => updateUserData({ targetWeight: w })} step={11} total={TOTAL_STEPS} />,
    
    // Gap / Motivation
    <StepWeightGap 
        key="gap" 
        onNext={nextStep} 
        onBack={prevStep} 
        currentWeight={userData.weight} 
        targetWeight={userData.targetWeight} 
        medicationName={userData.medication.name}
        step={12} 
        totalSteps={TOTAL_STEPS} 
    />,

    <StepPaceSlider key="pace" onNext={nextStep} onBack={prevStep} value={userData.pace} onSelect={(p) => updateUserData({ pace: p })} step={13} total={TOTAL_STEPS} />,
    <StepActivityLevelImageStyle key="activity" onNext={nextStep} onBack={prevStep} value={userData.activityLevel} onSelect={(a) => updateUserData({ activityLevel: a })} step={14} total={TOTAL_STEPS} />,
    <StepSuccessGraph key="graph" onNext={nextStep} onBack={prevStep} step={15} total={TOTAL_STEPS} />,
    <StepSideEffectsImageStyle key="effects" onNext={nextStep} onBack={prevStep} onSelect={(eff) => updateUserData({ mainSideEffect: eff })} step={16} total={TOTAL_STEPS} />,
    <StepMotivationImageStyle key="motiv" onNext={nextStep} onBack={prevStep} value={userData.motivation} onSelect={(m) => updateUserData({ motivation: m })} step={17} total={TOTAL_STEPS} />,
    
    // 18. Social Proof (Gabrielly)
    <StepSocialProof key="proof" onNext={nextStep} onBack={prevStep} step={18} totalSteps={TOTAL_STEPS} />,

    // 19. Name
    <StepName key="name" onNext={nextStep} onBack={prevStep} value={userData.name} onSelect={(name) => updateUserData({ name })} step={19} totalSteps={TOTAL_STEPS} />,

    // --- New Funnel Steps ---
    <StepDuration key="duration" onNext={nextStep} onBack={prevStep} value={userData.journeyDuration || ''} onSelect={(val) => updateUserData({ journeyDuration: val })} step={20} total={TOTAL_STEPS} />,
    <StepFrustration key="frust" onNext={nextStep} onBack={prevStep} value={userData.biggestFrustration || ''} onSelect={(val) => updateUserData({ biggestFrustration: val })} step={21} total={TOTAL_STEPS} />,
    <StepFutureWorry key="worry" onNext={nextStep} onBack={prevStep} value={userData.futureWorry || ''} onSelect={(val) => updateUserData({ futureWorry: val })} step={22} total={TOTAL_STEPS} />,
    <StepOneThing key="oneThing" onNext={nextStep} onBack={prevStep} value={userData.oneThingGuaranteed || ''} onSelect={(val) => updateUserData({ oneThingGuaranteed: val })} step={23} total={TOTAL_STEPS} />,
    <StepDreamOutcome key="dream" onNext={nextStep} onBack={prevStep} value={userData.dreamOutcome || ''} onSelect={(val) => updateUserData({ dreamOutcome: val })} step={24} total={TOTAL_STEPS} />,
    <StepInvestment key="invest" onNext={nextStep} onBack={prevStep} value={userData.monthlyInvestment || ''} onSelect={(val) => updateUserData({ monthlyInvestment: val })} step={25} total={TOTAL_STEPS} />,
    // ------------------------

    <StepComparison key="comp" onNext={nextStep} onBack={prevStep} step={26} total={TOTAL_STEPS} />,
    <StepAnalyzing key="analyze" onComplete={nextStep} />,
    <StepFinalPlan 
        key="final" 
        onNext={handleFinalStepNext} 
        onBack={() => {
            // Prevent going back if forced to this step
            if (initialStep !== undefined) return;
            setStep(prev => prev - 2); // Skip StepAnalyzing
        }} 
        data={userData} 
    />,
  ];

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-black">
        {steps[step]}
        {showSubscription && (
            <SubscriptionPage 
                onClose={handleSubscriptionClose} 
                onSubscribe={handleSubscriptionSuccess}
                customUserData={userData} 
            />
        )}
    </div>
  );
};