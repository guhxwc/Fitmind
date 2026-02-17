
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MainApp } from './components/MainApp';
import { Auth } from './components/Auth';
import type { UserData } from './types';
import { SupabaseSetupMessage } from './components/SupabaseSetupMessage';
import { DEFAULT_USER_DATA } from './constants';
import { InitialSettings } from './components/tabs/InitialSettings';

const App: React.FC = () => {
  if (!supabase) {
    return (
      <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto shadow-lg">
        <SupabaseSetupMessage />
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<Omit<UserData, 'id'> | null>(null);
  const [planReviewed, setPlanReviewed] = useState(false);
  const navigate = useNavigate();

  const mapProfileToUserData = (profile: any): Omit<UserData, 'id'> => ({
      name: profile.name || DEFAULT_USER_DATA.name,
      gender: profile.gender || DEFAULT_USER_DATA.gender,
      age: profile.age || DEFAULT_USER_DATA.age,
      birthDate: profile.birth_date,
      height: profile.height || DEFAULT_USER_DATA.height,
      weight: profile.weight || DEFAULT_USER_DATA.weight,
      targetWeight: profile.target_weight || DEFAULT_USER_DATA.targetWeight,
      startWeight: profile.start_weight || DEFAULT_USER_DATA.startWeight,
      startWeightDate: profile.start_weight_date,
      activityLevel: profile.activity_level || DEFAULT_USER_DATA.activityLevel,
      glpStatus: profile.glp_status || DEFAULT_USER_DATA.glpStatus,
      applicationFrequency: profile.application_frequency || DEFAULT_USER_DATA.applicationFrequency,
      pace: profile.pace || DEFAULT_USER_DATA.pace,
      motivation: profile.motivation || DEFAULT_USER_DATA.motivation,
      mainSideEffect: profile.main_side_effect,
      journeyDuration: profile.journey_duration,
      biggestFrustration: profile.biggest_frustration,
      futureWorry: profile.future_worry,
      oneThingGuaranteed: profile.one_thing_guaranteed,
      dreamOutcome: profile.dream_outcome,
      monthlyInvestment: profile.monthly_investment,
      medication: profile.medication || DEFAULT_USER_DATA.medication,
      medicationReminder: profile.medication_reminder,
      notifications: profile.notifications || DEFAULT_USER_DATA.notifications,
      goals: profile.goals || DEFAULT_USER_DATA.goals,
      streak: profile.streak || 0,
      lastActivityDate: profile.last_activity_date,
      isPro: profile.is_pro || false,
      subscriptionStatus: profile.subscription_status,
  });

  const checkUserProfile = async (user: Session['user']) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    const exists = !!(profile && profile.weight);
    setProfileExists(exists);
    
    if (profile) {
        setUserProfile(mapProfileToUserData(profile));
    }
    
    return exists;
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession) {
        await checkUserProfile(currentSession.user);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
       if (newSession) {
        checkUserProfile(newSession.user);
      } else {
        setProfileExists(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = async (data: Omit<UserData, 'id'>) => {
    if (!session?.user) return;

    // Calcular metas baseadas no peso novo
    const finalWater = parseFloat((data.weight * 0.035).toFixed(1));
    const finalProtein = Math.round(data.weight * 1.6);
    const bmr = 10 * data.weight + 6.25 * 175 - 5 * 30 + (data.gender === 'Masculino' ? 5 : -161);
    const finalCalories = Math.round(bmr * 1.375);

    const profilePayload = {
      id: session.user.id,
      name: data.name || session.user.email?.split('@')[0],
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
      target_weight: data.targetWeight,
      start_weight: data.startWeight,
      start_weight_date: data.startWeightDate,
      activity_level: data.activityLevel,
      medication: data.medication,
      glp_status: data.glpStatus,
      application_frequency: data.applicationFrequency,
      pace: data.pace,
      motivation: data.motivation,
      main_side_effect: data.mainSideEffect,
      // Marketing/Funnel fields
      journey_duration: data.journeyDuration,
      biggest_frustration: data.biggestFrustration,
      future_worry: data.futureWorry,
      one_thing_guaranteed: data.oneThingGuaranteed,
      dream_outcome: data.dreamOutcome,
      monthly_investment: data.monthlyInvestment,
      notifications: data.notifications || DEFAULT_USER_DATA.notifications,
      
      goals: {
          water: finalWater,
          protein: finalProtein,
          calories: finalCalories
      }
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profilePayload);

    if (error) {
      console.error("Error upserting profile:", error);
    } else {
      setProfileExists(true);
      setPlanReviewed(true);
      // Update local profile state to reflect changes immediately
      setUserProfile(prev => ({ ...prev, ...data, ...profilePayload } as any));
      navigate('/');
    }
  };

  const handleReturnFlowComplete = () => {
      setPlanReviewed(true);
      navigate('/');
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-gray-800 dark:text-gray-200">FitMind...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto shadow-lg relative">
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" /> : <Auth />} />
        
        <Route 
          path="/settings/initial-setup" 
          element={!session ? <Navigate to="/auth" /> : <InitialSettings />} 
        />

        {/* New Logic for Non-Pro Return Flow */}
        <Route 
          path="/onboarding"
          element={
            !session ? <Navigate to="/auth" /> : 
            (profileExists && userProfile && !userProfile.isPro && !planReviewed) ? (
                <OnboardingFlow 
                    onComplete={handleReturnFlowComplete} 
                    initialData={userProfile}
                    initialStep={26} // Index of StepFinalPlan
                />
            ) :
            (profileExists ? <Navigate to="/" /> : <OnboardingFlow onComplete={handleOnboardingComplete} />)
          }
        />
        
        <Route 
          path="/*"
          element={
            !session ? <Navigate to="/auth" /> : 
            (!profileExists ? <Navigate to="/onboarding" /> : 
            (userProfile && !userProfile.isPro && !planReviewed ? <Navigate to="/onboarding" /> : <MainApp />))
          } 
        />
      </Routes>
    </div>
  );
};

export default App;