import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { ChevronLeft, Check, Sparkles, ShoppingBag } from 'lucide-react';
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
        const { data } = await supabase
            .from('diet_plans')
            .select('*')
            .eq('user_id', session.user.id)
            .order('version', { ascending: false })
            .limit(1);
        if (data && data.length > 0) {
            setDiet(data[0]);
        }
        setLoading(false);
    };
    loadDiet();
  }, [session?.user?.id]);

  const generateShoppingList = async () => {
      if (!diet || !diet.plan) return;
      setGeneratingList(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
          const prompt = `Analise este plano de dieta e extraia todos os alimentos necessários. Retorne uma lista de compras otimizada e categorizada (ex: Hortifruti, Açougue, Laticínios, Mercearia).
Plano: ${JSON.stringify(diet.plan)}`;
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
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
          alert('Erro ao gerar lista de compras.');
      } finally {
          setGeneratingList(false);
      }
  };

  const toggleItem = (catIdx: number, itemIdx: number) => {
      const newList = [...shoppingList];
      newList[catIdx].items[itemIdx].checked = !newList[catIdx].items[itemIdx].checked;
      setShoppingList(newList);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#F2F2F7] dark:bg-black"><div className="w-8 h-8 border-4 border-[#007AFF] border-t-transparent flex items-center justify-center animate-spin rounded-full"></div></div>;

  if (!diet) return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F2F2F7] dark:bg-black p-4 space-y-4 text-center">
          <button onClick={() => navigate('/consultation')} className="absolute top-10 left-4 p-2 bg-white dark:bg-[#1C1C1E] rounded-full shadow-sm"><ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" /></button>
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"><span className="text-xl">🥗</span></div>
          <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mt-10">Dieta não encontrada</h2>
          <p className="text-gray-500 text-[15px] max-w-[280px]">Sua dieta ainda está sendo preparada. Volte em breve!</p>
      </div>
  );

  return (
    <div className="w-full min-h-[100dvh] bg-[#F2F2F7] dark:bg-black font-sans flex justify-center">
      <div className="w-full max-w-[480px] min-h-[100dvh] bg-[#F2F2F7] dark:bg-black relative flex flex-col pb-24 sm:border-x sm:border-gray-200 dark:sm:border-gray-900">
        
        <div className="px-4 pt-safe-top pb-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 dark:border-gray-900 flex items-center gap-3">
          <button onClick={() => navigate('/consultation')} className="p-2 -ml-2 active:opacity-50">
            <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-[18px] font-bold text-gray-900 dark:text-white text-center flex-1 pr-6">{diet.title || 'Dieta Personalizada'}</h1>
        </div>

        <div className="p-4 space-y-6">
           <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-900 rounded-[24px] p-5 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Refeições</h3>
               <div className="space-y-5">
                   {(diet.plan?.meals || []).map((meal: any, idx: number) => (
                       <div key={idx} className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                           <div className="flex items-center justify-between mb-2">
                               <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">{meal.name}</h4>
                               <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">{meal.time}</span>
                           </div>
                           <ul className="space-y-1.5 list-disc list-inside text-[15px] text-gray-700 dark:text-gray-300">
                               {(meal.items || []).map((item: any, iIdx: number) => (
                                   <li key={iIdx}><span className="font-medium">{item.quantity}</span> {item.name}</li>
                               ))}
                           </ul>
                       </div>
                   ))}
               </div>
           </div>

           {diet.plan?.observations && (
               <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-[24px] p-5 shadow-sm">
                   <h3 className="text-md font-bold text-orange-800 dark:text-orange-400 mb-2">Observações do Nutri</h3>
                   <p className="text-[14px] text-orange-900/80 dark:text-orange-200 whitespace-pre-wrap leading-relaxed">{diet.plan.observations}</p>
               </div>
           )}

            {shoppingList.length === 0 ? (
                <button 
                    onClick={generateShoppingList}
                    disabled={generatingList}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 active:scale-[0.98] transition-all text-white font-bold text-[16px] py-4 rounded-[20px] shadow-[0_8px_24px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                >
                    {generatingList ? (
                       <div className="w-5 h-5 border-2 border-white border-t-transparent flex items-center justify-center animate-spin rounded-full"></div>
                    ) : (
                       <>
                         <ShoppingBag className="w-5 h-5 text-white" fill="currentColor" />
                         <span>Gerar Lista de Compras Inteligente</span>
                       </>
                    )}
                </button>
            ) : (
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-900 rounded-[24px] p-5 shadow-sm space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           <ShoppingBag className="w-5 h-5 text-emerald-500" />Lista de Compras
                        </h3>
                        <p className="text-[13px] text-gray-500 mt-1">Lista de compras gerada apartir dos alimentos necessários para sua dieta:</p>
                    </div>

                    <div className="space-y-4 mt-4">
                        {shoppingList.map((cat, catIdx) => (
                            <div key={catIdx} className="space-y-2">
                                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{cat.category}</h4>
                                <div className="space-y-2">
                                    {cat.items.map((item, itemIdx) => (
                                        <label key={itemIdx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 cursor-pointer select-none">
                                            <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                {item.checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                            </div>
                                            <span className={`text-[15px] font-medium transition-colors ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                {item.name}
                                            </span>
                                        </label>
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
  );
};
