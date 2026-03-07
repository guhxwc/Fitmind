import { supabase } from '../supabaseClient';

// Schema real da tabela_alimentos no Supabase:
// id (serial), nome (text), categoria (text),
// calorias (numeric), proteinas (numeric), carboidratos (numeric),
// gorduras (numeric), fibras (numeric)

export interface FoodItem {
  id: number;
  nome: string;
  categoria?: string;
  calorias: number;     // kcal por 100g
  proteinas: number;    // g por 100g
  carboidratos: number; // g por 100g
  gorduras: number;     // g por 100g
  fibras: number;       // g por 100g
  porcao_gramas?: number;
}

function toNum(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function rowToFoodItem(row: Record<string, unknown>): FoodItem {
  return {
    id:           toNum(row.id),
    nome:         String(row.nome ?? ''),
    categoria:    row.categoria ? String(row.categoria) : undefined,
    calorias:     toNum(row.calorias),
    proteinas:    toNum(row.proteinas),
    carboidratos: toNum(row.carboidratos),
    gorduras:     toNum(row.gorduras),
    fibras:       toNum(row.fibras),
  };
}

export const foodDatabaseService = {
  async searchFood(query: string, limit = 20): Promise<FoodItem[]> {
    if (!query || query.trim().length < 2) return [];

    const term = query.trim();

    const { data, error } = await supabase
      .from('tabela_alimentos')
      .select('id, nome, categoria, calorias, proteinas, carboidratos, gorduras, fibras')
      .ilike('nome', `%${term}%`)
      .order('nome')
      .limit(limit);

    if (error) {
      console.error('[foodDatabase] Erro na busca:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      // Fallback: tenta com só a primeira palavra
      const firstWord = term.split(' ')[0];
      if (firstWord && firstWord !== term) {
        return this.searchFood(firstWord, limit);
      }
      return [];
    }

    return (data as Record<string, unknown>[]).map(rowToFoodItem);
  },

  async getFoodById(id: number | string): Promise<FoodItem | null> {
    const numId = Number(id);
    if (!Number.isFinite(numId)) return null;

    const { data, error } = await supabase
      .from('tabela_alimentos')
      .select('id, nome, categoria, calorias, proteinas, carboidratos, gorduras, fibras')
      .eq('id', numId)
      .maybeSingle();

    if (error || !data) return null;
    return rowToFoodItem(data as Record<string, unknown>);
  },

  // Calcula macros para uma porção específica em gramas
  calcForPortion(food: FoodItem, gramas: number): FoodItem {
    const f = gramas / 100;
    return {
      ...food,
      porcao_gramas: gramas,
      calorias:     Math.round(food.calorias * f),
      proteinas:    Math.round(food.proteinas * f * 10) / 10,
      carboidratos: Math.round(food.carboidratos * f * 10) / 10,
      gorduras:     Math.round(food.gorduras * f * 10) / 10,
      fibras:       Math.round(food.fibras * f * 10) / 10,
    };
  },
};