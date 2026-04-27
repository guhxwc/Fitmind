/**
 * Cálculo automático de metas nutricionais — mesma fórmula usada no
 * onboarding do FitMind (Mifflin-St Jeor + multiplicador de atividade).
 *
 * Usado em:
 * - CreateFullPlanModal: pré-popular Etapa 2 com valores calculados
 * - DietPlanEditor: pré-popular ao abrir/criar plano novo
 *
 * Fonte: components/AppContext.tsx → calculateGoals()
 */

export type ActivityLevel =
  | 'Sedentário'
  | 'Levemente ativo'
  | 'Moderadamente ativo'
  | 'Ativo'
  | 'Muito ativo';

export interface AutoGoalsInput {
  weight?: number | null;          // kg
  height?: number | null;          // cm
  age?: number | null;
  gender?: string | null;          // 'Masculino' | 'Feminino' | outro
  activityLevel?: ActivityLevel | string | null;
}

export interface AutoGoals {
  calories: number;   // kcal/dia
  protein: number;    // g/dia
  carbs: number;      // g/dia (~45% das kcal)
  fats: number;       // g/dia (~25% das kcal)
  water: number;      // L/dia
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  'Sedentário': 1.2,
  'Levemente ativo': 1.375,
  'Moderadamente ativo': 1.55,
  'Ativo': 1.725,
  'Muito ativo': 1.9,
};

/**
 * Retorna metas calculadas a partir dos dados do paciente.
 * Se peso não vier, retorna null (não há base pra calcular).
 */
export function calculateAutoGoals(input: AutoGoalsInput): AutoGoals | null {
  const weight = Number(input.weight) || 0;
  if (!weight || weight <= 0) return null;

  // Água: 35ml/kg
  const water = weight * 0.035;

  // Calorias: Mifflin-St Jeor + atividade. Fallback weight*30 se faltar dado.
  let calories = weight * 30;
  const height = Number(input.height) || 0;
  const age = Number(input.age) || 0;
  const gender = input.gender;

  if (height > 0 && age > 0 && gender) {
    const s = gender === 'Masculino' ? 5 : -161;
    const bmr = 10 * weight + 6.25 * height - 5 * age + s;
    const mult = ACTIVITY_MULTIPLIERS[input.activityLevel || 'Sedentário'] || 1.2;
    calories = bmr * mult;
  }

  // Proteína: 1.8g/kg (faixa 1.6–2.2; balanceado)
  const protein = weight * 1.8;

  // Carbo (~45% das kcal a 4 kcal/g) e Gordura (~25% a 9 kcal/g)
  const carbs = (calories * 0.45) / 4;
  const fats = (calories * 0.25) / 9;

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
    water: Number(water.toFixed(1)),
  };
}
