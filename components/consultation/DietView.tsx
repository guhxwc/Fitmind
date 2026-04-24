import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { ChevronLeft, ChevronRight, MoreHorizontal, Sun, Moon, Utensils, ShoppingBag, Check, Bookmark, Sparkles } from 'lucide-react';
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
    const loadDiet = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('diet_plans')
            .select('*')
            .eq('user_id', session.user.id)
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
  }, [session?.user?.id]);

  const generateShoppingList = async () => {
      if (!diet || !diet.displayPlan) return;
      setGeneratingList(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
          const prompt = `Analise este plano de dieta e extraia todos os alimentos necessários. Retorne uma lista de compras otimizada e categorizada (ex: Hortifruti, Açougue, Laticínios, Mercearia).
Plano: ${JSON.stringify(diet.displayPlan)}`;
          
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
    <div className="flex h-screen items-center justify-center bg-[#F8F9FB] dark:bg-black">
      <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent animate-spin rounded-full"></div>
    </div>
  );

  if (!diet) return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FB] dark:bg-black p-6 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-white dark:bg-[#1C1C1E] rounded-[32px] flex items-center justify-center shadow-xl mb-6 text-4xl"
          >
            🥗
          </motion.div>
          <h2 className="text-[24px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-7 mb-2">Plano em preparação</h2>
          <p className="text-gray-500 text-[16px] max-w-[280px] leading-relaxed mb-8">Sua estratégia alimentar personalizada está sendo finalizada pela nossa equipe.</p>
          <button 
            onClick={() => navigate('/consultation')}
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-[22px] shadow-xl active:scale-95 transition-all text-[15px]"
          >
            Voltar ao Início
          </button>
      </div>
  );

  const { displayPlan, totals } = diet;
  const meals = displayPlan?.meals || [];

  return (
    <div className="w-full min-h-[100dvh] bg-[#F8F9FB] dark:bg-black font-sans flex justify-center pb-24 overflow-x-hidden">
      <div className="w-full max-w-[480px] min-h-[100dvh] bg-[#F8F9FB] dark:bg-black relative flex flex-col pt-4">
        
        {/* Header */}
        <div className="px-5 mb-8 flex items-center justify-between">
          <button onClick={() => navigate('/consultation')} className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-gray-900 dark:text-white">{diet.title || 'Plano base'}</h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[13px] font-medium text-gray-400 capitalize">
                {new Date(diet.updated_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <div className="w-3.5 h-3.5 text-gray-400">📅</div>
            </div>
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm active:scale-90 transition-transform">
            <MoreHorizontal className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Macros Dashboard */}
        <div className="px-5 mb-8">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5">
            <div className="grid grid-cols-4 gap-4">
              <MacroCard label="KCAL" value={totals.kcal} meta={totals.kcal} color="bg-[#5856D6]" />
              <MacroCard label="PROT" value={totals.p} meta={totals.p} color="bg-[#007AFF]" unit="g" />
              <MacroCard label="CARB" value={totals.c} meta={totals.c} color="bg-[#34C759]" unit="g" />
              <MacroCard label="GORD" value={totals.f} meta={totals.f} color="bg-[#FF9500]" unit="g" />
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div className="px-5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[22px] font-extrabold text-gray-900 dark:text-white tracking-tight">Refeições do dia</h2>
            <div className="flex items-center gap-1 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30">
              <span className="text-[14px] font-bold text-blue-600 dark:text-blue-400">{meals.length} refeições</span>
              <ChevronRight className="w-4 h-4 text-blue-400 rotate-90" />
            </div>
          </div>

          <div className="space-y-6">
            {meals.map((meal: any, idx: number) => (
              <MealCard key={idx} meal={meal} index={idx} />
            ))}
          </div>

          {/* Observations */}
          {displayPlan?.observations && (
            <div className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF3CC] dark:from-amber-900/10 dark:to-orange-900/10 rounded-[32px] p-6 border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-400">
                <Sparkles className="w-5 h-5 fill-current" />
                <span className="font-extrabold text-[16px] tracking-tight">Orientação do Nutri</span>
              </div>
              <p className="text-[15px] leading-relaxed text-amber-900/90 dark:text-amber-200/80 font-medium">
                {displayPlan.observations}
              </p>
            </div>
          )}

          {/* Shopping List Section */}
          <div className="pt-4">
            {shoppingList.length === 0 ? (
              <button 
                onClick={generateShoppingList}
                disabled={generatingList}
                className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 py-5 rounded-[28px] shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all group"
              >
                {generatingList ? (
                  <div className="w-5 h-5 border-2 border-gray-900 dark:border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[16px] font-bold text-gray-900 dark:text-white">Gerar lista de compras</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-7 shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-green-500" /> Lista de Compras
                  </h3>
                  <button onClick={() => setShoppingList([])} className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Limpar</button>
                </div>

                <div className="space-y-8">
                  {shoppingList.map((cat, catIdx) => (
                    <div key={catIdx} className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[2px]">{cat.category}</h4>
                      <div className="grid gap-3">
                        {cat.items.map((item, itemIdx) => (
                          <div 
                            key={itemIdx} 
                            onClick={() => toggleItem(catIdx, itemIdx)}
                            className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 cursor-pointer select-none active:scale-[0.98] transition-all"
                          >
                            <div className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-200 dark:border-gray-700'}`}>
                              {item.checked && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                            </div>
                            <span className={`text-[15px] font-bold leading-tight ${item.checked ? 'text-gray-400 line-through opacity-50' : 'text-gray-900 dark:text-white'}`}>
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const MacroCard: React.FC<{ label: string; value: number; meta: number; color: string; unit?: string }> = ({ label, value, meta, color, unit = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / (meta || 1)) * 100));
  
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-extrabold text-gray-400 mb-2">{label}</span>
      <span className="text-[18px] font-black text-gray-900 dark:text-white leading-none">
        {Math.round(value)}{unit}
      </span>
      <span className="text-[12px] font-bold text-gray-400 mt-1 mb-3">
        Meta: {Math.round(meta)}{unit}
      </span>
      <div className="w-full h-[3px] bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
};

const MealCard: React.FC<{ meal: any; index: number }> = ({ meal, index }) => {
  const isNight = meal.time && (parseInt(meal.time.split(':')[0]) >= 18 || parseInt(meal.time.split(':')[0]) <= 5);
  const kcal = (meal.items || []).reduce((acc: number, it: any) => acc + (it.kcal || 0), 0) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 relative"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[20px] bg-[#EBF5FF] dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            {isNight ? <Moon className="w-7 h-7 fill-current" /> : <Sun className="w-7 h-7 fill-current" />}
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">{meal.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-3.5 h-3.5 text-gray-400">🕒</div>
              <span className="text-[13px] font-semibold text-gray-400 uppercase">{meal.time || '00:00'}</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-[#F0F2FF] dark:bg-blue-900/30 rounded-lg">
          <span className="text-[13px] font-black text-blue-600 dark:text-blue-400">{Math.round(kcal)} kcal</span>
        </div>
      </div>

      <div className="space-y-3.5 mb-6">
        {(meal.items || []).map((item: any, idx: number) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div className="text-[15px] font-medium text-gray-600 dark:text-gray-300">
              <span className="font-black text-gray-900 dark:text-white mr-1">
                {item.qty || item.quantity}{item.unit || 'g'}
              </span>
              {item.name}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0F7FF] dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 active:scale-95 transition-all">
          <div className="w-4 h-4">📝</div>
          <span className="text-[14px] font-bold">Ver detalhes</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 active:scale-90 transition-all">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 absolute right-6 top-[50%] -translate-y-1/2 pointer-events-none" />
    </motion.div>
  );
};
