import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { UserData, Meal, WeightEntry, ProgressPhoto, WorkoutPlan, WorkoutFeedback, ApplicationEntry, DailyNote, SideEffectEntry } from '../types';
import { DEFAULT_USER_DATA } from '../constants';

type Theme = 'light' | 'dark';

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
  currentWater: number;
  setCurrentWater: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  fetchData: () => Promise<void>;
  updateStreak: () => void;
  theme: Theme;
  toggleTheme: () => void;
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
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [quickAddProtein, setQuickAddProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);

  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return 'light'; // Default to light theme
  });

   useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

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
      streak: profile.streak || 0,
      lastActivityDate: profile.last_activity_date || null,
  });

  const fetchData = useCallback(async () => {
    isInitialLoad.current = true;
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      setLoading(false);
      isInitialLoad.current = false;
      return;
    }
    setSession(currentSession);
    
    setLoading(true);

    const userId = currentSession.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      profileRes,
      weightRes,
      photoRes,
      planRes,
      workoutHistoryRes,
      applicationHistoryRes,
      dailyRecordRes
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('weight_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('progress_photos').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('workout_plans').select('plan').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('workout_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('applications').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('daily_records').select('*').eq('user_id', userId).eq('date', todayStr).single()
    ]);

    if (profileRes.data) {
      setUserData(formatProfileToUserData(profileRes.data));
    }
    
    setWeightHistory(weightRes.data || []);
    setProgressPhotos(photoRes.data || []);
    setWorkoutPlan(planRes.data ? planRes.data.plan : null);
    setWorkoutHistory(workoutHistoryRes.data || []);
    setApplicationHistory(applicationHistoryRes.data || []);
    
    if (dailyRecordRes.data) {
        setMeals(dailyRecordRes.data.meals || []);
        setQuickAddProtein(dailyRecordRes.data.quick_add_protein_grams || 0);
        setCurrentWater(dailyRecordRes.data.water_liters || 0);
    } else {
        setMeals([]);
        setQuickAddProtein(0);
        setCurrentWater(0);
    }

    setDailyNotes([]);
    setSideEffects([]);
    
    setLoading(false);
    setTimeout(() => {
        isInitialLoad.current = false;
    }, 500);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isInitialLoad.current || loading || !userData) {
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const payload = {
        user_id: userData.id,
        date: todayStr,
        meals: meals,
        quick_add_protein_grams: quickAddProtein,
        water_liters: currentWater,
      };
      await supabase.from('daily_records').upsert(payload, { onConflict: 'user_id, date' });
    }, 1500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [meals, quickAddProtein, currentWater, userData, loading]);

  const updateStreak = useCallback(async () => {
    if (!userData) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const lastActivityStr = userData.lastActivityDate;

    if (lastActivityStr === todayStr) {
        return;
    }
    
    let newStreak = userData.streak || 0;
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActivityStr === yesterdayStr) {
        newStreak++;
    } else {
        newStreak = 1;
    }
    
    const updatedUserData = { ...userData, streak: newStreak, lastActivityDate: todayStr };
    setUserData(updatedUserData);

    const { error } = await supabase
        .from('profiles')
        .update({ streak: newStreak, last_activity_date: todayStr })
        .eq('id', userData.id);
        
    if (error) {
        console.error("Failed to update streak in DB:", error);
        setUserData(userData); // Revert on failure
    }
  }, [userData, setUserData]);

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
    currentWater,
    setCurrentWater,
    loading,
    fetchData,
    updateStreak,
    theme,
    toggleTheme,
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