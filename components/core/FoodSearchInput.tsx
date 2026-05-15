// components/core/FoodSearchInput.tsx
// =====================================================================
// Componente de Busca de Alimentos Híbrida
// Usado em: SmartLogModal, DietPlanEditor, ManualMealModal, etc.
// =====================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { foodDatabaseService, FoodItem, OFFResult } from '../../services/foodDatabaseService';
import { useAppContext } from '../AppContext';

interface FoodSearchInputProps {
  onSelect: (food: FoodItem, grams: number) => void;
  context?: 'meal_log' | 'diet_plan' | 'patient_meal';
  placeholder?: string;
  autoFocus?: boolean;
  defaultGrams?: number;
  className?: string;
}

type SearchState = 'idle' | 'loading' | 'done' | 'error';

const DEBOUNCE_MS = 320;

// Item de resultado
const FoodResultItem: React.FC<{
  food: FoodItem | OFFResult;
  grams: number;
  onSelect: () => void;
}> = ({ food, grams, onSelect }) => {
  const ratio = grams / ((food as FoodItem).portion_size || 100);
  const kcal  = Math.round(food.kcal * ratio);
  const prot  = (food.protein * ratio).toFixed(1);

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 active:bg-gray-100 dark:active:bg-gray-700 transition-colors text-left rounded-xl"
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {food.name}
          </span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {food.category || 'Alimento'}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{kcal} kcal</p>
        <p className="text-xs text-gray-400">{prot}g prot</p>
      </div>
    </button>
  );
};

export const FoodSearchInput: React.FC<FoodSearchInputProps> = ({
  onSelect,
  context = 'meal_log',
  placeholder = 'Buscar alimento...',
  autoFocus = false,
  defaultGrams = 100,
  className = '',
}) => {
  const { userData } = useAppContext();
  const [query, setQuery]       = useState('');
  const [grams, setGrams]       = useState(defaultGrams);
  const [local, setLocal]       = useState<FoodItem[]>([]);
  const [off, setOff]           = useState<OFFResult[]>([]);
  const [state, setState]       = useState<SearchState>('idle');
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-foco
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Busca com debounce
  const doSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      // Mostra populares
      const { local: pop } = await foodDatabaseService.searchFood('', {
        limit: 12,
        context,
        userId: userData?.id,
        includeOFF: false,
      });
      setLocal(pop);
      setOff([]);
      setState('done');
      return;
    }

    setState('loading');
    try {
      const { local: l, off: o } = await foodDatabaseService.searchFood(term, {
        limit: 20,
        context,
        userId: userData?.id,
        includeOFF: true,
      });
      setLocal(l);
      setOff(o);
      setState('done');
    } catch (e) {
      console.error('[FoodSearchInput]', e);
      setState('error');
    }
  }, [context, userData?.id]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setShowDropdown(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), DEBOUNCE_MS);
  };

  const handleFocus = () => {
    setShowDropdown(true);
    if (local.length === 0) doSearch(query);
  };

  // Selecionar alimento local
  const handleSelectLocal = async (food: FoodItem) => {
    setShowDropdown(false);
    setQuery('');
    // Incrementa uso em background
    foodDatabaseService.incrementUsage(food.id);
    onSelect(foodDatabaseService.calcForPortion(food, grams), grams);
  };

  // Selecionar alimento OFF → cacheia automaticamente
  const handleSelectOFF = async (offFood: OFFResult) => {
    setShowDropdown(false);
    setQuery('');
    setState('loading');

    try {
      const cached = await foodDatabaseService.cacheOFFFood(offFood, userData?.id);
      onSelect(foodDatabaseService.calcForPortion(cached, grams), grams);
    } catch (e) {
      // Fallback sem cache
      const food = foodDatabaseService.offToFoodItem(offFood);
      onSelect(foodDatabaseService.calcForPortion(food, grams), grams);
    } finally {
      setState('done');
    }
  };

  const hasResults = local.length > 0 || off.length > 0;
  const noResults  = state === 'done' && !hasResults && query.length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input principal + campo de gramas */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
          />
          {state === 'loading' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Campo de gramas */}
        <div className="relative">
          <input
            type="number"
            value={grams}
            onChange={e => setGrams(Math.max(1, parseInt(e.target.value) || 100))}
            className="w-20 px-2 py-3 pr-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-center font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">g</span>
        </div>
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">

          {/* Loading state */}
          {state === 'loading' && local.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-400">
              <svg className="animate-spin w-5 h-5 mx-auto mb-2 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Buscando...
            </div>
          )}

          {/* Nenhum resultado */}
          {noResults && (
            <div className="py-6 text-center text-sm text-gray-400 px-4">
              <p className="font-medium text-gray-500">Nenhum resultado para "{query}"</p>
              <p className="text-xs mt-1">Tente palavras mais curtas ou em português</p>
            </div>
          )}

          {/* Resultados locais */}
          {local.length > 0 && (
            <div>
              {query.length < 2 && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Populares
                </p>
              )}
              {local.map(food => (
                <FoodResultItem
                  key={food.id}
                  food={food}
                  grams={grams}
                  onSelect={() => handleSelectLocal(food)}
                />
              ))}
            </div>
          )}

          {/* Resultados OFF integrados sem título */}
          {off.length > 0 && (
            <>
              {off.map((offFood) => (
                <FoodResultItem
                  key={offFood.off_id}
                  food={offFood}
                  grams={grams}
                  onSelect={() => handleSelectOFF(offFood)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodSearchInput;
