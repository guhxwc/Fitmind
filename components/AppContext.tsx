
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { UserData, Meal, WeightEntry, ProgressPhoto, WorkoutPlan, WorkoutFeedback, ApplicationEntry, DailyNote, SideEffectEntry } from '../types';
import { DEFAULT_USER_DATA } from '../constants';
import { useToast } from './ToastProvider';

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
  unlockPro: () => Promise<void>;
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
  const dailyRecordIdRef = useRef<number | null>(null);
  
  const { addToast } = useToast();

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

  const unlockPro = async () => {
      if(userData) {
          const updated = { ...userData, isPro: true, subscriptionStatus: 'active' as const };
          setUserData(updated);
          addToast("Ativando assinatura...", "info");
          const { error } = await supabase.from('profiles').update({ 
              is_pro: true, 
              subscription_status: 'active' 
          }).eq('id', userData.id);

          if (error) {
              console.error("Erro ao salvar status PRO:", error);
              addToast("Erro ao salvar assinatura. Entre em contato com o suporte.", "error");
          } else {
              addToast("FitMind PRO ativado! Aproveite os 7 dias grátis.", "success");
          }
      }
  }

  const formatProfileToUserData = (profile: any): UserData => ({
      id: profile.id,
      name: profile.name || DEFAULT_USER_DATA.name,
      gender: profile.gender || DEFAULT_USER_DATA.gender,
      age: profile.age || DEFAULT_USER_DATA.age,
      height: profile.height || DEFAULT_USER_DATA.height,
      weight: profile.weight || DEFAULT_USER_DATA.weight,
      targetWeight: profile.target_weight || DEFAULT_USER_DATA.targetWeight,
      startWeight: profile.start_weight || DEFAULT_USER_DATA.startWeight,
      startWeightDate: profile.start_weight_date || undefined,
      activityLevel: profile.activity_level || DEFAULT_USER_DATA.activityLevel,
      glpStatus: profile.glp_status || DEFAULT_USER_DATA.glpStatus,
      applicationFrequency: profile.application_frequency || DEFAULT_USER_DATA.applicationFrequency,
      pace: profile.pace || DEFAULT_USER_DATA.pace,
      motivation: profile.motivation || DEFAULT_USER_DATA.motivation,
      mainSideEffect: profile.main_side_effect || undefined,
      medication: profile.medication || DEFAULT_USER_DATA.medication,
      medicationReminder: profile.medication_reminder || DEFAULT_USER_DATA.medicationReminder,
      goals: profile.goals || DEFAULT_USER_DATA.goals,
      streak: profile.streak || 0,
      lastActivityDate: profile.last_activity_date || null,
      isPro: profile.is_pro || false,
      subscriptionStatus: profile.subscription_status || 'free',
      journeyDuration: profile.journey_duration,
      biggestFrustration: profile.biggest_frustration,
      futureWorry: profile.future_worry,
      monthlyInvestment: profile.monthly_investment,
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

    try {
        const userId = currentSession.user.id;
        const todayStr = new Date().toISOString().split('T')[0];

        const [
          profileRes,
          weightRes,
          photoRes,
          planRes,
          workoutHistoryRes,
          applicationHistoryRes,
          dailyRecordRes,
          dailyNotesRes,
          sideEffectsRes
        ] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('weight_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('progress_photos').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('workout_plans').select('plan').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
            supabase.from('workout_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('applications').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('daily_records').select('*').eq('user_id', userId).eq('date', todayStr).limit(1).maybeSingle(),
            supabase.from('daily_notes').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('side_effects').select('*').eq('user_id', userId).order('date', { ascending: false })
        ]);

        if (profileRes.data) {
          setUserData(formatProfileToUserData(profileRes.data));
        }
        
        setWeightHistory(weightRes.data || []);
        setProgressPhotos(photoRes.data || []);
        setWorkoutPlan(planRes.data && planRes.data.length > 0 ? planRes.data[0].plan : null);
        setWorkoutHistory(workoutHistoryRes.data || []);
        setApplicationHistory(applicationHistoryRes.data || []);
        setDailyNotes(dailyNotesRes.data || []);
        setSideEffects(sideEffectsRes.data || []);
        
        if (dailyRecordRes.data) {
            dailyRecordIdRef.current = dailyRecordRes.data.id;
            setMeals(dailyRecordRes.data.meals || []);
            setQuickAddProtein(dailyRecordRes.data.quick_add_protein_grams || 0);
            setCurrentWater(dailyRecordRes.data.water_liters || 0);
        } else {
            dailyRecordIdRef.current = null;
            setMeals([]);
            setQuickAddProtein(0);
            setCurrentWater(0);
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
        setTimeout(() => {
            isInitialLoad.current = false;
        }, 50); 
    }
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
      try {
          const todayStr = new Date().toISOString().split('T')[0];
          
          let targetId = dailyRecordIdRef.current;
          if (!targetId) {
              const { data: existing } = await supabase
                .from('daily_records')
                .select('id')
                .eq('user_id', userData.id)
                .eq('date', todayStr)
                .maybeSingle();
              
              if (existing) {
                  targetId = existing.id;
                  dailyRecordIdRef.current = existing.id;
              }
          }

          const payload = {
              user_id: userData.id,
              date: todayStr,
              meals: meals,
              quick_add_protein_grams: quickAddProtein,
              water_liters: currentWater
          };

          if (targetId) {
              await supabase.from('daily_records').update(payload).eq('id', targetId);
          } else {
              const { data: newRecord } = await supabase.from('daily_records').insert(payload).select().single();
              if (newRecord) {
                  dailyRecordIdRef.current = newRecord.id;
              }
          }
      } catch (error) {
          console.error("Error saving daily record:", error);
      }
    }, 2000); 

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [meals, quickAddProtein, currentWater, userData, loading]);

  const updateStreak = async () => {
      if (!userData) return;
      
      const today = new Date();
      const lastActivity = userData.lastActivityDate ? new Date(userData.lastActivityDate) : null;
      
      let newStreak = userData.streak;
      
      if (!lastActivity) {
          newStreak = 1;
      } else {
          const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
              return; 
          } else if (diffDays === 1) {
              newStreak += 1;
          } else {
              newStreak = 1;
          }
      }
      
      const updatedUser = { ...userData, streak: newStreak, lastActivityDate: today.toISOString() };
      setUserData(updatedUser);
      
      await supabase.from('profiles').update({ 
          streak: newStreak, 
          last_activity_date: today.toISOString() 
      }).eq('id', userData.id);
  };

  return (
    <AppContext.Provider value={{
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
      unlockPro
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Safe hook that returns a default/dummy context if used outside provider (e.g. Onboarding)
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    // Return a dummy object to prevent crashes in Onboarding components that might call this
    return {
        session: null,
        userData: null,
        setUserData: () => {},
        weightHistory: [],
        setWeightHistory: () => {},
        progressPhotos: [],
        setProgressPhotos: () => {},
        workoutPlan: null,
        setWorkoutPlan: () => {},
        workoutHistory: [],
        setWorkoutHistory: () => {},
        applicationHistory: [],
        setApplicationHistory: () => {},
        dailyNotes: [],
        setDailyNotes: () => {},
        sideEffects: [],
        setSideEffects: () => {},
        meals: [],
        setMeals: () => {},
        quickAddProtein: 0,
        setQuickAddProtein: () => {},
        currentWater: 0,
        setCurrentWater: () => {},
        loading: false,
        fetchData: async () => {},
        updateStreak: () => {},
        theme: 'light',
        toggleTheme: () => {},
        unlockPro: async () => {},
    } as unknown as AppContextType;
  }
  return context;
};
