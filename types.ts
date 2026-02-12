
export type MedicationName = 'Mounjaro' | 'Ozempic' | 'Wegovy' | 'Saxenda' | 'Other';
export type Gender = 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não dizer';
export type ActivityLevel = 'Sedentário' | 'Levemente ativo' | 'Moderadamente ativo' | 'Ativo' | 'Muito ativo';
export type Weekday = 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado' | 'Domingo';
export type FastingPace = 'lento' | 'normal' | 'rápido';

export type SideEffectName = 'Náusea' | 'Dor de cabeça' | 'Fadiga' | 'Apetite reduzido' | 'Tontura' | 'Constipação' | 'Diarreia' | 'Nenhum';
export type SideEffectIntensity = 'Leve' | 'Moderado' | 'Severo';

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled';

export interface UserData {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  startWeight: number;
  targetWeight: number;
  startWeightDate?: string;
  activityLevel: ActivityLevel;
  glpStatus: 'using' | 'starting';
  applicationFrequency: string;
  pace: number;
  motivation: string[];
  mainSideEffect?: string;
  // Funnel / Marketing Fields
  journeyDuration?: string;
  biggestFrustration?: string;
  futureWorry?: string;
  oneThingGuaranteed?: string;
  dreamOutcome?: string;
  monthlyInvestment?: string;
  
  medication: {
    name: MedicationName;
    dose: string;
    nextApplication: Weekday;
  };
  medicationReminder?: {
    enabled: boolean;
    time: string;
  };
  goals: {
    water: number;
    protein: number;
    calories: number;
  };
  streak: number;
  lastActivityDate: string | null;
  isPro?: boolean;
  subscriptionStatus?: SubscriptionStatus;
}

export interface Lead {
  id: string;
  email: string;
  profile_type: string; // 'Iniciante Ansioso', 'Veterano Estagnado', etc.
  created_at: string;
  updated_at: string;
}

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
  date: string;
  weight: number;
}

export interface ApplicationEntry {
  id: number;
  user_id: string;
  date: string;
  medication: MedicationName;
  dose: string;
}

export interface ProgressPhoto {
  id: number;
  date: string;
  photo_url: string;
}

export interface SideEffect {
  name: SideEffectName | string;
  intensity: SideEffectIntensity;
  duration?: string;
}

export interface SideEffectEntry {
  id?: number;
  user_id: string;
  date: string;
  effects: SideEffect[];
  notes?: string;
}

export interface DailyNote {
  id?: number;
  user_id: string;
  date: string;
  content: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroups: string[];
  equipment: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  setting: 'Academia' | 'Casa';
}

export interface WorkoutDay {
  day: number;
  focus: string;
  estimatedTime: number;
  exercises: any[];
}

export type WorkoutPlan = WorkoutDay[];

export interface WorkoutFeedback {
  id?: number;
  user_id?: string;
  date: string;
  workoutDayIndex: number;
  rating: 'leve' | 'ideal' | 'pesado';
}

export interface Medication {
  name: MedicationName;
  doses: string[];
}

export interface DietQuizAnswers {
  appetite: 'pouco' | 'médio' | 'muito';
  mealsPerDay: number;
  skipBreakfast: boolean;
  nightHunger: boolean;
  restrictions: string[];
  pace: 'devagar' | 'normal' | 'rápido';
  trains: boolean;
}

export interface WorkoutQuizAnswers {
  location: 'Academia' | 'Casa';
  daysPerWeek: number;
  duration: number;
  goal: 'emagrecer' | 'ganhar massa' | 'manter';
  intensity: 'leve' | 'moderado' | 'intenso';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  bodyType: 'ectomorfo' | 'mesomorfo' | 'endomorfo';
  priorityMuscles: string[];
  equipment: boolean;
  splitPreference: 'abc' | 'abcd' | 'abcde' | 'fullbody' | 'no_preference';
  injuries: string[];
}
