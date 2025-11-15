import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { UserData, Meal, WeightEntry, ProgressPhoto, WorkoutPlan, WorkoutFeedback, ApplicationEntry, DailyNote, SideEffectEntry } from '../types';
import { DEFAULT_USER_DATA } from '../constants';

interface AppContextType {
  session: Session | null;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  weightHistory: WeightEntry[];
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  progressPhotos: ProgressPhoto[];
  setProgressPhotos: React.Dispatch<React.SetStateAction<ProgressPhoto[]>>;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: React.Dispatch<React.SetStateAction<WorkoutPlan | null>>;
  workoutHistory: WorkoutFeedback[];
  setWorkoutHistory: React.Dispatch<React.SetStateAction<WorkoutFeedback[]>>;
  applicationHistory: ApplicationEntry[];
  setApplicationHistory: React.Dispatch<React.SetStateAction<ApplicationEntry[]>>;
  dailyNotes: DailyNote[];
  setDailyNotes: React.Dispatch<React.SetStateAction<DailyNote[]>>;
  sideEffects: SideEffectEntry[];
  setSideEffects: React.Dispatch<React.SetStateAction<SideEffectEntry[]>>;
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  quickAddProtein: number;
  setQuickAddProtein: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutFeedback[]>([]);
  const [applicationHistory, setApplicationHistory] = useState<ApplicationEntry[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffectEntry[]>([]);
  
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Ovos com Abacate', time: '08:30', calories: 450, protein: 25 },
    { id: '2', name: 'Frango Grelhado e Salada', time: '13:00', calories: 600, protein: 50 },
  ]);
  const [quickAddProtein, setQuickAddProtein] = useState(0);

  const formatProfileToUserData = (profile: any): UserData => ({
      id: profile.id,
      name: profile.name || DEFAULT_USER_DATA.name,
      gender: profile.gender || DEFAULT_USER_DATA.gender,
      age: profile.age || DEFAULT_USER_DATA.age,
      height: profile.height || DEFAULT_USER_DATA.height,
      weight: profile.weight || DEFAULT_USER_DATA.weight,
      targetWeight: profile.target_weight || DEFAULT_USER_DATA.targetWeight,
      activityLevel: profile.activity_level || DEFAULT_USER_DATA.activityLevel,
      medication: profile.medication || DEFAULT_USER_DATA.medication,
      medicationReminder: profile.medication_reminder || DEFAULT_USER_DATA.medicationReminder,
      goals: profile.goals || DEFAULT_USER_DATA.goals,
      isPro: profile.is_pro || false,
      stripeCustomerId: profile.stripe_customer_id || null,
  });

  const fetchData = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      setLoading(false);
      return;
    }
    setSession(currentSession);
    
    setLoading(true);

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();
    if (profile) {
      setUserData(formatProfileToUserData(profile));
    }
    
    const { data: weightData } = await supabase.from('weight_history').select('*').eq('user_id', currentSession.user.id).order('date', { ascending: false });
    const { data: photoData } = await supabase.from('progress_photos').select('*').eq('user_id', currentSession.user.id).order('date', { ascending: false });
    const { data: planData } = await supabase.from('workout_plans').select('*').eq('user_id', currentSession.user.id).order('created_at', { ascending: false }).limit(1).single();
    const { data: workoutHistoryData } = await supabase.from('workout_history').select('*').eq('user_id', currentSession.user.id).order('date', { ascending: false });
    const { data: applicationHistoryData } = await supabase.from('applications').select('*').eq('user_id', currentSession.user.id).order('date', { ascending: false });
    const { data: notesData } = await supabase.from('daily_notes').select('*').eq('user_id', currentSession.user.id);
    const { data: sideEffectsData } = await supabase.from('side_effects').select('*').eq('user_id', currentSession.user.id);

    setWeightHistory(weightData || []);
    setProgressPhotos(photoData || []);
    setWorkoutPlan(planData?.plan || null);
    setWorkoutHistory(workoutHistoryData || []);
    setApplicationHistory(applicationHistoryData || []);
    setDailyNotes(notesData || []);
    setSideEffects(sideEffectsData || []);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    session,
    userData,
    setUserData,
    weightHistory,
    setWeightHistory,
    progressPhotos,
    setProgressPhotos,
    workoutPlan,
    setWorkoutPlan,
    workoutHistory,
    setWorkoutHistory,
    applicationHistory,
    setApplicationHistory,
    dailyNotes,
    setDailyNotes,
    sideEffects,
    setSideEffects,
    meals,
    setMeals,
    quickAddProtein,
    setQuickAddProtein,
    loading,
    fetchData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};