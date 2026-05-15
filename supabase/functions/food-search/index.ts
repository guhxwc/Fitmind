// supabase/functions/food-search/index.ts
// =====================================================================
// Edge Function: Busca Híbrida de Alimentos
// Fluxo: Local DB → Open Food Facts API → Cache no DB
// =====================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Normalização de dados da Open Food Facts ─────────────────────────────────

interface OFFProduct {
  id?: string;
  code?: string;
  product_name?: string;
  product_name_pt?: string;
  categories?: string;
  categories_tags?: string[];
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy-kcal'?: number;
    energy_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    calcium_100g?: number;
  };
  serving_size?: string;
  serving_quantity?: number;
  quantity?: string;
  brands?: string;
  countries?: string;
  image_url?: string;
}

interface NormalizedFood {
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
  off_data: Record<string, unknown>;
  source: 'off_cache';
}

function toN(v: unknown): number {
  if (!v) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function extractPortionGrams(product: OFFProduct): number {
  // Tenta serving_quantity primeiro
  if (product.serving_quantity && product.serving_quantity > 0) {
    return product.serving_quantity;
  }
  // Tenta extrair número de serving_size (ex: "30g", "1 unidade (25g)")
  if (product.serving_size) {
    const match = product.serving_size.match(/(\d+(?:[.,]\d+)?)\s*g/i);
    if (match) return parseFloat(match[1].replace(',', '.'));
  }
  return 100; // default
}

function normalizeCategory(product: OFFProduct): string {
  const tags = product.categories_tags || [];
  const catStr = (product.categories || '').toLowerCase();

  if (tags.some(t => t.includes('fruit')) || catStr.includes('fruta')) return 'Frutas e derivados';
  if (tags.some(t => t.includes('vegetable') || t.includes('legume')) || catStr.includes('vegetal') || catStr.includes('hortal')) return 'Verduras, hortaliças e derivados';
  if (tags.some(t => t.includes('meat') || t.includes('poultry')) || catStr.includes('carne') || catStr.includes('frango')) return 'Carnes e derivados';
  if (tags.some(t => t.includes('fish') || t.includes('seafood')) || catStr.includes('peixe') || catStr.includes('marisco')) return 'Peixes e Frutos do Mar';
  if (tags.some(t => t.includes('dairy') || t.includes('milk') || t.includes('cheese')) || catStr.includes('laticínio') || catStr.includes('leite') || catStr.includes('queijo')) return 'Leite e derivados';
  if (tags.some(t => t.includes('cereal') || t.includes('bread') || t.includes('pasta')) || catStr.includes('cereal') || catStr.includes('pão') || catStr.includes('macarrão')) return 'Cereais e derivados';
  if (tags.some(t => t.includes('sweet') || t.includes('chocolate') || t.includes('candy')) || catStr.includes('doce') || catStr.includes('chocolat')) return 'Produtos açucarados';
  if (tags.some(t => t.includes('beverage') || t.includes('drink')) || catStr.includes('bebida') || catStr.includes('suco')) return 'Bebidas (alcoólicas e não alcoólicas)';
  if (tags.some(t => t.includes('legume') || t.includes('bean') || t.includes('pulse')) || catStr.includes('leguminosa') || catStr.includes('feijão')) return 'Leguminosas e derivados';
  if (tags.some(t => t.includes('nut') || t.includes('seed')) || catStr.includes('castanha') || catStr.includes('semente')) return 'Nozes e sementes';
  if (tags.some(t => t.includes('oil') || t.includes('fat')) || catStr.includes('óleo') || catStr.includes('gordura')) return 'Gorduras e óleos';
  if (tags.some(t => t.includes('egg')) || catStr.includes('ovo')) return 'Ovos e derivados';

  return 'Outros alimentos industrializados';
}

function normalizeOffProduct(product: OFFProduct): NormalizedFood | null {
  const name = (product.product_name_pt || product.product_name || '').trim();
  if (!name || name.length < 2) return null;

  const n = product.nutriments || {};
  const kcal = toN(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? (n.energy_100g ? n.energy_100g / 4.184 : 0));
  const protein = toN(n.proteins_100g);
  const carbs = toN(n.carbohydrates_100g);
  const fat = toN(n.fat_100g);
  const fiber = toN(n.fiber_100g);
  // Sódio na OFF vem em gramas/100g → converter para mg
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

  return {
    off_id: offId,
    name: displayName,
    category: normalizeCategory(product),
    kcal,
    protein,
    carbs,
    fat,
    fiber,
    sodium,
    calcium,
    portion_size: extractPortionGrams(product),
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
  };
}

// ─── Busca na Open Food Facts ─────────────────────────────────────────────────

async function searchOpenFoodFacts(query: string, limit = 10): Promise<NormalizedFood[]> {
  // Prioriza produtos brasileiros, mas aceita globais também
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', String(Math.min(limit * 3, 30))); // pega mais para filtrar nulos
  url.searchParams.set('fields', 
    'id,code,product_name,product_name_pt,categories,categories_tags,nutriments,serving_size,serving_quantity,quantity,brands,countries,image_url'
  );
  // Prioriza Brasil
  url.searchParams.set('tagtype_0', 'countries');
  url.searchParams.set('tag_contains_0', 'contains');
  url.searchParams.set('tag_0', 'brazil');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'FitmindApp/1.0 (contact@fitmind.app)' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];

    const data = await res.json() as { products?: OFFProduct[] };
    const products = data.products || [];

    const normalized = products
      .map(normalizeOffProduct)
      .filter((f): f is NormalizedFood => f !== null)
      .filter(f => f.kcal > 0 || f.protein > 0 || f.carbs > 0) // só com dados nutricionais
      .slice(0, limit);

    return normalized;
  } catch (e) {
    console.error('[OFF] Erro na busca:', e);
    return [];
  }
}

// ─── Busca por código de barras ───────────────────────────────────────────────

async function searchByBarcode(barcode: string): Promise<NormalizedFood | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=id,code,product_name,product_name_pt,categories,categories_tags,nutriments,serving_size,serving_quantity,quantity,brands,countries,image_url`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FitmindApp/1.0 (contact@fitmind.app)' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json() as { product?: OFFProduct; status?: number };
    if (data.status === 0 || !data.product) return null;

    return normalizeOffProduct(data.product);
  } catch (e) {
    console.error('[OFF] Erro barcode:', e);
    return null;
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json() as {
      query?: string;
      barcode?: string;
      limit?: number;
      context?: string;    // 'meal_log' | 'diet_plan' | 'patient_meal'
      user_id?: string;
      cache_result?: boolean;  // se true, salva no DB automaticamente
      food_to_cache?: NormalizedFood; // para salvar explicitamente ao selecionar
    };

    const limit = Math.min(body.limit || 20, 50);
    const context = body.context || 'meal_log';

    // ── MODO 1: Salvar alimento específico no cache (quando usuário seleciona) ──
    if (body.food_to_cache) {
      const f = body.food_to_cache;
      const { data: cachedId, error } = await supabase.rpc('cache_off_food', {
        p_off_id: f.off_id,
        p_name: f.name,
        p_category: f.category,
        p_kcal: f.kcal,
        p_protein: f.protein,
        p_carbs: f.carbs,
        p_fat: f.fat,
        p_fiber: f.fiber,
        p_sodium: f.sodium,
        p_calcium: f.calcium,
        p_portion_size: f.portion_size,
        p_portion_unit: f.portion_unit,
        p_search_terms: f.search_terms,
        p_off_data: f.off_data,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ cached_id: cachedId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── MODO 2: Busca por código de barras ──────────────────────────────────────
    if (body.barcode) {
      const barcode = body.barcode.trim();

      // Verifica se já está no cache local
      const { data: localData } = await supabase
        .from('foods')
        .select('*')
        .eq('off_id', barcode)
        .maybeSingle();

      if (localData) {
        // Incrementa uso
        await supabase.rpc('increment_food_usage', { p_food_id: localData.id });
        return new Response(
          JSON.stringify({ source: 'local_cache', results: [localData] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      // Busca na OFF
      const offResult = await searchByBarcode(barcode);
      if (!offResult) {
        return new Response(
          JSON.stringify({ source: 'off', results: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      // Auto-cacheia produto de barcode (sempre, pois é match exato)
      const { data: newId } = await supabase.rpc('cache_off_food', {
        p_off_id: offResult.off_id,
        p_name: offResult.name,
        p_category: offResult.category,
        p_kcal: offResult.kcal,
        p_protein: offResult.protein,
        p_carbs: offResult.carbs,
        p_fat: offResult.fat,
        p_fiber: offResult.fiber,
        p_sodium: offResult.sodium,
        p_calcium: offResult.calcium,
        p_portion_size: offResult.portion_size,
        p_portion_unit: offResult.portion_unit,
        p_search_terms: offResult.search_terms,
        p_off_data: offResult.off_data,
      });

      return new Response(
        JSON.stringify({
          source: 'off',
          results: [{ ...offResult, id: newId }],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── MODO 3: Busca por texto (modo principal) ────────────────────────────────
    if (!body.query || body.query.trim().length < 2) {
      // Sem query: retorna populares do banco local
      const { data } = await supabase.rpc('search_foods', { p_query: '', p_limit: limit });
      return new Response(
        JSON.stringify({ source: 'local', results: data || [], off_results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const query = body.query.trim();

    // 1. Busca local primeiro (banco curado + cache OFF)
    const { data: localResults, error: localError } = await supabase.rpc('search_foods', {
      p_query: query,
      p_limit: limit,
    });

    if (localError) {
      console.error('[Local] Erro:', localError.message);
    }

    const local = localResults || [];
    const hasGoodLocalResults = local.length >= 5;

    // 2. Se resultados locais suficientes → retorna só local (rápido)
    if (hasGoodLocalResults) {
      // Log de busca (async, não bloqueia resposta)
      if (body.user_id) {
        supabase.from('food_search_log').insert({
          user_id: body.user_id,
          query,
          source: 'local',
          context,
        }).then();
      }

      return new Response(
        JSON.stringify({
          source: 'local',
          results: local,
          off_results: [],        // vazio pois local foi suficiente
          total_local: local.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Poucos resultados locais → busca na OFF em paralelo
    const offResults = await searchOpenFoodFacts(query, Math.min(limit - local.length, 15));

    // Log
    if (body.user_id) {
      supabase.from('food_search_log').insert({
        user_id: body.user_id,
        query,
        source: 'off',
        context,
      }).then();
    }

    // Filtra duplicatas (alimentos que já existem localmente)
    const localNames = new Set(local.map(l => l.name.toLowerCase()));
    const deduped = offResults.filter(f => !localNames.has(f.name.toLowerCase()));

    return new Response(
      JSON.stringify({
        source: 'hybrid',
        results: local,           // resultados locais primeiro
        off_results: deduped,     // resultados OFF para o usuário escolher
        total_local: local.length,
        total_off: deduped.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[food-search] Erro geral:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
