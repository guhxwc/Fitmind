
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MainApp } from './components/MainApp';
import { Auth } from './components/Auth';
import { useAppContext } from './components/AppContext';
import type { UserData } from './types';
import { SupabaseSetupMessage } from './components/SupabaseSetupMessage';
import { DEFAULT_USER_DATA } from './constants';
import { InitialSettings } from './components/tabs/InitialSettings';
import { TermsPage } from './components/legal/TermsPage';
import { PrivacyPage } from './components/legal/PrivacyPage';
import Cookies from 'js-cookie';

import { useAffiliateTracker } from './hooks/useAffiliateTracker';

const App: React.FC = () => {
  // Initialize affiliate tracker
  useAffiliateTracker();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto shadow-lg">
        <SupabaseSetupMessage />
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const { userData, loading: contextLoading, fetchData } = useAppContext();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
          supabase.auth.signOut();
          setSession(null);
        }
      } else {
        setSession(session);
        if (session) fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setProfileExists(null);
      } else {
        setSession(session);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      console.log("Profile data:", data, "Error:", error);
      if (error) throw error;
      setProfileExists(!!data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleOnboardingComplete = async (userData: Omit<UserData, 'id'>) => {
    if (!session) return;

    const affiliateCode = Cookies.get('fitmind_affiliate_code');

    const profileData = {
      id: session.user.id,
      name: userData.name || 'Usuário',
      referred_by: affiliateCode || null,
      gender: userData.gender,
      age: userData.age,
      birth_date: userData.birthDate || null,
      height: userData.height,
      weight: userData.weight,
      target_weight: userData.targetWeight,
      start_weight: userData.startWeight,
      start_weight_date: userData.startWeightDate || new Date().toISOString(),
      activity_level: userData.activityLevel,
      glp_status: userData.glpStatus,
      application_frequency: userData.applicationFrequency,
      pace: userData.pace,
      motivation: userData.motivation,
      main_side_effect: userData.mainSideEffect || null,
      medication: userData.medication,
      notifications: userData.notifications,
      goals: userData.goals,
      streak: userData.streak || 0,
      last_activity_date: userData.lastActivityDate || new Date().toISOString(),
      is_pro: userData.isPro || false,
      subscription_status: userData.subscriptionStatus || 'free',
      journey_duration: userData.journeyDuration || null,
      biggest_frustration: userData.biggestFrustration || null,
      future_worry: userData.futureWorry || null,
      one_thing_guaranteed: userData.oneThingGuaranteed || null,
      dream_outcome: userData.dreamOutcome || null,
      monthly_investment: userData.monthlyInvestment || null,
    };

    try {
      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) {
        console.error("Error saving profile:", error);
      }
      await fetchData();
      setProfileExists(true);
      setUpsellDismissed(true);
      navigate('/');
    } catch (err) {
      console.error("Critical error during onboarding complete:", err);
      setProfileExists(true);
      navigate('/');
    }
  };

  if (contextLoading) {
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
      
      <Route path="/*" element={
        session ? (
          profileExists === null ? (
            <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
            </div>
          ) : profileExists ? (
            (userData?.isPro || upsellDismissed) ? (
              <MainApp />
            ) : (
              <OnboardingFlow 
                onComplete={handleOnboardingComplete} 
                initialData={userData ? (({ id, ...rest }) => rest)(userData) : undefined} 
              />
            )
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

export default App;
