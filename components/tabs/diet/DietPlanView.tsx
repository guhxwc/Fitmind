
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { DietPlan, DietDay, DietMeal, DietIngredient, Weekday, DietQuizAnswers } from '../../../types';
import { dietService } from '../../../services/dietService';
import { foodDatabaseService, FoodItem } from '../../../services/foodDatabaseService';
import { ChevronRight, RefreshCw, X, Sparkles, Flame, Utensils, Calendar, ChevronLeft } from 'lucide-react';
import { DietQuiz } from '../DietQuiz';
import Portal from '../../core/Portal';

const DaySelector: React.FC<{ selectedDay: Weekday, onSelect: (day: Weekday) => void }> = ({ selectedDay, onSelect }) => {
  const days: Weekday[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
  const shortDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  
  return (
    <div className="flex overflow-x-auto pb-4 pt-2 gap-3 no-scrollbar snap-x px-4 -mx-4">
      {days.map((day, index) => {
        const isSelected = selectedDay === day;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-[4.8rem] h-20 rounded-[24px] transition-all duration-300 snap-center ${
              isSelected 
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl shadow-black/10 dark:shadow-white/5 scale-105 z-10' 
                : 'bg-white dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800/50 backdrop-blur-sm'
            }`}
          >
            <span className="text-[10px] font-bold tracking-[0.1em] mb-1 opacity-60">{shortDays[index]}</span>
            <span className="text-lg font-bold">{index + 1}</span>
          </button>
        );
      })}
    </div>
  );
};

const IngredientRow: React.FC<{ ingredient: DietIngredient, onSwap: (ing: DietIngredient) => void }> = ({ ingredient, onSwap }) => {
  return (
    <div className="group flex items-center justify-between py-4 px-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl mb-2 last:mb-0 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all active:scale-[0.98]">
      <div className="flex-1">
        <p className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight">{ingredient.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-600 uppercase">{ingredient.amount}</span>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onSwap(ingredient); }}
        className="p-2.5 text-gray-400 hover:text-blue-500 bg-white dark:bg-gray-700/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 transition-all active:scale-90"
        aria-label="Trocar ingrediente"
      >
        <RefreshCw size={16} />
      </button>
    </div>
  );
};

const MealCard: React.FC<{ meal: DietMeal, onSwapIngredient: (mealId: string, ingredient: DietIngredient) => void }> = ({ meal, onSwapIngredient }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let icon = "🍽️";
  let colorClass = "bg-gray-100 text-gray-600";
  
  if (meal.name.includes('Café')) {
      icon = "☕";
      colorClass = "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
  } else if (meal.name.includes('Almoço')) {
      icon = "🥗";
      colorClass = "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  } else if (meal.name.includes('Jantar')) {
      icon = "🌙";
      colorClass = "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400";
  } else if (meal.name.includes('Lanche')) {
      icon = "🍎";
      colorClass = "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
  }

  return (
    <div className="bg-white dark:bg-gray-900/60 backdrop-blur-md rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden transition-all duration-300 mb-4 last:mb-0">
      <div 
        className="p-5 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-2xl shadow-sm ${colorClass}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">{meal.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{meal.time}</p>
                </div>
            </div>
            <div className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-90 bg-black dark:bg-white text-white dark:text-black' : ''}`}>
                <ChevronRight size={18} />
            </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="px-5 pb-5 animate-slide-down">
          <div className="pt-2 border-t border-gray-50 dark:border-gray-800/50 mb-4"></div>
          <div className="space-y-2">
            {meal.ingredients.map(ing => (
              <IngredientRow 
                key={ing.id} 
                ingredient={ing} 
                onSwap={(i) => onSwapIngredient(meal.id, i)} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const DietPlanView: React.FC = () => {
  const { userData } = useAppContext();
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<Weekday>(() => {
    const days: Weekday[] = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[new Date().getDay()];
  });
  const [loading, setLoading] = useState(false);
  const [swappingIngredient, setSwappingIngredient] = useState<{mealId: string, ingredient: DietIngredient} | null>(null);
  const [swapOptions, setSwapOptions] = useState<DietIngredient[]>([]);
  const [swapLoading, setSwapLoading] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [customPreference, setCustomPreference] = useState("");

  const [isManualSearch, setIsManualSearch] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const [manualSearchResults, setManualSearchResults] = useState<FoodItem[]>([]);
  const [manualSearchLoading, setManualSearchLoading] = useState(false);

  useEffect(() => {
    const savedPlan = localStorage.getItem('diet_plan');
    if (savedPlan) {
        try {
            setPlan(JSON.parse(savedPlan));
        } catch (e) {
            console.error("Error parsing saved plan", e);
        }
    }
  }, []);

  const handleQuizComplete = async (answers: DietQuizAnswers) => {
      if (!userData) return;
      setIsQuizOpen(false);
      setLoading(true);
      try {
          const newPlan = await dietService.generateDietPlan(userData, answers);
          setPlan(newPlan);
          localStorage.setItem('diet_plan', JSON.stringify(newPlan));
      } catch (error) {
          console.error("Error generating plan", error);
          alert("Erro ao gerar dieta. Verifique sua conexão e tente novamente.");
      } finally {
          setLoading(false);
      }
  };

  const handleSwapIngredient = async (mealId: string, ingredient: DietIngredient, preference?: string) => {
    setSwappingIngredient({ mealId, ingredient });
    setIsManualSearch(false);
    setManualSearchQuery("");
    setManualSearchResults([]);
    setSwapLoading(true);
    setSwapOptions([]);
    
    try {
        const options = await dietService.swapIngredient(ingredient, preference);
        setSwapOptions(options);
    } catch (err) {
        console.error("Failed to swap", err);
    } finally {
        setSwapLoading(false);
    }
  };

  const handleManualSearch = async (query: string) => {
      setManualSearchQuery(query);
      if (query.length < 2) {
          setManualSearchResults([]);
          return;
      }
      setManualSearchLoading(true);
      try {
          const results = await foodDatabaseService.searchFood(query);
          setManualSearchResults(results);
      } catch (err) {
          console.error(err);
      } finally {
          setManualSearchLoading(false);
      }
  };

  const confirmManualSwap = (foodItem: FoodItem) => {
      if (!swappingIngredient) return;
      
      const newIngredient: DietIngredient = {
          id: Math.random().toString(36).substr(2, 9),
          name: foodItem.nome,
          amount: swappingIngredient.ingredient.amount // Keep original amount text
      };
      confirmSwap(newIngredient);
  };

  const confirmSwap = (newIngredient: DietIngredient) => {
    if (!plan || !swappingIngredient) return;

    const newDays = plan.days.map(day => {
        if (day.day !== selectedDay) return day;
        
        return {
            ...day,
            meals: day.meals.map(meal => {
                if (meal.id !== swappingIngredient.mealId) return meal;
                
                return {
                    ...meal,
                    ingredients: meal.ingredients.map(ing => 
                        ing.id === swappingIngredient.ingredient.id ? newIngredient : ing
                    )
                };
            })
        };
    });

    const updatedPlan = { ...plan, days: newDays };
    setPlan(updatedPlan);
    localStorage.setItem('diet_plan', JSON.stringify(updatedPlan));
    setSwappingIngredient(null);
    setSwapOptions([]);
    setCustomPreference("");
    setIsManualSearch(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-8 animate-fade-in">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
        </div>
        <div className="text-center space-y-2">
            <p className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Criando sua Mágica...</p>
            <p className="text-sm text-gray-400 font-medium">Seu nutricionista IA está montando o cardápio perfeito.</p>
        </div>
      </div>
    );
  }

  if (!plan) {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center animate-fade-in">
              <div className="w-28 h-28 bg-gradient-to-tr from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 rounded-[40px] flex items-center justify-center mb-10 shadow-inner">
                  <Sparkles className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tighter">Dieta Inteligente</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xs leading-relaxed font-medium">
                  Receba um plano alimentar completo, focado em saúde e resultados, gerado especialmente para você.
              </p>
              <button 
                onClick={() => setIsQuizOpen(true)}
                className="w-full max-w-xs bg-black dark:bg-white text-white dark:text-black py-5 rounded-[24px] font-bold text-lg shadow-2xl shadow-black/10 active:scale-95 transition-all"
              >
                  Começar Agora
              </button>
              {isQuizOpen && <DietQuiz onComplete={handleQuizComplete} onClose={() => setIsQuizOpen(false)} />}
          </div>
      )
  }

  const currentDayData = plan.days.find(d => d.day === selectedDay);

  return (
    <div className="space-y-8 pb-40 animate-fade-in">
      {/* Header Section */}
      <div className="px-1">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tighter">Cardápio</h2>
            <button 
                onClick={() => setIsQuizOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
                <RefreshCw size={14} />
                Regenerar
            </button>
        </div>
        <DaySelector selectedDay={selectedDay} onSelect={setSelectedDay} />
      </div>

      {currentDayData ? (
        <div className="space-y-8 px-1">
           <div className="space-y-5">
               <div className="flex items-center justify-between px-2">
                   <h3 className="font-extrabold text-gray-900 dark:text-white text-xl tracking-tight">Refeições</h3>
                   <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-widest">{currentDayData.meals.length} Pratos</span>
               </div>
               
               {currentDayData.meals.length > 0 ? (
                   <div className="space-y-4">
                       {currentDayData.meals.map(meal => (
                        <MealCard 
                            key={meal.id} 
                            meal={meal} 
                            onSwapIngredient={handleSwapIngredient} 
                        />
                       ))}
                   </div>
               ) : (
                   <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900/40 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                       <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6 text-4xl grayscale opacity-30">
                           🍽️
                       </div>
                       <p className="text-gray-900 dark:text-white font-extrabold text-lg mb-1">Dia de Descanso</p>
                       <p className="text-gray-400 text-sm font-medium">Nenhuma refeição planejada.</p>
                   </div>
               )}
           </div>
        </div>
      ) : (
        <div className="text-center py-32">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                <Calendar size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium">Selecione um dia no calendário acima.</p>
        </div>
      )}

      {isQuizOpen && <DietQuiz onComplete={handleQuizComplete} onClose={() => setIsQuizOpen(false)} />}

      {/* Swap Modal - Smart Log Style (Bottom Sheet) */}
      {swappingIngredient && (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setSwappingIngredient(null)}
                ></div>
                
                {/* Modal Card */}
                <div 
                    className="w-full max-h-[90vh] sm:max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl transform transition-transform duration-300 animate-slide-up relative z-10 flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drag Handle */}
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-1 opacity-50 shrink-0"></div>

                    {/* Header */}
                    <div className="px-6 pt-2 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                        <h3 className="font-extrabold text-xl dark:text-white tracking-tight">Trocar Item</h3>
                        <button onClick={() => setSwappingIngredient(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 active:scale-90 transition-transform">
                            <X size={20} />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 pb-10">
                        {/* Original Item Card */}
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] border border-gray-100 dark:border-gray-700/50 flex items-center gap-4 shadow-sm">
                            <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-[18px] flex items-center justify-center text-2xl shadow-sm">
                                🥘
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">Original</p>
                                <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight mb-1">{swappingIngredient.ingredient.name}</p>
                            </div>
                        </div>

                        {!isManualSearch ? (
                            <>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                                        <Sparkles size={16} className="text-orange-500" />
                                        Sugestões Inteligentes
                                    </h4>
                                    {swapLoading && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}
                                </div>
                                
                                {swapLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800/30 rounded-2xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {swapOptions.map(opt => (
                                            <button 
                                                key={opt.id}
                                                onClick={() => confirmSwap(opt)}
                                                className="w-full text-left p-4 rounded-[1.2rem] border border-gray-100 dark:border-gray-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all group bg-white dark:bg-gray-800/30 active:scale-[0.98] shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1 pr-4">
                                                        <span className="font-bold text-gray-900 dark:text-white block mb-1 text-sm leading-tight">{opt.name}</span>
                                                        <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">{opt.amount}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-[0.2em] px-1">Preferência</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={customPreference}
                                                onChange={(e) => setCustomPreference(e.target.value)}
                                                placeholder="Ex: Sem lactose..." 
                                                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all"
                                            />
                                            <button 
                                                onClick={() => handleSwapIngredient(swappingIngredient.mealId, swappingIngredient.ingredient, customPreference)}
                                                className="absolute right-1.5 top-1.5 bottom-1.5 w-8 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleSwapIngredient(swappingIngredient.mealId, swappingIngredient.ingredient, customPreference)}
                                            className="py-3 rounded-xl font-bold text-[10px] text-gray-500 hover:text-orange-500 bg-gray-50 dark:bg-gray-800/30 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors flex flex-col items-center justify-center gap-1 border border-transparent hover:border-orange-200 dark:hover:border-orange-800 uppercase tracking-widest"
                                        >
                                            <RefreshCw size={14} />
                                            Regenerar
                                        </button>
                                        
                                        <button 
                                            onClick={() => setIsManualSearch(true)}
                                            className="py-3 rounded-xl font-bold text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors flex flex-col items-center justify-center gap-1 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 uppercase tracking-widest"
                                        >
                                            <Utensils size={14} />
                                            Manual
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-4">
                                    <button 
                                        onClick={() => setIsManualSearch(false)}
                                        className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 active:scale-90 transition-transform"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <h4 className="font-bold text-base text-gray-900 dark:text-white">Busca Manual</h4>
                                </div>

                                <div className="relative mb-4">
                                    <input 
                                        type="text" 
                                        value={manualSearchQuery}
                                        onChange={(e) => handleManualSearch(e.target.value)}
                                        placeholder="Buscar alimento..." 
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                        autoFocus
                                    />
                                    {manualSearchLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </div>

                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                                    {manualSearchResults.length > 0 ? (
                                        manualSearchResults.map(item => (
                                            <button 
                                                key={item.id}
                                                onClick={() => confirmManualSwap(item)}
                                                className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all bg-white dark:bg-gray-900 active:scale-[0.98] shadow-sm"
                                            >
                                                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.nome}</p>
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                                    <span>Base de dados TACO</span>
                                                </div>
                                            </button>
                                        ))
                                    ) : manualSearchQuery.length >= 2 && !manualSearchLoading ? (
                                        <p className="text-center text-xs text-gray-400 py-8">Nenhum alimento encontrado.</p>
                                    ) : (
                                        <p className="text-center text-xs text-gray-400 py-8">Digite para buscar...</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
      )}
    </div>
  );
};
