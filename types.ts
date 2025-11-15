export type MedicationName = 'Mounjaro' | 'Ozempic' | 'Wegovy' | 'Saxenda' | 'Other';
export type Gender = 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não dizer';
export type ActivityLevel = 'Sedentário' | 'Levemente ativo' | 'Moderadamente ativo' | 'Ativo' | 'Muito ativo';
export type Goal = 'Perder peso' | 'Manter peso' | 'Ganhar massa muscular';
export type Weekday = 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado' | 'Domingo';

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
}

export interface WeightEntry {
  id?: number;
  user_id?: string;
  date: string; // ISO string format for dates
  weight: number; // in kg
}

export interface ApplicationEntry {
  id: number;
  user_id: string;
  date: string; // ISO string
  medication: MedicationName;
  dose: string;
}

export interface ProgressPhoto {
  id: number; // unique id from db
  date: string; // ISO string format for dates
  photo_url: string; // URL from Supabase Storage
}

export type SideEffectName = 'Náusea' | 'Dor de cabeça' | 'Fadiga' | 'Apetite reduzido' | 'Tontura' | 'Constipação';
export type SideEffectIntensity = 'Leve' | 'Moderado' | 'Severo';

export interface SideEffect {
  name: SideEffectName;
  intensity: SideEffectIntensity;
}

export interface SideEffectEntry {
  id?: number;
  user_id: string;
  date: string; // YYYY-MM-DD
  effects: SideEffect[];
  notes?: string;
}

export interface DailyNote {
  id?: number;
  user_id: string;
  date: string; // ISO string YYYY-MM-DD
  content: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroups: string[];
  equipment: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  setting: 'Casa' | 'Academia';
}

export interface WorkoutQuizAnswers {
  location: 'Casa' | 'Academia';
  daysPerWeek: number;
  duration: number; // in minutes
  goal: 'emagrecer' | 'ganhar massa' | 'manter';
  intensity: 'lento' | 'moderado' | 'agressivo';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  bodyType: 'ectomorfo' | 'mesomorfo' | 'endomorfo';
  priorityMuscles: string[];
  equipment: boolean;
}

export interface WorkoutDay {
  day: number;
  focus: string;
  estimatedTime: number; // in minutes
  exercises: {
    exerciseId: number;
    name: string;
    sets: string;
    reps: string;
    rest: string; // in seconds
  }[];
}

export type WorkoutPlan = WorkoutDay[];

export interface WorkoutFeedback {
  id?: number;
  user_id?: string;
  date: string; // ISO string
  workoutDayIndex: number;
  rating: 'leve' | 'ideal' | 'pesado';
}

export interface UserData {
  id: string; // Comes from supabase.auth.user.id
  name: string;
  gender: Gender;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: ActivityLevel;
  medication: {
    name: MedicationName;
    dose: string;
    nextApplication: Weekday;
  };
  medicationReminder?: {
    enabled: boolean;
    time: string; // "HH:mm"
  };
  goals: {
    water: number; // in L
    protein: number; // in g
    calories: number; // in kcal
  };
  isPro: boolean;
  stripeCustomerId?: string | null;
}

export interface Medication {
  name: MedicationName;
  doses: string[];
}

export interface DietQuizAnswers {
  appetite: 'pouco' | 'médio' | 'muito';
  mealsPerDay: 3 | 4 | 5;
  skipBreakfast: boolean;
  nightHunger: boolean;
  restrictions: string[];
  pace: 'devagar' | 'normal' | 'rápido';
  trains: boolean;
}

export interface GeneratedDietPlan {
  meals: {
    name: 'Café da manhã' | 'Lanche da manhã' | 'Almoço' | 'Lanche da tarde' | 'Jantar' | 'Ceia';
    description: string;
    quantity: string;
    protein: number;
    calories: number;
  }[];
  tip: string;
}