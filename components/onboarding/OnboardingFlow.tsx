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
import { StepWelcome } from './StepWelcome';
import { StepSideEffectsImageStyle } from './StepSideEffectsImageStyle';
import { StepComparison } from './StepComparison';
import { StepFinalPlan } from './StepFinalPlan';
import { useToast } from '../ToastProvider';
import { SubscriptionPage } from '../SubscriptionPage';
import { supabase } from '../../supabaseClient';

import { useAppContext } from '../AppContext';
import { track, AnalyticsEvent } from '../../lib/analytics';

// Nomes amigáveis dos steps para o funil no PostHog. Ordem = array `steps` abaixo.
const ONBOARDING_STEP_NAMES = [
  'welcome','glp_status','medication','dose','craving_day','frequency',
  'gender','age','measurements','start_date','start_weight','target_weight',
  'weight_gap','pace','activity_level','success_graph','side_effects',
  'motivation','social_proof','name','journey_duration','biggest_frustration',
  'future_worry','one_thing','dream_outcome','monthly_investment',
  'comparison','analyzing','final_plan',
] as const;

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
  const { calculateGoals } = useAppContext();
  
  // Initialize step from props if available, else localStorage, else 0
  const [step, setStep] = useState(() => {
    if (initialStep !== undefined) return initialStep;
    const savedStep = localStorage.getItem('onboarding_step');
    if (savedStep) return parseInt(savedStep, 10);
    return 0;
  });

  const [userData, setUserData] = useState<Omit<UserData, 'id'>>(() => {
    if (initialData) return initialData;
    const savedData = localStorage.getItem('onboarding_userData');
    return savedData ? JSON.parse(savedData) : DEFAULT_USER_DATA;
  });
  const { addToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user ID and load progress from Supabase
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Load progress from Supabase if not forced by initialStep
        if (initialStep === undefined) {
          try {
            const { data, error } = await supabase
              .from('onboarding_progress')
              .select('step, user_data')
              .eq('user_id', user.id)
              .single();

            if (data && !error) {
              // Only update if the saved step is valid and further than 0 (or explicitly 0 but saved)
              // Prioritize Supabase data over localStorage if available
              if (data.step !== undefined) setStep(data.step);
              if (data.user_data) setUserData(data.user_data);
            }
          } catch (err) {
            console.error("Error loading onboarding progress:", err);
          }
        }
      }
      setIsLoading(false);
    };

    initUser();
  }, [initialStep]);

  // Save progress to Supabase and localStorage
  useEffect(() => {
      // Save step to localStorage whenever it changes, unless we are in the forced return flow (initialStep used)
      if (initialStep === undefined && !isLoading) {
        localStorage.setItem('onboarding_step', step.toString());
        localStorage.setItem('onboarding_userData', JSON.stringify(userData));

        // Save to Supabase
        if (userId) {
          const saveToSupabase = async () => {
            try {
              await supabase
                .from('onboarding_progress')
                .upsert({ 
                  user_id: userId,
                  step: step,
                  user_data: userData,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            } catch (err) {
              console.error("Error saving onboarding progress:", err);
            }
          };
          saveToSupabase();
        }
      }
      
      // Track step view para funil PostHog
      if (!isLoading) {
        track(AnalyticsEvent.onboardingStepViewed, {
          step_index: step,
          step_name: ONBOARDING_STEP_NAMES[step] || `step_${step}`,
          total_steps: TOTAL_STEPS,
        });
      }

      // Scroll to top on step change
      const root = document.getElementById('root');
      if (root) {
          root.scrollTo(0, 0);
      }
      window.scrollTo(0, 0);
  }, [step, initialStep, userData, userId, isLoading]);

  // Fire once quando isLoading vira false
  useEffect(() => {
    if (!isLoading) track(AnalyticsEvent.onboardingStarted, { initial_step: step });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Detecta abandono do onboarding no F5 / fechar aba
  useEffect(() => {
    const handleUnload = () => {
      if (step < ONBOARDING_STEP_NAMES.length - 1) {
        track(AnalyticsEvent.onboardingAbandoned, {
          step_index: step,
          step_name: ONBOARDING_STEP_NAMES[step] || `step_${step}`,
        });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [step]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(0, prev - 1));

  const updateUserData = (updates: Partial<Omit<UserData, 'id'>>) => {
    setUserData((prev) => {
      const newData = { ...prev, ...updates };
      
      // If physical data changes, recalculate goals
      const physicalKeys = ['weight', 'height', 'age', 'gender', 'activityLevel'];
      const hasPhysicalUpdate = Object.keys(updates).some(key => physicalKeys.includes(key));
      
      if (hasPhysicalUpdate) {
        newData.goals = calculateGoals(
          newData.weight, 
          newData.activityLevel, 
          newData.height, 
          newData.age, 
          newData.gender
        );
      }
      
      return newData;
    });
  };

  const handleComplete = () => {
    // For unauthenticated users, we set a flag so that once they authenticate
    // they don't see the StepFinalPlan again immediately in FreeUserFlow
    if (!userId) {
       localStorage.setItem('skip_final_plan', 'true');
    }
    
    // Only clear local storage if the user is logged in
    // For unauthenticated users, we need these values to persist through the auth flow
    if (userId) {
      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_userData');
    }
    onComplete(userData);
  };

  // Total questions/interactive steps (excluding Analyzing and FinalPlan)
  const TOTAL_STEPS = 26;

  // The sequence of screens
  const steps = [
    // 0. Welcome
    <StepWelcome key="welcome" onNext={nextStep} />,

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
    <StepFinalPlan key="final" data={userData} buttonLabel="Continuar" onBack={prevStep} onNext={handleComplete} />
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-black">
        {steps[step]}
    </div>
  );
};