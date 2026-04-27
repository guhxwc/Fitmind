import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { ChevronLeft, ChevronRight, MoreHorizontal, Sun, Moon, Utensils, ShoppingBag, Check, Bookmark, Sparkles, Clock, Flame, Droplet, Info, Plus, Coffee, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

export const DietView: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAppContext();
  const [diet, setDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingList, setGeneratingList] = useState(false);
  const [shoppingList, setShoppingList] = useState<{ category: string, items: { name: string, checked: boolean }[] }[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const loadDiet = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('diet_plans')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            const rawDiet = data[0];
            const planBucket = rawDiet.plan || rawDiet.plan_data || {};
            const activePlan = planBucket.plans ? planBucket.plans[0] : (planBucket.plan || planBucket);

            const totals = {
              kcal: activePlan.total_calories || planBucket.total_calories || rawDiet.total_calories || 0,
              p: activePlan.total_protein_g || planBucket.total_protein_g || rawDiet.total_protein_g || 0,
              c: activePlan.total_carbs_g || planBucket.total_carbs_g || rawDiet.total_carbs_g || 0,
              f: activePlan.total_fat_g || planBucket.total_fat_g || rawDiet.total_fat_g || 0,
            };

            setDiet({
              ...rawDiet,
              displayPlan: activePlan,
              totals
            });
        }
        setLoading(false);
    };
    loadDiet();

    const channel = supabase
      .channel(`diet_plans_view_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'diet_plans', filter: `user_id=eq.${userId}` },
        () => { loadDiet(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const generateShoppingList = async () => {
      if (!diet || !diet.displayPlan) return;
      setGeneratingList(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
          const prompt = `Analise este plano de dieta e extraia todos os alimentos necessários. Retorne uma lista de compras otimizada e categorizada (ex: Hortifruti, Açougue, Laticínios, Mercearia).\nPlano: ${JSON.stringify(diet.displayPlan)}`;
          
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              category: { type: Type.STRING },
                              items: {
                                  type: Type.ARRAY,
                                  items: {
                                      type: Type.OBJECT,
                                      properties: {
                                          name: { type: Type.STRING }
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          });

          if (response.text) {
              const resList = JSON.parse(response.text);
              const mapped = resList.map((cat: any) => ({
                  category: cat.category,
                  items: cat.items.map((it: any) => ({ name: it.name, checked: false }))
              }));
              setShoppingList(mapped);
          }
      } catch(e) {
          console.error(e);
      } finally {
          setGeneratingList(false);
      }
  };

  const toggleItem = (catIdx: number, itemIdx: number) => {
      const newList = [...shoppingList];
      newList[catIdx].items[itemIdx].checked = !newList[catIdx].items[itemIdx].checked;
      setShoppingList(newList);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-black">
      <div className="w-8 h-8 border-[3px] border-gray-300 dark:border-gray-800 border-t-black dark:border-t-white animate-spin rounded-full"></div>
    </div>
  );

  if (!diet) return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-black p-6 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-24 h-24 bg-white dark:bg-[#1C1C1E] rounded-full flex items-center justify-center shadow-lg mb-6 text-4xl"
          >
            🥗
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[28px] font-bold text-black dark:text-white tracking-tight leading-tight mb-2"
          >
            Plano em preparação
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-[17px] max-w-[280px] leading-relaxed mb-10"
          >
            Sua estratégia alimentar personalizada está sendo finalizada.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/consultation')}
            className="w-full max-w-[240px] py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-2xl active:scale-[0.98] transition-all text-[17px]"
          >
            Voltar ao Início
          </motion.button>
      </div>
  );

  const { displayPlan, totals } = diet;
  const meals = displayPlan?.meals || [];

  return (
    <div className="w-full min-h-[100dvh] bg-[#F2F2F7] dark:bg-black font-sans pb-24 overflow-x-hidden selection:bg-blue-200">
      
      {/* iOS Styled Header */}
      <div className="sticky top-0 z-50 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/10 px-4 pt-12 pb-3 flex items-center justify-between">
        <button onClick={() => navigate('/consultation')} className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-60 transition-opacity -ml-2">
          <ChevronLeft className="w-7 h-7 text-blue-500" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{new Date(diet.updated_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
          <h1 className="text-[17px] font-semibold text-black dark:text-white tracking-tight">{diet.title || 'Plano Alimentar'}</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200/50 dark:bg-white/10 active:opacity-60 transition-opacity">
          <MoreHorizontal className="w-5 h-5 text-blue-500" />
        </button>
      </div>

      <div className="max-w-[480px] mx-auto pt-6 px-4 space-y-8">
        
        {/* Daily Summary Rings / Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5"
        >
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="4" />
                {/* Progress Ring (Kcal) */}
                <circle 
                  cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" 
                  strokeDasharray="100, 100" 
                  strokeDashoffset="25" // Fixed for UI display as a goal
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[20px] font-bold text-black dark:text-white leading-none -mt-1">{Math.round(totals.kcal)}</span>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mt-1">Kcal</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-3.5">
              <MacroRow label="Proteínas" val={totals.p} color="bg-blue-500" />
              <MacroRow label="Carboidratos" val={totals.c} color="bg-teal-500" />
              <MacroRow label="Gorduras" val={totals.f} color="bg-orange-500" />
            </div>
          </div>
        </motion.div>

        {/* Plan Info / Observations */}
        {displayPlan?.observations && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-3xl px-5 py-5 shadow-sm border border-gray-100 dark:border-white/5 flex gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-[15px] font-bold text-black dark:text-white tracking-tight mb-1">Notas do Nutricionista</h3>
              <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
                {displayPlan.observations}
              </p>
            </div>
          </motion.div>
        )}

        {/* Meals List */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[22px] font-bold text-black dark:text-white tracking-tight">Refeições</h2>
            <span className="text-[15px] text-gray-500">{meals.length} no total</span>
          </div>

          <div className="space-y-5">
            {meals.map((meal: any, idx: number) => (
              <MealCard key={idx} meal={meal} index={idx} />
            ))}
          </div>
        </div>

        {/* Shopping List */}
        <div className="pt-4 pb-8">
          {shoppingList.length === 0 ? (
            <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={generateShoppingList}
              disabled={generatingList}
              className="w-full bg-blue-500 text-white py-4 rounded-2xl font-semibold text-[17px] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
            >
              {generatingList ? (
                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white animate-spin rounded-full"></div>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Gerar Lista de Compras IA</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-black dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-500" /> Lista Inteligente
                </h3>
                <button onClick={() => setShoppingList([])} className="text-[15px] text-blue-500 active:opacity-60">Limpar</button>
              </div>

              <div className="space-y-6">
                {shoppingList.map((cat, catIdx) => (
                  <div key={catIdx}>
                    <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">{cat.category}</h4>
                    <div className="bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl overflow-hidden">
                      {cat.items.map((item, itemIdx) => (
                        <div 
                          key={itemIdx} 
                          onClick={() => toggleItem(catIdx, itemIdx)}
                          className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-white/5 last:border-0 cursor-pointer active:bg-gray-200 dark:active:bg-[#3A3A3C] transition-colors"
                        >
                          <span className={`text-[17px] transition-all ${item.checked ? 'text-gray-400 line-through' : 'text-black dark:text-white'}`}>
                            {item.name}
                          </span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {item.checked && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── Components ───────────────────────────────────────────────────────────────

const MacroRow: React.FC<{ label: string; val: number; color: string }> = ({ label, val, color }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between text-[13px] font-medium leading-none">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-black dark:text-white font-semibold">{Math.round(val)}g</span>
    </div>
    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: '60%' }} />
    </div>
  </div>
);

const MealCard: React.FC<{ meal: any; index: number }> = ({ meal, index }) => {
  const kcal = (meal.items || []).reduce((acc: number, it: any) => acc + (it.kcal || 0), 0) || 0;

  const getMealIcon = () => {
    const nameStr = meal.name?.toLowerCase() || '';
    const hour = meal.time ? parseInt(meal.time.split(':')[0]) : 12;

    if (nameStr.includes('café') || nameStr.includes('cafe') || nameStr.includes('desjejum')) return <Coffee className="w-6 h-6" />;
    if (nameStr.includes('lanche')) return <Apple className="w-6 h-6" />;
    if (nameStr.includes('almoço') || nameStr.includes('jantar')) return <Utensils className="w-6 h-6" />;
    if (nameStr.includes('ceia')) return <Moon className="w-6 h-6" />;

    // Fallbacks baseados na hora
    if (hour >= 5 && hour < 11) return <Coffee className="w-6 h-6" />;
    if (hour >= 11 && hour < 15) return <Utensils className="w-6 h-6" />;
    if (hour >= 15 && hour < 19) return <Apple className="w-6 h-6" />;
    if (hour >= 19 && hour <= 23) return <Utensils className="w-6 h-6" />;
    
    return <Moon className="w-6 h-6" />; // Madrugada
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.99] transition-transform overflow-hidden relative"
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 shadow-inner">
            {getMealIcon()}
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-black dark:text-white leading-tight">{meal.name}</h3>
            <span className="text-[14px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {meal.time || '00:00'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[18px] font-bold text-black dark:text-white">{Math.round(kcal)}</span>
          <span className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Kcal</span>
        </div>
      </div>

      <div className="space-y-4">
        {(meal.items || []).map((item: any, idx: number) => (
          <div key={idx} className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] text-black dark:text-white leading-snug">
                <span className="font-bold mr-1.5">
                  {item.qty || item.quantity}{item.unit || 'g'}
                </span>
                {item.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

