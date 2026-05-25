// hooks/useFoodSearch.ts
// =====================================================================
// Hook central de busca de alimentos com cache automático
// Usado por: SmartLogModal (texto/voz/foto), DietPlanEditor, 
//            ManualMealModal, FoodSearchInput
// =====================================================================

import { useState, useCallback, useRef } from 'react';
import { foodDatabaseService, FoodItem, OFFResult } from '../services/foodDatabaseService';
import { useAppContext } from '../components/AppContext';

export type SearchContext = 'meal_log' | 'diet_plan' | 'patient_meal';

interface UseFoodSearchOptions {
  context?: SearchContext;
  autoCache?: boolean;   // cacheia automaticamente quando usuário seleciona item OFF
  limit?: number;
}

interface SearchResults {
  local: FoodItem[];
  off: OFFResult[];
  isEmpty: boolean;
  hasOFF: boolean;
}

export function useFoodSearch(options: UseFoodSearchOptions = {}) {
  const {
    context = 'meal_log',
    autoCache = true,
    limit = 20,
  } = options;

  const { userData } = useAppContext();
  const [results, setResults]   = useState<SearchResults>({ local: [], off: [], isEmpty: true, hasOFF: false });
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [isCaching, setCaching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Busca ─────────────────────────────────────────────────────────────────
  const search = useCallback(async (query: string) => {
    // Cancela busca anterior
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setError(null);

    if (!query || query.trim().length < 2) {
      // Populares
      setLoading(true);
      try {
        const { local } = await foodDatabaseService.searchFood('', {
          limit: 12,
          context,
          userId: userData?.id,
          includeOFF: false,
        });
        setResults({ local, off: [], isEmpty: local.length === 0, hasOFF: false });
      } catch {
        setResults({ local: [], off: [], isEmpty: true, hasOFF: false });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { local, off } = await foodDatabaseService.searchFood(query.trim(), {
        limit,
        context,
        userId: userData?.id,
        includeOFF: true,
      });

      setResults({
        local,
        off,
        isEmpty: local.length === 0 && off.length === 0,
        hasOFF: off.length > 0,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao buscar';
      setError(msg);
      setResults({ local: [], off: [], isEmpty: true, hasOFF: false });
    } finally {
      setLoading(false);
    }
  }, [context, limit, userData?.id]);

  // ── Busca para keywords da IA (SmartLogModal) ─────────────────────────────
  // Busca o melhor match para uma lista de keywords e retorna o FoodItem
  const searchBestMatch = useCallback(async (
    name: string,
    keywords: string[],
    estimatedMacros?: {
      kcal: number; protein: number; carbs: number;
      fat: number; fiber: number; sodium: number;
    },
    grams = 100,
  ): Promise<FoodItem> => {
    const trySearch = async (term: string): Promise<FoodItem | null> => {
      const cleaned = term.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim();
      if (cleaned.length < 2) return null;
      
      const { local, off } = await foodDatabaseService.searchFood(cleaned, {
        limit: 1,
        context,
        userId: userData?.id,
        includeOFF: true, // Habilita a busca inteligente OFF!
      });
      
      if (local && local.length > 0) {
        return local[0];
      }
      
      if (off && off.length > 0) {
        try {
          // Cacheia o alimento da OFF em background/on-the-fly para salvá-lo localmente
          const cached = await foodDatabaseService.cacheOFFFood(off[0], userData?.id);
          return cached;
        } catch (e) {
          console.warn("[trySearch] Erro ao cachear alimento OFF na busca inteligente:", e);
          return foodDatabaseService.offToFoodItem(off[0]);
        }
      }
      
      return null;
    };

    let found: FoodItem | null = null;

    // 1. Nome completo
    found = await trySearch(name);

    // 2. Keywords juntas (ex: se keywords=["frango", "peito"], busca "frango peito")
    if (!found && keywords && keywords.length > 1) {
      const jointKeywords = keywords.filter(kw => kw.trim().length >= 2).join(' ');
      if (jointKeywords.trim().length >= 3) {
        found = await trySearch(jointKeywords);
      }
    }

    // 3. Keywords individuais
    if (!found) {
      for (const kw of keywords) {
        if (kw.length >= 3) {
          found = await trySearch(kw);
          if (found) break;
        }
      }
    }

    // 4. Primeira palavra do nome
    if (!found) {
      const firstWord = name.split(' ')[0];
      if (firstWord.length > 2) found = await trySearch(firstWord);
    }

    if (found) {
      // Incrementa uso em background
      foodDatabaseService.incrementUsage(found.id);
      return foodDatabaseService.calcForPortion(found, grams);
    }

    // Fallback: usa macros estimados pela IA
    return {
      id:           `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      category:     null,
      kcal:         Math.round((estimatedMacros?.kcal || 0) * (grams / 100)),
      protein:      Math.round((estimatedMacros?.protein || 0) * (grams / 100) * 10) / 10,
      carbs:        Math.round((estimatedMacros?.carbs || 0) * (grams / 100) * 10) / 10,
      fat:          Math.round((estimatedMacros?.fat || 0) * (grams / 100) * 10) / 10,
      fiber:        Math.round((estimatedMacros?.fiber || 0) * (grams / 100) * 10) / 10,
      sodium:       Math.round((estimatedMacros?.sodium || 0) * (grams / 100)),
      portion_size: grams,
      portion_unit: 'g',
      is_common:    false,
      source:       'manual',
    };
  }, [context, userData?.id]);

  // ── Selecionar alimento e cachear se necessário ───────────────────────────
  const selectFood = useCallback(async (
    food: FoodItem | OFFResult,
    grams: number,
  ): Promise<FoodItem> => {
    const isOFF = 'off_id' in food && typeof (food as OFFResult).off_id === 'string'
      && !(food as FoodItem).id?.match(/^[0-9a-f-]{36}$/);

    if (isOFF && autoCache) {
      setCaching(true);
      try {
        const cached = await foodDatabaseService.cacheOFFFood(food as OFFResult, userData?.id);
        return foodDatabaseService.calcForPortion(cached, grams);
      } finally {
        setCaching(false);
      }
    }

    const local = food as FoodItem;
    foodDatabaseService.incrementUsage(local.id);
    return foodDatabaseService.calcForPortion(local, grams);
  }, [autoCache, userData?.id]);

  // ── Busca por código de barras ────────────────────────────────────────────
  const searchBarcode = useCallback(async (barcode: string): Promise<FoodItem | null> => {
    setLoading(true);
    try {
      const food = await foodDatabaseService.searchByBarcode(barcode);
      if (food) foodDatabaseService.incrementUsage(food.id);
      return food;
    } catch (e) {
      console.error('[useFoodSearch] barcode error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    isLoading,
    isCaching,
    error,
    search,
    searchBestMatch,
    selectFood,
    searchBarcode,
    clearResults: () => setResults({ local: [], off: [], isEmpty: true, hasOFF: false }),
  };
}
