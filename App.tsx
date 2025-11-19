import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MainApp } from './components/MainApp';
import { Auth } from './components/Auth';
import type { UserData } from './types';
import { SupabaseSetupMessage } from './components/SupabaseSetupMessage';

const App: React.FC = () => {
  if (!supabase) {
    return (
      <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto shadow-lg">
        <SupabaseSetupMessage />
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      medicationReminder: profile.medication_reminder,
      goals: profile.goals,
      streak: 0, // Always start streak at 0 from DB
      lastActivityDate: null, // Always start lastActivityDate as null from DB
    };
  };
  
  const checkUserProfile = async (user: Session['user']) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('height')
      .eq('id', user.id)
      .single();
    
    const exists = !!(profile && profile.height);
    setProfileExists(exists);
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
        setUserData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = async (data: Omit<UserData, 'id'>) => {
    if (!session?.user) {
      console.error("User not logged in to complete onboarding");
      return;
    }

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
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profilePayload);

    if (error) {
      console.error("Error upserting profile after onboarding:", error);
    } else {
      setProfileExists(true);
      navigate('/');
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-gray-800 dark:text-gray-200">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto shadow-lg">
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" /> : <Auth />} />
        <Route 
          path="/onboarding"
          element={!session ? <Navigate to="/auth" /> : (profileExists ? <Navigate to="/" /> : <OnboardingFlow onComplete={handleOnboardingComplete} />)}
        />
        <Route 
          path="/*"
          element={!session ? <Navigate to="/auth" /> : (profileExists === false ? <Navigate to="/onboarding" /> : <MainApp />)} 
        />
      </Routes>
    </div>
  );
};

export default App;