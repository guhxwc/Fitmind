
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MainApp } from './components/MainApp';
import { Auth } from './components/Auth';
import type { UserData } from './types';
import { SupabaseSetupMessage } from './components/SupabaseSetupMessage';
import { DEFAULT_USER_DATA } from './constants';
import { InitialSettings } from './components/tabs/InitialSettings';
import { TermsPage } from './components/legal/TermsPage';
import { PrivacyPage } from './components/legal/PrivacyPage';
import { SuccessPage } from './components/payment/SuccessPage';

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
  const navigate = useNavigate();

  // Fix for line 42: Correct property name 'activityLevel' and complete the mapping function
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
      medication: profile.medication || DEFAULT_USER_DATA.medication,
      notifications: profile.notifications || DEFAULT_USER_DATA.notifications,
      goals: profile.goals || DEFAULT_USER_DATA.goals,
      streak: profile.streak || 0,
      lastActivityDate: profile.last_activity_date,
      isPro: profile.is_pro || false,
      subscriptionStatus: profile.subscription_status || 'free',
      journeyDuration: profile.journey_duration,
      biggestFrustration: profile.biggest_frustration,
      futureWorry: profile.future_worry,
      oneThingGuaranteed: profile.one_thing_guaranteed,
      dreamOutcome: profile.dream_outcome,
      monthlyInvestment: profile.monthly_investment,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfileExists(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfileExists(!!data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (userData: Omit<UserData, 'id'>) => {
    if (!session) return;
    setLoading(true);

    const profileData = {
      id: session.user.id,
      name: userData.name,
      gender: userData.gender,
      age: userData.age,
      birth_date: userData.birthDate,
      height: userData.height,
      weight: userData.weight,
      target_weight: userData.targetWeight,
      start_weight: userData.startWeight,
      start_weight_date: userData.startWeightDate,
      activity_level: userData.activityLevel,
      glp_status: userData.glpStatus,
      application_frequency: userData.applicationFrequency,
      pace: userData.pace,
      motivation: userData.motivation,
      main_side_effect: userData.mainSideEffect,
      medication: userData.medication,
      notifications: userData.notifications,
      goals: userData.goals,
      streak: userData.streak,
      last_activity_date: userData.lastActivityDate,
      is_pro: userData.isPro || false,
      subscription_status: userData.subscriptionStatus || 'free',
      journey_duration: userData.journeyDuration,
      biggest_frustration: userData.biggestFrustration,
      future_worry: userData.futureWorry,
      one_thing_guaranteed: userData.oneThingGuaranteed,
      dream_outcome: userData.dreamOutcome,
      monthly_investment: userData.monthlyInvestment,
    };

    const { error } = await supabase.from('profiles').upsert(profileData);
    if (!error) {
      setProfileExists(true);
      navigate('/');
    } else {
      console.error("Error saving profile:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/payment/success" element={<SuccessPage />} />
      
      <Route path="/*" element={
        session ? (
          profileExists ? (
            <MainApp />
          ) : (
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          )
        ) : (
          <Navigate to="/auth" />
        )
      } />
      
      <Route path="/settings/initial-setup" element={session ? <InitialSettings /> : <Navigate to="/auth" />} />
    </Routes>
  );
};

// Fix: Exporting App as default to resolve index.tsx error
export default App;
