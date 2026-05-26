// services/foodDatabaseService.ts
// =====================================================================
// Serviço HÍBRIDO de Alimentos
// Fluxo: Local DB (search_foods RPC) → Edge Function → Open Food Facts
// =====================================================================

import { supabase } from '../supabaseClient';
import { Food } from '../types';

export type FoodItem = Food & {
  source?: 'local' | 'off_cache' | 'manual';
  off_id?: string;
  calcium?: number;
  _off_raw?: Record<string, unknown>; // dados brutos OFF, não persistido localmente
};

// ─── Tipos de resultado da Edge Function ─────────────────────────────────────

interface HybridSearchResult {
  source: 'local' | 'off' | 'hybrid';
  results: FoodItem[];          // resultados do banco local (incluindo cache OFF)
  off_results?: OFFResult[];    // resultados direto da API OFF (ainda não cacheados)
  total_local?: number;
  total_off?: number;
}

export interface OFFResult {
  off_id: string;
  name: string;
  category: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  calcium: number;
  portion_size: number;
  portion_unit: string;
  search_terms: string;
  source: 'off_cache';
  off_data: Record<string, unknown>;
  // Após cache: id uuid do banco
  id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function rowToFoodItem(row: Record<string, unknown>): FoodItem {
  return {
    id:              String(row.id),
    name:            String(row.name ?? row.nome ?? ''),
    category:        row.category ? String(row.category) : (row.categoria ? String(row.categoria) : null),
    kcal:            toNum(row.kcal ?? row.calorias),
    protein:         toNum(row.protein ?? row.proteinas),
    carbs:           toNum(row.carbs ?? row.carboidratos),
    fat:             toNum(row.fat ?? row.gorduras),
    fiber:           toNum(row.fiber ?? row.fibras),
    sodium:          toNum(row.sodium ?? row.sodio),
    calcium:         toNum(row.calcium),
    portion_size:    toNum(row.portion_size ?? row.porcao_gramas ?? 100),
    portion_unit:    String(row.portion_unit ?? 'g'),
    is_common:       Boolean(row.is_common),
    group_name:      row.group_name as string | undefined,
    popularity_base: row.popularity_base as number | undefined,
    usage_count:     row.usage_count as number | undefined,
    relevance_score: row.relevance_score as number | undefined,
    search_terms:    row.search_terms as string | undefined,
    source:          (row.source as 'local' | 'off_cache' | 'manual') ?? 'local',
    off_id:          row.off_id as string | undefined,
  };
}

function offResultToFoodItem(off: OFFResult): FoodItem {
  return {
    id:           off.id || `off_${off.off_id}`,
    name:         off.name,
    category:     off.category,
    kcal:         off.kcal,
    protein:      off.protein,
    carbs:        off.carbs,
    fat:          off.fat,
    fiber:        off.fiber,
    sodium:       off.sodium,
    calcium:      off.calcium,
    portion_size: off.portion_size,
    portion_unit: off.portion_unit,
    is_common:    false,
    source:       'off_cache',
    off_id:       off.off_id,
    _off_raw:     off.off_data,
  };
}

// ─── URL da Edge Function ─────────────────────────────────────────────────────

async function callEdgeFunction(body: Record<string, unknown>): Promise<HybridSearchResult> {
  const { data, error } = await supabase.functions.invoke('food-search', {
    body,
  });

  if (error) {
    throw new Error(`Edge Function error: ${error.message}`);
  }

  return data as HybridSearchResult;
}

// ─── Serviço principal ────────────────────────────────────────────────────────

export const foodDatabaseService = {

  // ── Busca principal (híbrida) ─────────────────────────────────────────────
  async searchFood(
    query: string,
    options: {
      limit?: number;
      context?: 'meal_log' | 'diet_plan' | 'patient_meal';
      userId?: string;
      includeOFF?: boolean;
    } = {},
  ): Promise<{ local: FoodItem[]; off: OFFResult[] }> {
    const {
      limit = 20,
      context = 'meal_log',
      userId,
      includeOFF = true,
    } = options;

    const term = query.trim();

    // Sem termo: retorna populares via RPC local (sem chamar Edge Function)
    if (term.length < 2) {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('is_common', true)
        .order('popularity_base', { ascending: false })
        .limit(12);

      if (error) {
        console.error('[foodDatabase] Erro populares:', error.message);
        return { local: [], off: [] };
      }

      return { local: (data || []).map(rowToFoodItem), off: [] };
    }

    // ── Score Inteligente Local ─────────────────────────────────────────────
    const calculateScore = (food: FoodItem | OFFResult, term: string) => {
      const q = term.toLowerCase();
      const n = food.name.toLowerCase();
      const st = food.search_terms ? food.search_terms.toLowerCase() : '';
      
      let score = 0;
      if (n === q) score += 100;
      else if (n.startsWith(q)) score += 50;
      else if (n.includes(` ${q} `)) score += 30;
      else if (n.includes(q)) score += 10;
      
      const words = q.split(/\s+/);
      let matchCount = 0;
      for (const w of words) {
        if (w.length > 2) {
           if (n.includes(w)) {
               score += 15;
               matchCount++;
           } else if (st && st.includes(w)) {
               score += 10;
               matchCount++;
           }
        }
      }
      if (matchCount >= words.length && words.length > 1) {
         score += 20;
      }
      return score;
    };

    // ── Tenta via Edge Function (tem fallback para OFF) ─────────────────────
    try {
      const result = await callEdgeFunction({
        query: term,
        limit: Math.max(limit * 2, 40), // get more to rank correctly
        context,
        user_id: userId,
      });

      let local = (result.results || []).map(r => rowToFoodItem(r as unknown as Record<string, unknown>));
      let off   = includeOFF ? (result.off_results || []) : [];

      // Aplicar scoring inteligente
      local.forEach(l => {
         let score = calculateScore(l, term);
         if (l.popularity_base) score += l.popularity_base / 20;
         if (l.usage_count) score += Math.min(l.usage_count * 5, 50);
         l.relevance_score = (l.relevance_score || 0) + score;
      });
      local = local.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0)).slice(0, limit);

      off.forEach(o => {
         (o as any)._score = calculateScore(o, term);
      });
      off = off.sort((a: any, b: any) => (b._score || 0) - (a._score || 0)).slice(0, limit);

      return { local, off };
    } catch (edgeErr) {
      console.warn('[foodDatabase] Edge Function indisponível, fallback RPC local:', edgeErr);

      // Fallback direto para RPC local
      const { data, error } = await supabase.rpc('search_foods', {
        p_query: term,
        p_limit: limit * 2,
      });

      if (error) {
        console.error('[foodDatabase] Erro RPC local:', error.message);
        return { local: [], off: [] };
      }

      let local = (data || []).map(rowToFoodItem);
      
      local.forEach(l => {
         let score = calculateScore(l, term);
         if (l.popularity_base) score += l.popularity_base / 20;
         if (l.usage_count) score += Math.min(l.usage_count * 5, 50);
         l.relevance_score = (l.relevance_score || 0) + score;
      });
      local = local.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0)).slice(0, limit);
      
      let off: OFFResult[] = [];

      // Faz a busca OFF diretamente do cliente para não deixar de mostrar
      if (includeOFF) {
        try {
          off = await this.searchOpenFoodFactsDirectly(term, Math.max(10, limit));
          off.forEach(o => {
             (o as any)._score = calculateScore(o, term);
          });
          off = off.sort((a: any, b: any) => (b._score || 0) - (a._score || 0));
          
          // Filtra duplicatas
          const localNames = new Set(local.map((l: FoodItem) => l.name.toLowerCase()));
          off = off.filter(f => !localNames.has(f.name.toLowerCase())).slice(0, limit);
        } catch (offErr) {
          console.warn('[foodDatabase] Fallback OFF direto falhou:', offErr);
        }
      }

      return { local, off };
    }
  },

  // ── Busca OFF Direta do Cliente ───────────────────────────────────────────
  async searchOpenFoodFactsDirectly(query: string, limit: number = 10): Promise<OFFResult[]> {
    const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
    url.searchParams.set('search_terms', query);
    url.searchParams.set('search_simple', '1');
    url.searchParams.set('action', 'process');
    url.searchParams.set('json', '1');
    url.searchParams.set('page_size', String(limit * 2)); // pega mais para filtrar
    url.searchParams.set('fields', 'id,code,product_name,product_name_pt,categories,categories_tags,nutriments,serving_size,serving_quantity,quantity,brands,countries,image_url');
    url.searchParams.set('tagtype_0', 'countries');
    url.searchParams.set('tag_contains_0', 'contains');
    url.searchParams.set('tag_0', 'brazil');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'FitmindApp/1.0 (contact@fitmind.app)' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('[foodDatabase] Resposta OFF não é JSON:', contentType);
      return [];
    }

    let data;
    try {
      data = await res.json() as { products?: any[] };
    } catch (err) {
      console.error('[foodDatabase] Erro ao fazer parse do JSON da OFF:', err);
      return [];
    }
    const products = data?.products || [];

    const normalized = products
      .map((p) => this.normalizeOffProduct(p))
      .filter((f): f is OFFResult => f !== null)
      .filter(f => f.kcal > 0 || f.protein > 0 || f.carbs > 0)
      .slice(0, limit);

    return normalized;
  },

  normalizeOffProduct(product: any): OFFResult | null {
    function toN(v: unknown): number {
      if (!v) return 0;
      const n = Number(v);
      return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
    }

    const name = (product.product_name_pt || product.product_name || '').trim();
    if (!name || name.length < 2) return null;

    const n = product.nutriments || {};
    const kcal = toN(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? (n.energy_100g ? n.energy_100g / 4.184 : 0));
    const protein = toN(n.proteins_100g);
    const carbs = toN(n.carbohydrates_100g);
    const fat = toN(n.fat_100g);
    const fiber = toN(n.fiber_100g);
    const sodium = toN((n.sodium_100g || 0) * 1000);
    const calcium = toN(n.calcium_100g || 0);

    const offId = product.code || product.id || '';
    if (!offId) return null;

    const brand = product.brands ? ` (${product.brands.split(',')[0].trim()})` : '';
    const displayName = name + brand;

    const searchTerms = [
      name.toLowerCase(),
      product.brands?.toLowerCase() || '',
      product.categories?.toLowerCase().split(',').slice(0, 3).join(' ') || '',
    ].filter(Boolean).join(' ');

    let portion_size = 100;
    if (product.serving_quantity && product.serving_quantity > 0) portion_size = product.serving_quantity;
    else if (product.serving_size) {
      const match = product.serving_size.match(/(\d+(?:[.,]\d+)?)\s*g/i);
      if (match) portion_size = parseFloat(match[1].replace(',', '.'));
    }

    const normalizedCategory = () => {
      const tags = product.categories_tags || [];
      const catStr = (product.categories || '').toLowerCase();
      if (tags.some((t: string) => t.includes('fruit')) || catStr.includes('fruta')) return 'Frutas e derivados';
      if (tags.some((t: string) => t.includes('vegetable') || t.includes('legume')) || catStr.includes('vegetal') || catStr.includes('hortal')) return 'Verduras, hortaliças e derivados';
      if (tags.some((t: string) => t.includes('meat') || t.includes('poultry')) || catStr.includes('carne') || catStr.includes('frango')) return 'Carnes e derivados';
      if (tags.some((t: string) => t.includes('fish') || t.includes('seafood')) || catStr.includes('peixe') || catStr.includes('marisco')) return 'Peixes e Frutos do Mar';
      if (tags.some((t: string) => t.includes('dairy') || t.includes('milk') || t.includes('cheese')) || catStr.includes('laticínio') || catStr.includes('leite') || catStr.includes('queijo')) return 'Leite e derivados';
      if (tags.some((t: string) => t.includes('cereal') || t.includes('bread') || t.includes('pasta')) || catStr.includes('cereal') || catStr.includes('pão') || catStr.includes('macarrão')) return 'Cereais e derivados';
      if (tags.some((t: string) => t.includes('sweet') || t.includes('chocolate') || t.includes('candy')) || catStr.includes('doce') || catStr.includes('chocolat')) return 'Produtos açucarados';
      if (tags.some((t: string) => t.includes('beverage') || t.includes('drink')) || catStr.includes('bebida') || catStr.includes('suco')) return 'Bebidas (alcoólicas e não alcoólicas)';
      if (tags.some((t: string) => t.includes('legume') || t.includes('bean') || t.includes('pulse')) || catStr.includes('leguminosa') || catStr.includes('feijão')) return 'Leguminosas e derivados';
      if (tags.some((t: string) => t.includes('nut') || t.includes('seed')) || catStr.includes('castanha') || catStr.includes('semente')) return 'Nozes e sementes';
      if (tags.some((t: string) => t.includes('oil') || t.includes('fat')) || catStr.includes('óleo') || catStr.includes('gordura')) return 'Gorduras e óleos';
      if (tags.some((t: string) => t.includes('egg')) || catStr.includes('ovo')) return 'Ovos e derivados';
      return 'Outros alimentos industrializados';
    };

    return {
      off_id: offId,
      name: displayName,
      category: normalizedCategory(),
      kcal,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      calcium,
      portion_size,
      portion_unit: 'g',
      search_terms: searchTerms,
      source: 'off_cache',
      off_data: {
        code: product.code,
        brands: product.brands,
        categories: product.categories,
        countries: product.countries,
        image_url: product.image_url,
        serving_size: product.serving_size,
        quantity: product.quantity,
      },
    } as OFFResult;
  },

  // ── Busca simples (retrocompatível com código existente) ──────────────────
  async searchFoodSimple(query: string, limit = 20): Promise<FoodItem[]> {
    const { local } = await this.searchFood(query, { limit, includeOFF: false });
    return local;
  },

  // ── Busca por código de barras ────────────────────────────────────────────
  async searchByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const result = await callEdgeFunction({ barcode });
      const results = result.results || [];
      if (results.length === 0) return null;
      return rowToFoodItem(results[0] as unknown as Record<string, unknown>);
    } catch (e) {
      console.error('[foodDatabase] Erro barcode:', e);
      return null;
    }
  },

  // ── Cachear alimento da OFF no banco (chamado quando usuário SELECIONA) ───
  async cacheOFFFood(food: OFFResult, userId?: string): Promise<FoodItem> {
    try {
      // Se já tem ID do banco, só incrementa uso
      if (food.id && !food.id.startsWith('off_')) {
        await supabase.rpc('increment_food_usage', { p_food_id: food.id });
        return offResultToFoodItem(food);
      }

      // Salva via RPC direto no banco
      const { data: newId, error } = await supabase.rpc('cache_off_food', {
        p_off_id: food.off_id,
        p_name: food.name,
        p_category: food.category || 'Outros',
        p_kcal: food.kcal || 0,
        p_protein: food.protein || 0,
        p_carbs: food.carbs || 0,
        p_fat: food.fat || 0,
        p_fiber: food.fiber || 0,
        p_sodium: food.sodium || 0,
        p_calcium: food.calcium || 0,
        p_portion_size: food.portion_size || 100,
        p_portion_unit: food.portion_unit || 'g',
        p_search_terms: food.search_terms || '',
        p_off_data: food.off_data || {}
      });

      if (error) {
        console.error('[foodDatabase] Erro supabase RPC cache_off_food:', error);
      }

      // Log
      if (userId && newId) {
        // Tenta inserir no log, ignorando erro caso falhe
        supabase.from('food_search_log').insert({
          user_id: userId,
          query: food.name,
          source: 'off',
          result_id: newId,
          result_name: food.name,
          context: 'selection',
        }).then();
      }

      return { ...offResultToFoodItem(food), id: newId || food.id || `off_${food.off_id}` };
    } catch (e) {
      console.error('[foodDatabase] Erro ao cachear:', e);
      // Retorna mesmo sem cachear (não bloqueia a UX)
      return offResultToFoodItem(food);
    }
  },

  // ── Incrementar uso de alimento local ─────────────────────────────────────
  async incrementUsage(foodId: string): Promise<void> {
    if (!foodId || foodId.startsWith('off_')) return;
    try {
      await supabase.rpc('increment_food_usage', { p_food_id: foodId });
    } catch (e) {
      // Silencia erros de uso — não crítico
    }
  },

  // ── Buscar por ID ─────────────────────────────────────────────────────────
  async getFoodById(id: string): Promise<FoodItem | null> {
    if (!id || id.startsWith('off_')) return null;

    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return rowToFoodItem(data);
  },

  // ── Calcular macros para uma porção ──────────────────────────────────────
  calcForPortion(food: FoodItem, gramas: number): FoodItem {
    const f = gramas / (food.portion_size || 100);
    return {
      ...food,
      portion_size: gramas,
      kcal:    Math.round(food.kcal * f),
      protein: Math.round(food.protein * f * 10) / 10,
      carbs:   Math.round(food.carbs  * f * 10) / 10,
      fat:     Math.round(food.fat    * f * 10) / 10,
      fiber:   Math.round((food.fiber   || 0) * f * 10) / 10,
      sodium:  Math.round((food.sodium  || 0) * f),
      calcium: Math.round((food.calcium || 0) * f),
    };
  },

  // ── Converter OFFResult → FoodItem (sem cachear) ─────────────────────────
  offToFoodItem(off: OFFResult): FoodItem {
    return offResultToFoodItem(off);
  },
};

// ─── Re-exporta tipo para compatibilidade ────────────────────────────────────
export type { OFFResult as OffFoodResult };
