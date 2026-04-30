import { supabase } from '../supabaseClient';
import { Food } from '../types';

export type FoodItem = Food;

function toNum(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function rowToFoodItem(row: any): FoodItem {
  return {
    id:           String(row.id),
    name:         String(row.name ?? row.nome ?? ''),
    category:     row.category ? String(row.category) : (row.categoria ? String(row.categoria) : null),
    kcal:         toNum(row.kcal ?? row.calorias),
    protein:      toNum(row.protein ?? row.proteinas),
    carbs:        toNum(row.carbs ?? row.carboidratos),
    fat:          toNum(row.fat ?? row.gorduras),
    portion_size: toNum(row.portion_size ?? row.porcao_gramas ?? 100),
    portion_unit: String(row.portion_unit ?? 'g'),
    is_common:    Boolean(row.is_common),
    group_name:   row.group_name,
    popularity_base: row.popularity_base,
    usage_count:  row.usage_count,
    relevance_score: row.relevance_score
  };
}

export const foodDatabaseService = {
  async searchFood(query: string, limit = 20): Promise<FoodItem[]> {
    const term = query.trim();
    
    // Usando a RPC inteligente se houver termo, senão busca comuns
    if (term.length >= 2) {
      const { data, error } = await supabase.rpc('search_foods', {
        p_query: term,
        p_limit: limit
      });

      if (error) {
        console.error('[foodDatabase] Erro na RPC:', error.message);
        return [];
      }

      return (data || []).map(rowToFoodItem);
    } else {
      // Busca populares iniciais se vazio ou curto
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('is_common', true)
        .order('popularity_base', { ascending: false })
        .limit(12);

      if (error) {
        console.error('[foodDatabase] Erro busca populares:', error.message);
        return [];
      }

      return (data || []).map(rowToFoodItem);
    }
  },

  async getFoodById(id: string): Promise<FoodItem | null> {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return rowToFoodItem(data);
  },

  calcForPortion(food: FoodItem, gramas: number): FoodItem {
    const f = gramas / (food.portion_size || 100);
    return {
      ...food,
      portion_size: gramas,
      kcal:     Math.round(food.kcal * f),
      protein:    Math.round(food.protein * f * 10) / 10,
      carbs: Math.round(food.carbs * f * 10) / 10,
      fat:     Math.round(food.fat * f * 10) / 10,
    };
  },
};
