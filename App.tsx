
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MainApp } from './components/MainApp';
import { Auth } from './components/Auth';
import type { UserData } from './types';
import { SupabaseSetupMessage } from './components/SupabaseSetupMessage';

const App: React.FC = () => {
  if (!supabase) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto shadow-lg">
        <SupabaseSetupMessage />
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<'auth' | 'onboarding' | 'main_app'>('auth');

  // Helper function to map Supabase snake_case data to app's camelCase UserData
  const formatProfileToUserData = (profile: any): UserData => {
    return {
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      targetWeight: profile.target_weight,
      activityLevel: profile.activity_level,
      medication: profile.medication,
      goals: profile.goals,
      isPro: profile.is_pro,
    };
  };

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profile && profile.name) { // Onboarding completo se o nome existir
          setUserData(formatProfileToUserData(profile));
          setAppState('main_app');
        } else {
          setAppState('onboarding');
        }
      } else {
        setAppState('auth');
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setUserData(null);
        setAppState('auth');
      } else if (newSession && !userData) {
          // If a new session is created (user logs in), re-check profile
          getSessionAndProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = async (data: Omit<UserData, 'id'>) => {
    if (!session?.user) {
      console.error("User not logged in to complete onboarding");
      return;
    }

    // Map camelCase from app state to snake_case for Supabase DB
    const profilePayload = {
      id: session.user.id,
      name: data.name,
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
      target_weight: data.targetWeight,
      activity_level: data.activityLevel,
      medication: data.medication,
      goals: data.goals,
      is_pro: data.isPro,
      updated_at: new Date().toISOString(),
    };

    const { data: profileData, error } = await supabase
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .single();

    if (error) {
      console.error("Error upserting profile after onboarding:", error);
    } else if (profileData) {
      setUserData(formatProfileToUserData(profileData));
      setAppState('main_app');
    }
  };


  const renderContent = () => {
    if (loading) {
      return <div className="h-screen flex items-center justify-center">Carregando...</div>;
    }

    switch (appState) {
      case 'auth':
        return <Auth />;
      case 'onboarding':
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;
      case 'main_app':
        if (session && userData) {
          return <MainApp session={session} userData={userData} setUserData={setUserData} />;
        }
        // Se o estado for main_app mas os dados não estiverem prontos, volta para auth para revalidar.
        setAppState('auth'); 
        return <Auth />;
      default:
        return <Auth />;
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto shadow-lg">
      {renderContent()}
    </div>
  );
};

export default App;
