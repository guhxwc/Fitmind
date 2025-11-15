import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { UserData, Meal, DietQuizAnswers, GeneratedDietPlan } from '../../types';
import { FlameIcon, CameraIcon, ClipboardListIcon } from '../core/Icons';
import { DietQuiz } from './DietQuiz';
import { CalorieCamModal } from './CalorieCamModal';
import { useAppContext } from '../AppContext';
import { ManualMealModal } from './ManualMealModal';


const MealItem: React.FC<{ meal: Meal }> = ({ meal }) => (
  <div className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl flex items-center justify-between">
    <div>
      <p className="font-bold text-gray-800 dark:text-gray-200">{meal.name}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-800 dark:text-gray-200">{meal.calories} kcal</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{meal.protein}g proteína</p>
    </div>
  </div>
);

const ProgressIndicator: React.FC<{ label: string; value: number; goal: number; unit: string; color: string }> = ({ label, value, goal, unit, color }) => {
    const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    return (
        <div className="flex-1">
            <div className="flex justify-between items-baseline mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(value)} / {goal} {unit}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
            </div>
        </div>
    );
};

interface DietPlanViewProps {
  onShowProModal: (type: 'feature' | 'engagement', title?: string) => void;
  addMealToToday: (meal: Omit<Meal, 'id' | 'time'>) => void;
}

const DietPlanView: React.FC<DietPlanViewProps> = ({ onShowProModal, addMealToToday }) => {
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
        setLoggedMeals([]); // Reset logged meals for the new plan
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
                1. CRIE REFEIÇÕES SIMPLES, NUTRITIVAS E REALISTAS, com ingredientes comuns e fáceis de encontrar em um lar brasileiro (ex: pão com ovo, arroz, feijão, frango grelhado, salada de alface e tomate, banana, mamão, iogurte). Evite pratos complexos, gourmet ou com ingredientes difíceis de encontrar. O objetivo é ser prático e sustentável.
                2. Gere um plano com ${answers.mealsPerDay} refeições. Se o usuário sente fome à noite, inclua uma ceia.
                3. A soma total de calorias e proteínas do plano deve ser muito próxima dos objetivos diários do usuário.
                4. Para cada refeição, forneça uma descrição, quantidade estimada, gramas de proteína e calorias aproximadas.
                5. Forneça uma dica final curta e personalizada com base nas respostas do quiz (ex: se pula café, a dica foca na manhã; se tem fome à noite, foca na noite).
                6. Respeite as restrições alimentares mencionadas.
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
        if (userData?.isPro) {
            setIsQuizOpen(true);
        } else {
            onShowProModal('feature', 'Plano de Dieta com IA');
        }
    };

    const handleRegenerate = () => {
        if (lastAnswers) {
            generateDiet(lastAnswers);
        }
    }

    const handleSaveDiet = () => {
        if (dietPlan) {
            setSavedDiets(prev => [...prev, dietPlan]);
            setDietPlan(null); // Reset view to allow generating a new one
        }
    };
    
    const renderCurrentView = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-300">Gerando sua dieta personalizada...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aguarde, estamos montando o plano ideal para você.</p>
                </div>
            )
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl">
                    <p className="font-semibold text-red-700 dark:text-red-300">{error}</p>
                    <button onClick={handleRegenerate} className="mt-4 bg-black dark:bg-white text-white dark:text-black py-2 px-6 rounded-lg font-semibold">
                        Tentar Novamente
                    </button>
                </div>
            )
        }

        if (dietPlan) {
            return (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Sugestão de Dieta da IA</h2>
                    {dietPlan.meals.map((meal, index) => {
                        const isLogged = loggedMeals.includes(meal.description);
                        return (
                            <div key={index} className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{meal.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Proteína: {meal.protein}g · {meal.calories} kcal</p>
                                <p className="mt-2 text-gray-700 dark:text-gray-300">{meal.description} ({meal.quantity})</p>
                                <div className="mt-3 pt-3 border-t border-gray-200/80 dark:border-gray-700/80">
                                    <button
                                        onClick={() => handleLogMealFromPlan(meal)}
                                        disabled={isLogged}
                                        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                            isLogged
                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98]'
                                        }`}
                                    >
                                        {isLogged ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                Registrado
                                            </>
                                        ) : 'Registrar Refeição'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                        <p className="font-semibold text-blue-800 dark:text-blue-300">💡 Dica da IA</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{dietPlan.tip}</p>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button onClick={handleRegenerate} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold">Gerar Novamente</button>
                        <button onClick={handleSaveDiet} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold">Salvar Dieta</button>
                    </div>
                </div>
            )
        }

        return (
             <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-6 rounded-2xl text-center">
                <ClipboardListIcon className="w-10 h-10 mx-auto text-blue-600 dark:text-blue-400 mb-3"/>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200">Plano de Dieta Inteligente</h3>
                <p className="text-blue-700 dark:text-blue-300 mt-1 mb-4">Receba um plano alimentar diário, personalizado pela nossa IA para atingir suas metas.</p>
                <button onClick={handleGenerateClick} className="bg-black dark:bg-white text-white dark:text-black py-3 px-8 rounded-xl font-semibold transition-transform active:scale-[0.98]">
                    Gerar sua dieta
                </button>
            </div>
        )
    }


    return (
        <div className="space-y-6">
            {renderCurrentView()}
            
            {savedDiets.length > 0 && (
                 <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Minhas Dietas</h2>
                    {savedDiets.map((plan, index) => (
                        <div key={index} className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Dieta Salva #{index + 1}</h3>
                                <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{plan.meals.length} refeições</span>
                            </div>
                            {plan.meals.map((meal, mealIndex) => (
                                <div key={mealIndex} className="text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{meal.name} <span className="font-normal text-gray-500 dark:text-gray-400">({meal.calories} kcal)</span></p>
                                    <p className="text-gray-600 dark:text-gray-300">{meal.description}</p>
                                </div>
                            ))}
                            <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 p-3 mt-3 rounded-lg">
                                <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">💡 Dica</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{plan.tip}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

            {isQuizOpen && <DietQuiz onComplete={handleQuizComplete} onClose={() => setIsQuizOpen(false)} />}
        </div>
    );
};

interface MealsTabProps {
  onShowProModal: (type: 'feature' | 'engagement', title?: string) => void;
}

export const MealsTab: React.FC<MealsTabProps> = ({ onShowProModal }) => {
  const { userData, meals, setMeals, quickAddProtein, updateStreak } = useAppContext();
  const [view, setView] = useState<'today' | 'plan'>('today');
  const [isCalorieCamOpen, setIsCalorieCamOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  if (!userData) return null;

  const totalCaloriesFromMeals = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProteinFromMeals = meals.reduce((sum, meal) => sum + meal.protein, 0);

  const quickAddCalories = (quickAddProtein / 5) * 20; // 5g protein = 20 kcal

  const totalCalories = totalCaloriesFromMeals + quickAddCalories;
  const totalProtein = totalProteinFromMeals + quickAddProtein;

  const handleCalorieCamClick = () => {
    if (userData.isPro) {
        setIsCalorieCamOpen(true);
    } else {
        onShowProModal('feature', 'CalorieCam');
    }
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white dark:bg-black min-h-screen animate-fade-in">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Refeições</h1>
        <p className="text-gray-500 dark:text-gray-400">Seu diário alimentar</p>
      </header>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button onClick={() => setView('today')} className={`w-1/2 py-2 rounded-lg font-semibold transition-all active:scale-[0.98] ${view === 'today' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}>Hoje</button>
        <button onClick={() => setView('plan')} className={`w-1/2 py-2 rounded-lg font-semibold transition-all active:scale-[0.98] ${view === 'plan' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}>Plano de Dieta</button>
      </div>

      {view === 'today' && (
        <div className="space-y-6">
            <div className="bg-gray-100/50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-4">
                <ProgressIndicator label="Calorias" value={totalCalories} goal={userData.goals.calories} unit="kcal" color="#f97316"/>
                <ProgressIndicator label="Proteína" value={totalProtein} goal={userData.goals.protein} unit="g" color="#3b82f6"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsManualModalOpen(true)} className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-xl font-semibold text-center transition-transform active:scale-[0.98]">
                    Registrar Manual
                </button>
                <button onClick={handleCalorieCamClick} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]">
                    <CameraIcon className="w-5 h-5"/>
                    <span>CalorieCam</span>
                    <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">PRO</span>
                </button>
            </div>
            
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Refeições de Hoje</h2>
                <div className="space-y-3">
                    {meals.length > 0 ? meals.map(meal => <MealItem key={meal.id} meal={meal} />) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma refeição registrada hoje.</p>}
                </div>
            </div>
        </div>
      )}
      
      {view === 'plan' && (
        <DietPlanView onShowProModal={onShowProModal} addMealToToday={handleAddMeal} />
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