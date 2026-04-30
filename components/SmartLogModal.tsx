
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from './AppContext';
import Portal from './core/Portal';
import { SparklesIcon, CheckCircleIcon, MicrophoneIcon, KeyboardIcon, CameraIcon, XMarkIcon, ArrowPathIcon, ChevronLeftIcon, LockIcon } from './core/Icons';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';
import { CalorieCamModal } from './tabs/CalorieCamModal';
import { ManualMealModal } from './tabs/ManualMealModal';
import { FavoriteMealsModal } from './tabs/FavoriteMealsModal';
import { GoogleGenAI } from "@google/genai";
import { useScrollLock } from '../hooks/useScrollLock';

interface SmartLogModalProps {
  onClose: () => void;
  initialMealType?: string;
  initialMode?: LogMode;
}

type LogMode = 'menu' | 'type' | 'voice' | 'camera' | 'favorites' | 'review' | 'manual';

export interface BaseFood {
  id: string;
  name: string;
  category: string | null;
  portion_size: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

export interface ReviewIngredient {
  id: string;
  baseFood: BaseFood | null;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export const SmartLogModal: React.FC<SmartLogModalProps> = ({ onClose, initialMealType, initialMode }) => {
  const { userData, setMeals, updateStreak, setCurrentWater, setWeightHistory, setUserData, calculateGoals, setWeightMilestoneData } = useAppContext();
  const { addToast } = useToast();
  const [mode, setMode] = useState<LogMode>(initialMode || 'menu');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewData, setReviewData] = useState<{
    name: string;
    type: string;
    ingredients: ReviewIngredient[];
    notes: string;
  } | null>(null);
  
  useScrollLock(true);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      addToast("Erro ao acessar microfone", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleProcess = async (source: 'text' | 'audio') => {
    if (source === 'text' && !input.trim()) return;
    if (source === 'audio' && !audioBlob) return;
    if (!userData) return;
    
    setIsProcessing(true);

    try {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";

      const prompt = `
        Você é um assistente de nutrição inteligente. O usuário vai descrever o que comeu.
        Extraia a refeição e seus ingredientes, com quantidades em gramas (se não especificado, estime uma porção padrão de 100g ou 1 unidade).
        Sugira um "nome" para a refeição inteira (ex: "Peito de Frango Grelhado com Arroz e Salada"). 
        Identifique o tipo da refeição ('Café da manhã', 'Almoço', 'Jantar', 'Lanche').
        
        Para cada ingrediente, forneça uma lista com 1 a 3 palavras-chave principais e essenciais para a busca na tabela TACO brasileira. 
        Exemplo: se o usuário disse "Peito de frango grelhado na manteiga", as palavras-chave ideais seriam ["frango", "peito"].
        Se disse "arroz branco", as palavras-chave são ["arroz", "branco"].
        Evite palavras como "com", "de", "sem", "grelhado", "assado", "cozido" a não ser que alterem drasticamente o alimento.
      `;

      const responseSchema = {
        type: "object",
        properties: {
          meal_name: { type: "string" },
          meal_type: { type: "string" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                search_keywords: {
                  type: "array",
                  items: { type: "string" },
                  description: "1 a 3 palavras-chave fundamentais para buscar na tabela TACO"
                },
                grams: { type: "number" }
              },
              required: ["name", "search_keywords", "grams"]
            }
          }
        },
        required: ["meal_name", "meal_type", "ingredients"]
      };

      let response;
      if (source === 'text') {
        response = await ai.models.generateContent({
          model: model,
          contents: `${prompt}\n\nEntrada do usuário: "${input}"`,
          config: { 
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });
      } else {
        const base64Audio = await blobToBase64(audioBlob!);
        response = await ai.models.generateContent({
          model: model,
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: audioBlob!.type,
                    data: base64Audio
                  }
                }
              ]
            }
          ],
          config: { 
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });
      }

      const result = JSON.parse(response.text || '{}');
      
      if (result.ingredients && result.ingredients.length > 0) {
          const ingredientPromises = result.ingredients.map(async (ing: any) => {
            let foundFood: BaseFood | null = null;

            // Estratégia: tenta cada keyword (em ordem) usando RPC search_foods,
            // que ranqueia por relevância (match exato > prefixo > palavra inteira > substring,
            // com boost pra alimentos comuns e penalidade pra "Alimentos preparados").
            const tryRpcSearch = async (term: string): Promise<BaseFood | null> => {
              const cleaned = term.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim();
              if (cleaned.length < 2) return null;
              const { data } = await supabase.rpc('search_foods', { p_query: cleaned, p_limit: 1 });
              return (data && data.length > 0) ? (data[0] as BaseFood) : null;
            };

            // 1. Tenta com o nome COMPLETO sugerido pela IA ou com todas as keywords juntas primeiro
            const fullTerm = ing.name || (ing.search_keywords ? ing.search_keywords.join(' ') : '');
            if (fullTerm) {
              foundFood = await tryRpcSearch(fullTerm);
            }

            // 2. Tenta com cada keyword individualmente apenas se não achou nada (Fallback)
            if (!foundFood && ing.search_keywords && ing.search_keywords.length > 0) {
              for (const keyword of ing.search_keywords) {
                // Pula se a keyword sozinha for muito curta ou igual ao termo completo já tentado
                if (keyword.length < 3 || keyword.toLowerCase() === fullTerm.toLowerCase()) continue;
                foundFood = await tryRpcSearch(keyword);
                if (foundFood) break;
              }
            }

            // 3. Fallback: primeira palavra do nome do ingrediente
            if (!foundFood) {
              const nameFirstWord = ing.name?.split(' ')[0] || '';
              if (nameFirstWord.length > 2 && nameFirstWord.toLowerCase() !== fullTerm.toLowerCase()) {
                foundFood = await tryRpcSearch(nameFirstWord);
              }
            }

            // 3. Último recurso: nome completo do ingrediente
            if (!foundFood && ing.name) {
              foundFood = await tryRpcSearch(ing.name);
            }

            if (foundFood) {
              const ratio = ing.grams / (foundFood.portion_size || 100);
              return {
                id: Math.random().toString(),
                baseFood: foundFood,
                name: foundFood.name,
                grams: ing.grams,
                kcal: Math.round(Number(foundFood.kcal || 0) * ratio),
                protein: Number((Number(foundFood.protein || 0) * ratio).toFixed(1)),
                carbs: Number((Number(foundFood.carbs || 0) * ratio).toFixed(1)),
                fat: Number((Number(foundFood.fat || 0) * ratio).toFixed(1)),
                fiber: 0,
                sodium: 0
              };
            } else {
               return {
                id: Math.random().toString(),
                baseFood: null,
                name: ing.name,
                grams: ing.grams,
                kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0
              };
            }
          });

          const finalIngredients = await Promise.all(ingredientPromises);

          setReviewData({
            name: result.meal_name || 'Refeição',
            type: result.meal_type || 'Almoço',
            ingredients: finalIngredients,
            notes: ''
          });
          setMode('review');
      } else {
          addToast('Não foi possível identificar ingredientes da refeição.', 'error');
      }

    } catch (error) {
      console.error(error);
      addToast('Não entendi. Tente detalhar melhor.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveReview = () => {
    if (!reviewData) return;
    
    const totalKcal = reviewData.ingredients.reduce((acc, curr) => acc + curr.kcal, 0);
    const totalProtein = reviewData.ingredients.reduce((acc, curr) => acc + curr.protein, 0);
    
    setMeals(prev => [...prev, {
      id: Date.now().toString(),
      name: reviewData.name,
      calories: totalKcal,
      protein: totalProtein,
      type: reviewData.type as "Café da manhã" | "Almoço" | "Jantar" | "Lanche" | undefined,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }]);

    updateStreak();
    addToast('Refeição salva!', 'success');
    onClose();
  };

  const searchAndUpdateIngredient = async (id: string, name: string, grams: number) => {
    if (name.trim().length < 2) return;
    try {
      const cleaned = name.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim();
      const { data } = await supabase.rpc('search_foods', { p_query: cleaned, p_limit: 1 });
      if (data && data.length > 0) {
        const foundFood = data[0] as BaseFood;
        const ratio = (grams || 0) / (foundFood.portion_size || 100);
        
        setReviewData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            ingredients: prev.ingredients.map(ing => {
              if (ing.id === id) {
                 return {
                   ...ing,
                   baseFood: foundFood,
                   kcal: Math.round(Number(foundFood.kcal || 0) * ratio),
                   protein: Number((Number(foundFood.protein || 0) * ratio).toFixed(1)),
                   carbs: Number((Number(foundFood.carbs || 0) * ratio).toFixed(1)),
                   fat: Number((Number(foundFood.fat || 0) * ratio).toFixed(1)),
                   fiber: Number((Number(foundFood.fiber || 0) * ratio).toFixed(1)),
                   sodium: Math.round(Number(foundFood.sodium || 0) * ratio),
                   name: foundFood.name,
                 };
              }
              return ing;
            })
          };
        });
        addToast(`${foundFood.name} encontrado!`, 'success');
      } else {
        addToast(`Não encontramos "${name}"`, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNameChange = (id: string, val: string) => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map(ing => {
          if (ing.id === id) return { ...ing, name: val };
          return ing;
        })
      };
    });
  };

  const handleAddNewIngredient = () => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            id: Math.random().toString(),
            baseFood: null,
            name: '',
            grams: 100,
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sodium: 0
          }
        ]
      };
    });
  };

  const handleUpdateIngredient = (id: string, grams: string) => {
    const numGrams = parseInt(grams) || 0;
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map(ing => {
          if (ing.id === id) {
            if (ing.baseFood) {
              const ratio = numGrams / (ing.baseFood.portion_size || 100);
              return {
                ...ing,
                grams: numGrams,
                kcal: Math.round(Number(ing.baseFood.kcal || 0) * ratio),
                protein: Number((Number(ing.baseFood.protein || 0) * ratio).toFixed(1)),
                carbs: Number((Number(ing.baseFood.carbs || 0) * ratio).toFixed(1)),
                fat: Number((Number(ing.baseFood.fat || 0) * ratio).toFixed(1))
              };
            }
            return { ...ing, grams: numGrams };
          }
          return ing;
        })
      };
    });
  };

  const handleRemoveIngredient = (id: string) => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.filter(ing => ing.id !== id)
      };
    });
  };

  if (mode === 'camera') {
    return (
      <CalorieCamModal 
        onClose={onClose} 
        initialMealType={initialMealType}
        onAddMeal={(meal) => {
          setMeals(prev => [...prev, { ...meal, id: Date.now().toString(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
          updateStreak();
          addToast('Refeição adicionada!', 'success');
          onClose();
        }} 
      />
    );
  }

  if (mode === 'manual') {
    return (
      <ManualMealModal 
        onClose={onClose} 
        initialMealType={initialMealType}
        onAddMeal={(meal) => {
          setMeals(prev => [...prev, { ...meal, id: Date.now().toString(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
          updateStreak();
          addToast('Refeição adicionada!', 'success');
          onClose();
        }} 
      />
    );
  }

  if (mode === 'favorites') {
    return (
      <FavoriteMealsModal 
        onClose={onClose} 
        onAddMeal={(meal) => {
          setMeals(prev => [...prev, { ...meal, id: Date.now().toString(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
          updateStreak();
          addToast('Refeição favorita adicionada!', 'success');
          onClose();
        }} 
      />
    );
  }

  if (mode === 'review' && reviewData) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-[#F4F5F7] dark:bg-black z-[100] flex justify-center overflow-hidden animate-fade-in">
          <div className="w-full max-w-[480px] h-full flex flex-col relative bg-white dark:bg-black">
            {/* Header */}
            <div className="flex-shrink-0 pt-12 pb-4 px-6 bg-white dark:bg-black flex items-center justify-between z-20 sticky top-0">
               <button onClick={() => setMode('type')} className="text-gray-900 dark:text-white p-2 -ml-2 active:scale-95 transition-transform">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                 </svg>
               </button>
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revisar Refeição</h2>
               <div className="w-10"></div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto px-6 pb-28 hide-scrollbar bg-[#F9FAFB] dark:bg-black">
              <div className="space-y-6 pt-4">
                {/* Nome da Refeição */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Nome da Refeição</label>
                  <textarea 
                    value={reviewData.name} 
                    onChange={(e) => setReviewData({...reviewData, name: e.target.value})}
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm text-gray-900 dark:text-white font-medium resize-none min-h-[60px]"
                    rows={2}
                  />
                </div>

                {/* Informações Nutricionais */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Informações Nutricionais</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                       <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">🔥 Calorias</div>
                       <input type="text" readOnly className="w-full bg-transparent font-medium" value={Math.round(reviewData.ingredients.reduce((a,b)=>a+b.kcal,0))} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                       <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">🥩 Proteínas</div>
                       <input type="text" readOnly className="w-full bg-transparent font-medium" value={Math.round(reviewData.ingredients.reduce((a,b)=>a+b.protein,0))} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                       <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">🍞 Carboidratos</div>
                       <input type="text" readOnly className="w-full bg-transparent font-medium" value={Math.round(reviewData.ingredients.reduce((a,b)=>a+b.carbs,0))} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                       <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">🥑 Gorduras</div>
                       <input type="text" readOnly className="w-full bg-transparent font-medium" value={Math.round(reviewData.ingredients.reduce((a,b)=>a+b.fat,0))} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                       <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">🌾 Fibras</div>
                       <input type="text" readOnly className="w-full bg-transparent font-medium" value={Number(reviewData.ingredients.reduce((a,b)=>a+(b.fiber||0),0)).toFixed(1)} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                       <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">🧂 Sódio</div>
                       <input type="text" readOnly className="w-full bg-transparent font-medium" value={Math.round(reviewData.ingredients.reduce((a,b)=>a+(b.sodium||0),0))} />
                    </div>
                  </div>
                </div>

                {/* Ingredientes */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Ingredientes</label>
                  <div className="space-y-3">
                    {reviewData.ingredients.map(ing => (
                      <div key={ing.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                        <div className="flex-1 min-w-0 pr-3">
                          <input 
                            type="text"
                            value={ing.name}
                            onChange={(e) => handleNameChange(ing.id, e.target.value)}
                            onBlur={() => searchAndUpdateIngredient(ing.id, ing.name, ing.grams)}
                            placeholder="Nome do alimento"
                            className="font-bold text-gray-900 dark:text-white bg-transparent outline-none w-full truncate border-b border-transparent focus:border-gray-300 dark:focus:border-gray-600 transition-colors"
                          />
                          <p className="text-xs text-gray-500 mt-1">{ing.kcal} kcal</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={ing.grams || ''} 
                              onChange={(e) => handleUpdateIngredient(ing.id, e.target.value)}
                              className="w-20 h-10 px-2 pr-6 text-center border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold bg-transparent"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">g</span>
                          </div>
                          <button onClick={() => handleRemoveIngredient(ing.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                     onClick={handleAddNewIngredient}
                     className="mt-4 p-4 w-full bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                     + Adicionar ingrediente
                  </button>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Observações</label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                    placeholder="Adicione detalhes sobre a refeição..."
                    className="w-full h-24 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 flex gap-4 z-10 pb-8">
              <button onClick={onClose} className="flex-1 py-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-gray-500 font-bold rounded-xl active:scale-[0.98] transition-transform">
                Descartar
              </button>
              <button onClick={handleSaveReview} className="flex-[2] py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl active:scale-[0.98] transition-transform">
                Salvar
              </button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
        <div className="bg-white dark:bg-black w-full max-w-[360px] rounded-[32px] animate-pop-in shadow-2xl relative flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Header Area */}
            <div className="flex-shrink-0 pt-8 pb-2 px-8 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95 z-20"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto p-8 pt-2 hide-scrollbar">
              {mode === 'menu' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro Inteligente</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Como deseja registrar hoje?</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <button 
                      onClick={() => {
                        if (userData?.isPro) {
                          setMode('type');
                        } else {
                          addToast("Recurso exclusivo para assinantes PRO", "info");
                        }
                      }}
                      className="flex items-center gap-4 p-5 bg-[#F4F5F7] dark:bg-gray-800 rounded-[20px] active:scale-[0.98] transition-all relative overflow-hidden"
                    >
                      {!userData?.isPro && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
                          <LockIcon className="w-2.5 h-2.5" /> PRO
                        </div>
                      )}
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <SparklesIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white">Digitar</p>
                        <p className="text-xs text-gray-500">Escreva naturalmente o que comeu</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        if (userData?.isPro) {
                          setMode('voice');
                        } else {
                          addToast("Recurso exclusivo para assinantes PRO", "info");
                        }
                      }}
                      className="flex items-center gap-4 p-5 bg-[#F4F5F7] dark:bg-gray-800 rounded-[20px] active:scale-[0.98] transition-all relative overflow-hidden"
                    >
                      {!userData?.isPro && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
                          <LockIcon className="w-2.5 h-2.5" /> PRO
                        </div>
                      )}
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                        <MicrophoneIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white">Falar</p>
                        <p className="text-xs text-gray-500">Grave um áudio descrevendo tudo</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        if (userData?.isPro) {
                          setMode('camera');
                        } else {
                          addToast("Recurso exclusivo para assinantes PRO", "info");
                        }
                      }}
                      className="flex items-center gap-4 p-5 bg-[#F4F5F7] dark:bg-gray-800 rounded-[20px] active:scale-[0.98] transition-all relative overflow-hidden"
                    >
                      {!userData?.isPro && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
                          <LockIcon className="w-2.5 h-2.5" /> PRO
                        </div>
                      )}
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                        <CameraIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white">CalorieCam</p>
                        <p className="text-xs text-gray-500">Tire uma foto do seu prato</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {mode === 'type' && (
                <div className="animate-fade-in">
                  <div className="flex items-center mb-6">
                    <button onClick={() => setMode('menu')} className="text-gray-900 dark:text-white p-2 -ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mx-auto pr-8">Digitar</h2>
                  </div>

                  <p className="text-center text-gray-600 dark:text-gray-300 mb-4 px-4 text-sm">
                    Descreva os detalhes da refeição e quantidades
                  </p>

                  <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ex: 100g de arroz, 100g de frango, 1 prato de salada..."
                      className="w-full h-40 bg-[#F4F5F7] dark:bg-gray-800 rounded-2xl p-4 text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none mb-6"
                  />

                  <button
                      onClick={() => handleProcess('text')}
                      disabled={isProcessing || !input.trim()}
                      className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 ${input.trim() ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-[#7A7A7A] text-white'}`}
                  >
                      {isProcessing ? <><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processando...</> : "Registrar"}
                  </button>
                </div>
              )}


              {mode === 'voice' && (
                <div className="animate-fade-in text-center">
                  <div className="flex items-center mb-6">
                    <button onClick={() => { stopRecording(); setMode('menu'); }} className="text-gray-900 dark:text-white p-2 -ml-2">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                       </svg>
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mx-auto pr-8">Falar Registro</h2>
                  </div>

                  <div className="py-10">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-purple-500'}`}>
                      <MicrophoneIcon className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-2xl font-mono font-bold mt-6 text-gray-900 dark:text-white">{formatTime(recordingTime)}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      {isRecording ? "Gravando... Fale naturalmente." : audioBlob ? "Gravação concluída!" : "Toque em Iniciar para falar"}
                    </p>
                  </div>

                  <div className="flex gap-4 mt-6">
                    {!isRecording && !audioBlob && (
                      <button onClick={startRecording} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold">Iniciar Gravação</button>
                    )}
                    {isRecording && (
                      <button onClick={stopRecording} className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold">Parar</button>
                    )}
                    {audioBlob && !isRecording && (
                      <>
                        <button onClick={() => { setAudioBlob(null); setRecordingTime(0); }} className="w-1/3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><ArrowPathIcon className="w-5 h-5" /> Refazer</button>
                        <button onClick={() => handleProcess('audio')} disabled={isProcessing} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                          {isProcessing ? "Analisando..." : "Analisar Áudio"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </Portal>
  );
};
