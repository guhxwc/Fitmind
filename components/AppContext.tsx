
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { UserData, Meal, WeightEntry, ProgressPhoto, WorkoutPlan, WorkoutFeedback, ApplicationEntry, DailyNote, SideEffectEntry, ActivityLevel, DietPlan } from '../types';
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
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  quickAddProtein: number;
  setQuickAddProtein: React.Dispatch<React.SetStateAction<number>>;
  currentWater: number;
  setCurrentWater: React.Dispatch<React.SetStateAction<number>>;
  dietPlan: DietPlan | null;
  setDietPlan: React.Dispatch<React.SetStateAction<DietPlan | null>>;
  loading: boolean;
  fetchData: () => Promise<void>;
  updateStreak: () => void;
  theme: Theme;
  toggleTheme: () => void;
  unlockPro: () => Promise<void>;
  calculateGoals: (weight: number, activityLevel: ActivityLevel, height?: number, age?: number, gender?: string) => UserData['goals'];
  isGeneratingDiet: boolean;
  setIsGeneratingDiet: React.Dispatch<React.SetStateAction<boolean>>;
  isGeneratingWorkout: boolean;
  setIsGeneratingWorkout: React.Dispatch<React.SetStateAction<boolean>>;
  isMealModalOpen: boolean;
  setIsMealModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isWeightModalOpen: boolean;
  setIsWeightModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSideEffectModalOpen: boolean;
  setIsSideEffectModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNutriPanelOpen: boolean;
  setIsNutriPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  consultationStatus: string | null;
  setConsultationStatus: React.Dispatch<React.SetStateAction<string | null>>;
  initialMealType: string;
  setInitialMealType: React.Dispatch<React.SetStateAction<string>>;
  initialMode: string;
  setInitialMode: React.Dispatch<React.SetStateAction<string>>;
  weightMilestoneData: { oldWeight: number; newWeight: number } | null;
  setWeightMilestoneData: React.Dispatch<React.SetStateAction<{ oldWeight: number; newWeight: number } | null>>;
  isNutritionist: boolean;
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
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [quickAddProtein, setQuickAddProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSideEffectModalOpen, setIsSideEffectModalOpen] = useState(false);
  const [isNutriPanelOpen, setIsNutriPanelOpen] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState<string | null>(null);
  const [initialMealType, setInitialMealType] = useState('');
  const [initialMode, setInitialMode] = useState('');
  const [weightMilestoneData, setWeightMilestoneData] = useState<{ oldWeight: number; newWeight: number } | null>(null);
  const [isNutritionist, setIsNutritionist] = useState(false);

  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);
  const dailyRecordIdRef = useRef<number | null>(null);
  
  const lastWeightUpdateRef = useRef<number>(0);
  
  const { addToast } = useToast();

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return 'light'; 
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

  const calculateGoals = (weight: number, activityLevel: ActivityLevel, height?: number, age?: number, gender?: string) => {
      // 1. Water: 35ml per kg
      const water = weight * 0.035;
      
      // 2. Calories (BMR/TMB using Mifflin-St Jeor)
      // If we don't have height/age/gender, fallback to simple weight * 30
      let calories = weight * 30;
      if (height && age && gender) {
          const s = gender === 'Masculino' ? 5 : -161;
          const bmr = (10 * weight) + (6.25 * height) - (5 * age) + s;
          
          // Apply activity multiplier
          const multipliers: Record<ActivityLevel, number> = {
              'Sedentário': 1.2,
              'Levemente ativo': 1.375,
              'Moderadamente ativo': 1.55,
              'Ativo': 1.725,
              'Muito ativo': 1.9
          };
          calories = bmr * (multipliers[activityLevel] || 1.2);
      }

      // 3. Protein: 1.6g to 2.2g per kg (using 1.8g as balanced default)
      const protein = weight * 1.8;

      return {
          water: parseFloat(water.toFixed(1)),
          calories: Math.round(calories),
          protein: Math.round(protein),
          fiber: 25,
          carbs: 0,
          fats: 0,
          steps: 10000,
          exerciseMinutes: 30
      };
  };

  const formatProfileToUserData = (profile: any): UserData => ({
      id: profile.id,
      name: profile.name || DEFAULT_USER_DATA.name,
      gender: profile.gender || DEFAULT_USER_DATA.gender,
      age: profile.age || DEFAULT_USER_DATA.age,
      birthDate: profile.birth_date,
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
      notifications: profile.notifications || DEFAULT_USER_DATA.notifications,
      goals: profile.goals || DEFAULT_USER_DATA.goals,
      streak: profile.streak || 0,
      lastActivityDate: profile.last_activity_date || null,
      isPro: profile.is_pro || false, // CRÍTICO: Mapeamento is_pro -> isPro
      subscriptionStatus: profile.subscription_status || 'free',
      journeyDuration: profile.journey_duration,
      biggestFrustration: profile.biggest_frustration,
      futureWorry: profile.future_worry,
      monthlyInvestment: profile.monthly_investment,
      lastWeightGoalUpdate: profile.last_weight_goal_update || profile.weight,
  });

  const fetchData = useCallback(async () => {
    isInitialLoad.current = true;
    if (!supabase) {
      setLoading(false);
      isInitialLoad.current = false;
      return;
    }
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
        // Adjust date to local timezone string to avoid UTC shift issues
        const offset = selectedDate.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(selectedDate.getTime() - offset)).toISOString().slice(0, -1);
        const selectedDateStr = localISOTime.split('T')[0];

        const [
          profileRes,
          weightRes,
          photoRes,
          planRes,
          workoutHistoryRes,
          applicationHistoryRes,
          dailyRecordRes,
          dailyNotesRes,
          sideEffectsRes,
          customGoalsRes,
          isNutritionistRes
        ] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
            supabase.from('weight_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('progress_photos').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('workout_plans').select('plan').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
            supabase.from('workout_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('applications').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('daily_records').select('*').eq('user_id', userId).eq('date', selectedDateStr).limit(1).maybeSingle(),
            supabase.from('daily_notes').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('side_effects').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('custom_goals').select('*').eq('user_id', userId).maybeSingle(),
            supabase.rpc('is_nutritionist')
        ]);

        if (profileRes.data) {
          const fetchedUserData = formatProfileToUserData(profileRes.data);
          
          // Apply custom goals if they exist
          if (customGoalsRes?.data) {
             fetchedUserData.goals = {
                ...fetchedUserData.goals,
                calories: customGoalsRes.data.calories ?? fetchedUserData.goals.calories,
                protein: customGoalsRes.data.protein_g ?? fetchedUserData.goals.protein,
                water: customGoalsRes.data.water_ml ? (customGoalsRes.data.water_ml / 1000) : fetchedUserData.goals.water,
                carbs: customGoalsRes.data.carbs_g ?? fetchedUserData.goals.carbs,
                fats: customGoalsRes.data.fat_g ?? fetchedUserData.goals.fats
             };
          }

          setUserData(prev => {
            if (!prev) return fetchedUserData;
            
            const isRecentLocalUpdate = Date.now() - lastWeightUpdateRef.current < 3000;
            if (isRecentLocalUpdate && fetchedUserData.weight !== prev.weight) {
                console.log('DEBUG: fetchData ignorando peso do banco devido a update local recente');
                return {
                    ...fetchedUserData,
                    weight: prev.weight,
                    goals: prev.goals,
                    lastWeightGoalUpdate: prev.lastWeightGoalUpdate
                };
            }
            return fetchedUserData;
          });
        } else {
          setUserData(null);
        }
        
        setWeightHistory(weightRes.data || []);
        setProgressPhotos(photoRes.data || []);
        setWorkoutPlan(planRes.data && planRes.data.length > 0 ? planRes.data[0].plan : null);
        setWorkoutHistory(workoutHistoryRes.data || []);
        setApplicationHistory(applicationHistoryRes.data || []);
        setDailyNotes(dailyNotesRes.data || []);
        setSideEffects(sideEffectsRes.data || []);
        
        // Força permissão para os e-mails de teste do Gustavo e Allan caso o RPC falhe ou não tenha sido atualizado
        const userEmail = session?.user?.email?.toLowerCase();
        const isNutriFallback = userEmail === 'gustavo.500fyz@gmail.com' || userEmail === 'gustavo.5000futrica@gmail.com' || userEmail === 'allanstachuk@gmail.com';
        
        setIsNutritionist(!!isNutritionistRes.data || isNutriFallback);

        if (session?.user?.id) {
            const { data: cData } = await supabase.from('consultations').select('status').eq('user_id', session.user.id).maybeSingle();
            if (cData) {
                setConsultationStatus(cData.status);
            } else {
                setConsultationStatus(null);
            }
        }
        
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

  // Escuta mudanças em tempo real no perfil (Stripe Webhook -> Supabase -> App)
  useEffect(() => {
    if (!session?.user?.id) return;

    const profileSubscription = supabase
      .channel(`profile-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Detectada mudança de perfil em tempo real:', payload.new);
          const updatedUserData = formatProfileToUserData(payload.new);
          
          // Se o usuário acabou de se tornar PRO
          if (updatedUserData.isPro && !userData?.isPro) {
              addToast("Assinatura PRO ativada com sucesso!", "success");
              // Só dispara o tour se não estivermos na página de sucesso (que já tem sua lógica)
              if (window.location.hash !== '#/payment/success') {
                  localStorage.setItem('trigger_pro_tour', 'true');
              }
          }
          
          setUserData(prev => {
            if (!prev) return updatedUserData;
            
            // Se houve alteração de peso no banco, verificamos se é um "eco" do nosso próprio update
            const isWeightChange = payload.new.weight !== prev.weight;
            const isRecentLocalUpdate = Date.now() - lastWeightUpdateRef.current < 3000; // 3 segundos de "lock"
            
            if (isWeightChange && isRecentLocalUpdate) {
                console.log('DEBUG: Ignorando update de peso do banco (eco local detectado)');
                return {
                  ...updatedUserData,
                  weight: prev.weight,
                  goals: prev.goals,
                  lastWeightGoalUpdate: prev.lastWeightGoalUpdate,
                };
            }
            
            return updatedUserData;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [session?.user?.id, userData?.isPro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isInitialLoad.current && session) {
        fetchData();
    }
  }, [selectedDate]);

  const unlockPro = async () => {
    if (!session?.user?.id) return;
    
    try {
        addToast("Verificando status da assinatura...", "info");
        
        // Tenta sincronizar via Edge Function
        const { data, error } = await supabase.functions.invoke('stripe-webhook-sync-profile', {
            body: { userId: session.user.id }
        });

        if (error) throw error;

        if (data?.isPro) {
            addToast("Assinatura PRO confirmada!", "success");
            await fetchData();
        } else {
            // Se não confirmou via sync, apenas recarrega os dados (pode ser que o webhook já tenha processado)
            await fetchData();
            if (userData?.isPro) {
                addToast("Status PRO atualizado!", "success");
            } else {
                addToast("Assinatura não encontrada ou ainda processando.", "info");
            }
        }
    } catch (error) {
        console.error("Erro ao sincronizar PRO:", error);
        await fetchData();
    }
  }

  useEffect(() => {
    if (isInitialLoad.current || loading || !userData) {
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(async () => {
      try {
          const offset = selectedDate.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(selectedDate.getTime() - offset)).toISOString().slice(0, -1);
          const selectedDateStr = localISOTime.split('T')[0];
          
          let targetId = dailyRecordIdRef.current;
          if (!targetId) {
              const { data: existing } = await supabase
                .from('daily_records')
                .select('id')
                .eq('user_id', userData.id)
                .eq('date', selectedDateStr)
                .maybeSingle();
              
              if (existing) {
                  targetId = existing.id;
                  dailyRecordIdRef.current = existing.id;
              }
          }

          const payload = {
              user_id: userData.id,
              date: selectedDateStr,
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
      
      setUserData(prev => prev ? { ...prev, streak: newStreak, lastActivityDate: today.toISOString() } : null);
      
      await supabase.from('profiles').update({ 
          streak: newStreak, 
          last_activity_date: today.toISOString() 
      }).eq('id', userData.id);
  };

  const setUserDataWithTimestamp: React.Dispatch<React.SetStateAction<UserData | null>> = (value) => {
    if (typeof value === 'function') {
        setUserData(prev => {
            const next = (value as any)(prev);
            if (prev && next && prev.weight !== next.weight) {
                lastWeightUpdateRef.current = Date.now();
            }
            return next;
        });
    } else {
        if (userData && value && userData.weight !== value.weight) {
            lastWeightUpdateRef.current = Date.now();
        }
        setUserData(value);
    }
  };

  return (
    <AppContext.Provider value={{
      session,
      userData,
      setUserData: setUserDataWithTimestamp,
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
      selectedDate,
      setSelectedDate,
      meals,
      setMeals,
      quickAddProtein,
      setQuickAddProtein,
      currentWater,
      setCurrentWater,
      dietPlan,
      setDietPlan,
      loading,
      fetchData,
      updateStreak,
      theme,
      toggleTheme,
      unlockPro,
      calculateGoals,
      isGeneratingDiet,
      setIsGeneratingDiet,
      isGeneratingWorkout,
      setIsGeneratingWorkout,
      isMealModalOpen,
      setIsMealModalOpen,
      isWeightModalOpen,
      setIsWeightModalOpen,
      isSideEffectModalOpen,
      setIsSideEffectModalOpen,
      isNutriPanelOpen,
      setIsNutriPanelOpen,
      consultationStatus,
      setConsultationStatus,
      initialMealType,
      setInitialMealType,
      initialMode,
      setInitialMode,
      weightMilestoneData,
      setWeightMilestoneData,
      isNutritionist
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
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
        selectedDate: new Date(),
        setSelectedDate: () => {},
        meals: [],
        setMeals: () => {},
        quickAddProtein: 0,
        setQuickAddProtein: () => {},
        currentWater: 0,
        setCurrentWater: () => {},
        dietPlan: null,
        setDietPlan: () => {},
        loading: false,
        fetchData: async () => {},
        updateStreak: () => {},
        theme: 'light',
        toggleTheme: () => {},
        unlockPro: async () => {},
        calculateGoals: () => ({ water: 0, protein: 0, calories: 0, fiber: 0, carbs: 0, fats: 0, steps: 0, exerciseMinutes: 0 }),
        isGeneratingDiet: false,
        setIsGeneratingDiet: () => {},
        isGeneratingWorkout: false,
        setIsGeneratingWorkout: () => {},
        isMealModalOpen: false,
        setIsMealModalOpen: () => {},
        isWeightModalOpen: false,
        setIsWeightModalOpen: () => {},
        isSideEffectModalOpen: false,
        setIsSideEffectModalOpen: () => {},
        isNutriPanelOpen: false,
        setIsNutriPanelOpen: () => {},
        consultationStatus: null,
        setConsultationStatus: () => {},
        initialMealType: '',
        setInitialMealType: () => {},
        initialMode: '',
        setInitialMode: () => {},
        weightMilestoneData: null,
        setWeightMilestoneData: () => {},
    } as unknown as AppContextType;
  }
  return context;
};
