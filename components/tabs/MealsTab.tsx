
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { FlameIcon, UtensilsIcon, AppleIcon, PlusIcon, LockIcon, RefrigeratorIcon, SparklesIcon, ClockIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import type { Meal } from '../../types';
import { ManualMealModal } from './ManualMealModal';
import { CalorieCamModal } from './CalorieCamModal';
import { DietQuiz } from './DietQuiz';
import { FastingView } from './FastingView';
import { SubscriptionPage } from '../SubscriptionPage';
import { ProFeatureModal } from '../ProFeatureModal';
import { PantryChefModal } from './PantryChefModal';
import { RecipeDetailModal } from './RecipeDetailModal';
import { RECIPES_DATABASE, Recipe } from './recipesData';

// --- Today View ---
const TodayView: React.FC<{ onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void }> = ({ onAddMeal }) => {
    const { meals, userData, unlockPro } = useAppContext();
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isCalorieCamOpen, setIsCalorieCamOpen] = useState(false);
    
    // Pro Features Logic
    const [showProModal, setShowProModal] = useState(false);
    const [showSubPage, setShowSubPage] = useState(false);
    const [pendingAction, setPendingAction] = useState<'calorieCam' | null>(null);

    const handleCalorieCamClick = () => {
        if (userData?.isPro) {
            setIsCalorieCamOpen(true);
        } else {
            setPendingAction('calorieCam');
            setShowProModal(true);
        }
    };

    const handleUnlock = () => {
        setShowProModal(false);
        setShowSubPage(true);
    };

    const handleSubscribe = () => {
        unlockPro();
        setShowSubPage(false);
        if (pendingAction === 'calorieCam') {
            setIsCalorieCamOpen(true);
        }
        setPendingAction(null);
    };

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    
    return (
        <div className="px-5 py-6 space-y-6 animate-fade-in">
            <div className="bg-black dark:bg-white text-white dark:text-black rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">Consumido Hoje</p>
                        <h2 className="text-4xl font-bold mt-1">{totalCalories} <span className="text-lg font-medium opacity-70">kcal</span></h2>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">Meta</p>
                        <p className="text-xl font-bold mt-1">{userData?.goals.calories}</p>
                    </div>
                </div>
                <div className="w-full bg-white/20 dark:bg-black/10 h-2 rounded-full mt-6 overflow-hidden">
                    <div className="bg-white dark:bg-black h-full rounded-full" style={{width: `${Math.min((totalCalories / (userData?.goals.calories || 2000)) * 100, 100)}%`}}></div>
                </div>
                <div className="mt-4 flex gap-4 text-sm font-medium opacity-90">
                    <span className="flex items-center gap-1.5"><FlameIcon className="w-4 h-4" /> {totalProtein}g Proteína</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={handleCalorieCamClick} className="bg-blue-500 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1s_infinite]"></div>
                    {!userData?.isPro && <div className="absolute top-2 right-2 bg-white text-blue-500 text-[10px] px-1.5 rounded font-bold shadow-sm flex items-center gap-1"><LockIcon className="w-2.5 h-2.5"/> PRO</div>}
                    <div className="bg-white/20 p-2 rounded-full"><UtensilsIcon className="w-6 h-6" /></div>
                    <span>CalorieCam</span>
                </button>
                <button onClick={() => setIsManualModalOpen(true)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-full"><PlusIcon className="w-6 h-6" /></div>
                    <span>Manual</span>
                </button>
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Refeições de Hoje</h3>
                {meals.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>Nenhuma refeição registrada hoje.</p>
                    </div>
                ) : (
                    meals.map((meal, index) => (
                        <div key={index} className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{meal.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{meal.time} • {meal.protein}g proteína</p>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">{meal.calories} kcal</span>
                        </div>
                    ))
                )}
            </div>

            {isManualModalOpen && <ManualMealModal onClose={() => setIsManualModalOpen(false)} onAddMeal={onAddMeal} />}
            {isCalorieCamOpen && <CalorieCamModal onClose={() => setIsCalorieCamOpen(false)} onAddMeal={onAddMeal} />}
            
            {showProModal && (
                <ProFeatureModal 
                    title="CalorieCam"
                    onClose={() => setShowProModal(false)}
                    onUnlock={handleUnlock}
                />
            )}
            {showSubPage && (
                <SubscriptionPage 
                    onClose={() => setShowSubPage(false)}
                    onSubscribe={handleSubscribe}
                />
            )}
        </div>
    );
};

// --- Recipes View ---
const RecipesView: React.FC<{ onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void }> = ({ onAddMeal }) => {
    const { userData, unlockPro } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isPantryOpen, setIsPantryOpen] = useState(false);
    
    // Pro
    const [showProModal, setShowProModal] = useState(false);
    const [showSubPage, setShowSubPage] = useState(false);

    const categories = [
        { id: 'all', label: 'Tudo' },
        { id: 'breakfast', label: 'Café' },
        { id: 'lunch', label: 'Almoço' },
        { id: 'dinner', label: 'Jantar' },
        { id: 'snack', label: 'Lanches' },
        { id: 'dessert', label: 'Doces' },
        { id: 'drink', label: 'Bebidas' },
    ];

    const filteredRecipes = selectedCategory === 'all' 
        ? RECIPES_DATABASE 
        : RECIPES_DATABASE.filter(r => r.category === selectedCategory);

    const handlePantryClick = () => {
        if (userData?.isPro) {
            setIsPantryOpen(true);
        } else {
            setShowProModal(true);
        }
    };

    const handleUnlock = () => {
        setShowProModal(false);
        setShowSubPage(true);
    };

    const handleSubscribe = () => {
        unlockPro();
        setShowSubPage(false);
        setIsPantryOpen(true);
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in px-5 py-6">
            <button 
                onClick={handlePantryClick}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-[24px] shadow-lg shadow-blue-500/20 flex items-center justify-between active:scale-95 transition-transform relative overflow-hidden"
            >
                <div className="flex items-center gap-4 z-10">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                        <RefrigeratorIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-lg">Chef de Geladeira</h3>
                        <p className="text-xs text-blue-100 font-medium">Crie receitas com o que você tem</p>
                    </div>
                </div>
                <div className="bg-white/20 p-2 rounded-full z-10">
                    {!userData?.isPro ? <LockIcon className="w-4 h-4"/> : <SparklesIcon className="w-4 h-4" />}
                </div>
            </button>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                            selectedCategory === cat.id 
                                ? 'bg-black dark:bg-white text-white dark:text-black' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {filteredRecipes.map(recipe => (
                    <div 
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition-transform cursor-pointer"
                    >
                        <div className="h-32 w-full relative">
                            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" /> {recipe.prepTime}
                            </div>
                        </div>
                        <div className="p-3">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{recipe.name}</h4>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><FlameIcon className="w-3 h-3 text-orange-500"/> {recipe.calories}</span>
                                <span className="flex items-center gap-1"><UtensilsIcon className="w-3 h-3 text-blue-500"/> {recipe.protein}g</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRecipe && (
                <RecipeDetailModal 
                    recipe={selectedRecipe} 
                    onClose={() => setSelectedRecipe(null)} 
                    onAddLog={onAddMeal} 
                />
            )}

            {isPantryOpen && (
                <PantryChefModal 
                    onClose={() => setIsPantryOpen(false)}
                    onSelectRecipe={(r) => setSelectedRecipe(r)}
                />
            )}

            {showProModal && (
                <ProFeatureModal 
                    title="Chef de Geladeira"
                    onClose={() => setShowProModal(false)}
                    onUnlock={handleUnlock}
                />
            )}
            {showSubPage && (
                <SubscriptionPage 
                    onClose={() => setShowSubPage(false)}
                    onSubscribe={handleSubscribe}
                />
            )}
        </div>
    );
};

// --- Diet View ---
const DietView: React.FC = () => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    
    // Logic for diet view (showing current plan or prompting to generate)
    // For now, let's keep it simple as an intro to the feature
    
    return (
        <div className="px-5 py-6 space-y-6 animate-fade-in">
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AppleIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nutricionista IA</h3>
                <p className="text-gray-500 dark:text-gray-400 px-6 mb-6">
                    Receba um plano alimentar personalizado baseado no seu metabolismo, gostos e rotina com GLP-1.
                </p>
                <button 
                    onClick={() => setIsQuizOpen(true)}
                    className="bg-black dark:bg-white text-white dark:text-black py-3 px-8 rounded-xl font-bold active:scale-95 transition-transform"
                >
                    Gerar Minha Dieta
                </button>
            </div>

            {isQuizOpen && (
                <DietQuiz 
                    onComplete={(answers) => {
                        console.log(answers);
                        setIsQuizOpen(false);
                        // Here we would call AI to generate diet
                    }} 
                    onClose={() => setIsQuizOpen(false)} 
                />
            )}
        </div>
    );
};

export const MealsTab: React.FC = () => {
  const { userData, setMeals, updateStreak } = useAppContext();
  const [activeTab, setActiveTab] = useState<'today' | 'recipes' | 'fasting' | 'diet'>('today');

  if (!userData) return null;

  const handleAddMeal = (newMealData: Omit<Meal, 'id' | 'time'>) => {
    const newMeal: Meal = {
        ...newMealData,
        id: new Date().toISOString() + Math.random(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMeals(prevMeals => [...prevMeals, newMeal]);
    updateStreak();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-24">
      <header className="px-5 pt-4 flex justify-between items-start">
        <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Nutrição</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Gerencie sua alimentação</p>
        </div>
        <StreakBadge />
      </header>

      <div className="px-5 mt-6 mb-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button onClick={() => setActiveTab('today')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'today' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Hoje</button>
              <button onClick={() => setActiveTab('recipes')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'recipes' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Receitas</button>
              <button onClick={() => setActiveTab('fasting')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'fasting' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Jejum</button>
              <button onClick={() => setActiveTab('diet')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'diet' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Plano</button>
          </div>
      </div>

      {activeTab === 'today' && <TodayView onAddMeal={handleAddMeal} />}
      {activeTab === 'recipes' && <RecipesView onAddMeal={handleAddMeal} />}
      {activeTab === 'fasting' && <FastingView />}
      {activeTab === 'diet' && <DietView />}
    </div>
  );
};
