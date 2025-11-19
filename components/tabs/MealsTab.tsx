
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { UserData, Meal, DietQuizAnswers, GeneratedDietPlan } from '../../types';
import { FlameIcon, CameraIcon, ClipboardListIcon, CoffeeIcon, SoupIcon, CarrotIcon, FeatherIcon, ListChecksIcon, ChevronLeftIcon, ChevronRightIcon, LeafIcon, UtensilsIcon, PlusIcon, ArrowPathIcon } from '../core/Icons';
import { DietQuiz } from './DietQuiz';
import { CalorieCamModal } from './CalorieCamModal';
import { useAppContext } from '../AppContext';
import { ManualMealModal } from './ManualMealModal';
import { FastingView } from './FastingView';

const MealItem: React.FC<{ meal: Meal }> = ({ meal }) => (
  <div className="bg-ios-card dark:bg-ios-dark-card p-4 rounded-[18px] flex items-center justify-between shadow-sm mb-3 active:scale-[0.99] transition-transform">
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
            <UtensilsIcon className="w-5 h-5" />
        </div>
        <div>
            <p className="font-bold text-gray-900 dark:text-white text-[17px]">{meal.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{meal.time}</p>
        </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-gray-900 dark:text-white">{meal.calories} <span className="text-xs text-gray-500 font-normal">kcal</span></p>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{meal.protein}g prot</p>
    </div>
  </div>
);

const ProgressIndicator: React.FC<{ label: string; value: number; goal: number; unit: string; color: string }> = ({ label, value, goal, unit, color }) => {
    const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    return (
        <div className="flex-1">
            <div className="flex justify-between items-baseline mb-2">
                <span className="font-semibold text-sm text-gray-600 dark:text-gray-300">{label}</span>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{Math.round(value)} / {goal} {unit}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
            </div>
        </div>
    );
};

// ... (DietPlanView code remains largely same but with card style updates below) ...
interface DietPlanViewProps {
  addMealToToday: (meal: Omit<Meal, 'id' | 'time'>) => void;
}

const DietPlanView: React.FC<DietPlanViewProps> = ({ addMealToToday }) => {
    const { userData } = useAppContext();
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [dietPlan, setDietPlan] = useState<GeneratedDietPlan | null>(null);
    const [savedDiets, setSavedDiets] = useState<GeneratedDietPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastAnswers, setLastAnswers] = useState<DietQuizAnswers | null>(null);
    const [loggedMeals, setLoggedMeals] = useState<string[]>([]);

    const generateDiet = async (answers: DietQuizAnswers) => {
        if (!userData) return;
        setIsLoading(true);
        setError(null);
        setDietPlan(null);
        setLoggedMeals([]);
        setLastAnswers(answers);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const schema = {
                type: Type.OBJECT,
                properties: {
                    meals: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, enum: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'] },
                                description: { type: Type.STRING },
                                quantity: { type: Type.STRING },
                                protein: { type: Type.NUMBER },
                                calories: { type: Type.NUMBER },
                            },
                            required: ['name', 'description', 'quantity', 'protein', 'calories']
                        }
                    },
                    tip: { type: Type.STRING }
                },
                required: ['meals', 'tip']
            };

            const prompt = `
                Você é um nutricionista especialista. Crie um plano alimentar de um dia para um usuário com as seguintes características:
                - Idade: ${userData.age}
                - Altura: ${userData.height} cm
                - Peso: ${userData.weight} kg
                - Sexo: ${userData.gender}
                - Nível de atividade: ${userData.activityLevel}
                - Usa o medicamento: ${userData.medication.name}
                - Objetivo de calorias diárias: ${userData.goals.calories} kcal
                - Objetivo de proteína diária: ${userData.goals.protein} g

                Respostas do quiz do usuário:
                - Apetite geral: ${answers.appetite}
                - Refeições por dia preferidas: ${answers.mealsPerDay}
                - Pula o café da manhã: ${answers.skipBreakfast ? 'Sim' : 'Não'}
                - Sente muita fome à noite: ${answers.nightHunger ? 'Sim' : 'Não'}
                - Restrições alimentares: ${answers.restrictions.join(', ') || 'Nenhuma'}
                - Ritmo de emagrecimento desejado: ${answers.pace}
                - Pratica treinos: ${answers.trains ? 'Sim' : 'Não'}

                Instruções:
                1. CRIE REFEIÇÕES SIMPLES, NUTRITIVAS E REALISTAS.
                2. Gere um plano com ${answers.mealsPerDay} refeições.
                3. A soma total de calorias e proteínas do plano deve ser muito próxima dos objetivos diários do usuário.
                4. Forneça uma dica final curta e personalizada.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                },
            });
            
            const plan = JSON.parse(response.text) as GeneratedDietPlan;
            setDietPlan(plan);

        } catch (e) {
            console.error(e);
            setError('Não foi possível gerar a dieta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogMealFromPlan = (meal: GeneratedDietPlan['meals'][0]) => {
        addMealToToday({
            name: meal.description,
            calories: meal.calories,
            protein: meal.protein,
        });
        setLoggedMeals(prev => [...prev, meal.description]);
    };

    const handleQuizComplete = (answers: DietQuizAnswers) => {
        setIsQuizOpen(false);
        generateDiet(answers);
    };

    const handleGenerateClick = () => {
        setIsQuizOpen(true);
    };

    const handleRegenerate = () => {
        if (lastAnswers) {
            generateDiet(lastAnswers);
        }
    }

    const handleSaveDiet = () => {
        if (dietPlan) {
            setSavedDiets(prev => [...prev, dietPlan]);
            setDietPlan(null); 
        }
    };
    
    const renderCurrentView = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-ios-card dark:bg-ios-dark-card rounded-[24px] shadow-soft">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin"></div>
                    <p className="mt-6 font-semibold text-gray-900 dark:text-white text-lg">Criando seu plano...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Nossa IA está analisando suas necessidades.</p>
                </div>
            )
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[24px]">
                    <p className="font-semibold text-red-700 dark:text-red-300">{error}</p>
                    <button onClick={handleRegenerate} className="mt-4 bg-black dark:bg-white text-white dark:text-black py-3 px-8 rounded-xl font-semibold shadow-lg">
                        Tentar Novamente
                    </button>
                </div>
            )
        }

        if (dietPlan) {
            return (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-1">Sugestão do Dia</h2>
                    {dietPlan.meals.map((meal, index) => {
                        const isLogged = loggedMeals.includes(meal.description);
                        return (
                            <div key={index} className="bg-ios-card dark:bg-ios-dark-card p-5 rounded-[20px] shadow-soft">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{meal.name}</h3>
                                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
                                        {meal.calories} kcal
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-[17px] leading-relaxed">{meal.description} ({meal.quantity})</p>
                                <p className="text-sm text-gray-400 mt-1">Proteína: {meal.protein}g</p>
                                
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleLogMealFromPlan(meal)}
                                        disabled={isLogged}
                                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                            isLogged
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-[0.98] shadow-md'
                                        }`}
                                    >
                                        {isLogged ? 'Refeição Registrada' : 'Registrar no Diário'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5 rounded-[20px]">
                        <p className="font-bold text-blue-800 dark:text-blue-300 text-sm uppercase tracking-wide mb-2">Dica do Nutricionista</p>
                        <p className="text-blue-900 dark:text-blue-200 text-lg leading-snug">{dietPlan.tip}</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleRegenerate} className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl font-semibold">Gerar Outra</button>
                        <button onClick={handleSaveDiet} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-semibold">Salvar Plano</button>
                    </div>
                </div>
            )
        }

        return (
             <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-[24px] text-center text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ClipboardListIcon className="w-8 h-8 text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Plano de Dieta Inteligente</h3>
                    <p className="text-blue-100 mb-8 text-lg">Receba um plano alimentar diário, personalizado pela nossa IA.</p>
                    <button onClick={handleGenerateClick} className="bg-white text-blue-600 py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform w-full">
                        Criar Plano Agora
                    </button>
                </div>
                 <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {renderCurrentView()}
            
            {savedDiets.length > 0 && (
                 <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-1">Minhas Dietas</h2>
                    {savedDiets.map((plan, index) => (
                        <div key={index} className="bg-ios-card dark:bg-ios-dark-card p-5 rounded-[20px] shadow-soft">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Opção #{index + 1}</h3>
                                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full uppercase tracking-wide">{plan.meals.length} refeições</span>
                            </div>
                            <div className="space-y-3">
                                {plan.meals.map((meal, mealIndex) => (
                                    <div key={mealIndex} className="flex justify-between items-center text-sm pb-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{meal.name}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{meal.calories} kcal</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
            )}

            {isQuizOpen && <DietQuiz onComplete={handleQuizComplete} onClose={() => setIsQuizOpen(false)} />}
        </div>
    );
};

const DIET_OPTIONS = [
    { name: 'Vegetariano', icon: '🧀', id: 'veg' },
    { name: 'Vegano', icon: '🌱', id: 'vegan' },
    { name: 'Low Carb', icon: '🥜', id: 'low-carb' },
    { name: 'Low Fat', icon: '🥒', id: 'low-fat' },
    { name: 'Low Cal', icon: '🍏', id: 'low-cal' },
    { name: 'Proteico', icon: '🍳', id: 'high-protein' },
    { name: 'Fibras', icon: '🍠', id: 'high-fiber' },
    { name: 'Clean', icon: '⚖️', id: 'clean' },
    { name: 'Keto', icon: '🥓', id: 'keto' },
    { name: 'Pescetariano', icon: '🐟', id: 'pesc' },
];

const DietSelector: React.FC = () => {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-1">Estilos de Dieta</h2>
            <div className="overflow-x-auto hide-scrollbar -mx-5 px-5">
                 <div className="grid grid-rows-2 grid-flow-col gap-3 w-max pb-4">
                    {DIET_OPTIONS.map((diet) => (
                        <button 
                            key={diet.id}
                            className="w-36 h-28 bg-ios-card dark:bg-ios-dark-card rounded-[20px] p-3 flex flex-col items-center justify-center text-center transition-all active:scale-95 shadow-soft"
                        >
                            <span className="text-3xl mb-2">{diet.icon}</span>
                            <span className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{diet.name}</span>
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const RecipesView: React.FC = () => {
    const calorieRanges = [
        { range: '< 100 kcal', icon: '🍉' },
        { range: '100-200 kcal', icon: '🥪' },
        { range: '200-300 kcal', icon: '🥯' },
        { range: '300-400 kcal', icon: '🥞' },
        { range: '400-500 kcal', icon: '🍛' },
        { range: '> 500 kcal', icon: '🍱' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-1">Por Calorias</h2>
                 <div className="grid grid-cols-2 gap-3">
                     {calorieRanges.map((item, index) => (
                         <button key={index} className="bg-ios-card dark:bg-ios-dark-card p-4 rounded-[20px] flex items-center gap-4 shadow-soft active:scale-95 transition-transform">
                             <span className="text-3xl">{item.icon}</span>
                             <span className="font-bold text-gray-900 dark:text-white">{item.range}</span>
                         </button>
                     ))}
                 </div>
            </div>

            <div className="pt-2">
                 <DietSelector />
            </div>
        </div>
    );
};


export const MealsTab: React.FC = () => {
  const { userData, meals, setMeals, quickAddProtein, updateStreak } = useAppContext();
  const [view, setView] = useState<'today' | 'plan' | 'recipes' | 'jejum'>('today');
  const [isCalorieCamOpen, setIsCalorieCamOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  if (!userData) return null;

  const totalCaloriesFromMeals = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProteinFromMeals = meals.reduce((sum, meal) => sum + meal.protein, 0);

  const quickAddCalories = (quickAddProtein / 5) * 20; 

  const totalCalories = totalCaloriesFromMeals + quickAddCalories;
  const totalProtein = totalProteinFromMeals + quickAddProtein;

  const handleCalorieCamClick = () => {
    setIsCalorieCamOpen(true);
  };

  const handleAddMeal = (newMealData: Omit<Meal, 'id' | 'time'>) => {
    const newMeal: Meal = {
        ...newMealData,
        id: new Date().toISOString(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMeals(prevMeals => [...prevMeals, newMeal]);
    updateStreak();
  };

  return (
    <div className="px-5 pb-24 animate-fade-in">
      <header className="pt-4 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Nutrição</h1>
      </header>

      {/* iOS Segmented Control */}
      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6 relative">
        {/* Animated Background Logic would go here in a full implementation, simplified for now */}
        {['today', 'plan', 'recipes', 'jejum'].map((v) => (
            <button 
                key={v}
                onClick={() => setView(v as any)} 
                className={`flex-1 py-2 rounded-lg font-semibold text-[13px] transition-all duration-200 ${
                    view === v 
                    ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
            >
                {v === 'today' ? 'Hoje' : v === 'plan' ? 'Plano' : v === 'recipes' ? 'Receitas' : 'Jejum'}
            </button>
        ))}
      </div>

      {view === 'today' && (
        <div className="space-y-6">
            <div className="bg-ios-card dark:bg-ios-dark-card p-6 rounded-[24px] shadow-soft space-y-6">
                <ProgressIndicator label="Calorias" value={totalCalories} goal={userData.goals.calories} unit="kcal" color="#f97316"/>
                <ProgressIndicator label="Proteína" value={totalProtein} goal={userData.goals.protein} unit="g" color="#3b82f6"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsManualModalOpen(true)} className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-[20px] font-bold text-[17px] text-center active:scale-95 transition-transform shadow-lg">
                    Registrar
                </button>
                <button onClick={handleCalorieCamClick} className="bg-ios-card dark:bg-ios-dark-card text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 p-4 rounded-[20px] font-bold text-[17px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm">
                    <CameraIcon className="w-5 h-5 text-blue-500"/>
                    <span>CalorieCam</span>
                </button>
            </div>
            
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-1">Refeições de Hoje</h2>
                <div className="space-y-3">
                    {meals.length > 0 ? meals.map(meal => <MealItem key={meal.id} meal={meal} />) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-[24px] border border-dashed border-gray-200 dark:border-gray-800">
                            <p className="text-gray-400 dark:text-gray-500 font-medium">Nenhuma refeição registrada hoje.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
      
      {view === 'plan' && (
        <DietPlanView addMealToToday={handleAddMeal} />
      )}
      
      {view === 'recipes' && (
        <RecipesView />
      )}

      {view === 'jejum' && (
        <FastingView />
      )}

      {isCalorieCamOpen && (
        <CalorieCamModal
            onClose={() => setIsCalorieCamOpen(false)}
            onAddMeal={handleAddMeal}
        />
      )}
      {isManualModalOpen && (
        <ManualMealModal
            onClose={() => setIsManualModalOpen(false)}
            onAddMeal={handleAddMeal}
        />
      )}
    </div>
  );
};
