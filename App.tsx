
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
          setUserData(profile as UserData);
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

    // Upsert garante que o perfil seja criado se não existir, ou atualizado se já existir (ex: trigger criou um básico).
    const { data: profileData, error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        ...data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting profile after onboarding:", error);
    } else if (profileData) {
      setUserData(profileData as UserData);
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