
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { FlameIcon, DietIcon, AppleIcon, CoffeeIcon, LunchIcon, PlusIcon, LockIcon, HeartIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import type { Meal } from '../../types';
import { ManualMealModal } from './ManualMealModal';
import { CalorieCamModal } from './CalorieCamModal';
import { DietQuiz } from './DietQuiz';
import { FastingView } from './FastingView';
import { SubscriptionPage } from '../SubscriptionPage';
import { ProFeatureModal } from '../ProFeatureModal';
import { supabase } from '../../supabaseClient';
import { useToast } from '../ToastProvider';

import { DietPlanView } from './diet/DietPlanView';

// --- Today View ---
const TodayView: React.FC<{ onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void }> = ({ onAddMeal }) => {
    const { meals, userData, unlockPro, targetMacros } = useAppContext();
    const { addToast } = useToast();
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

    const handleFavorite = async (meal: Meal) => {
        if (!userData) return;
        try {
            const { error } = await supabase.from('favorite_meals').insert({
                user_id: userData.id,
                name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                type: meal.type || 'Lanche'
            });
            if (error) throw error;
            addToast("Refeição salva nos favoritos!", "success");
        } catch (error) {
            console.error("Error saving favorite:", error);
            addToast("Erro ao salvar favorito.", "error");
        }
    };

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    
    return (
        <div className="px-5 py-6 space-y-6 animate-fade-in">
            <div className="bg-black dark:bg-white text-white dark:text-black rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">Consumido Hoje</p>
                        <h2 className="text-4xl font-bold mt-1">{Math.round(totalCalories)} <span className="text-lg font-medium opacity-70">kcal</span></h2>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">Meta</p>
                        <p className="text-xl font-bold mt-1">
                            {targetMacros?.calories}
                        </p>
                    </div>
                </div>
                <div className="w-full bg-white/20 dark:bg-black/10 h-2 rounded-full mt-6 overflow-hidden">
                    <div className="bg-white dark:bg-black h-full rounded-full" style={{width: `${Math.min((totalCalories / (targetMacros?.calories || 2000)) * 100, 100)}%`}}></div>
                </div>
                <div className="mt-4 flex gap-4 text-sm font-medium opacity-90">
                    <span className="flex items-center gap-1.5"><FlameIcon className="w-4 h-4" /> {Math.round(totalProtein)}g / {targetMacros?.protein}g Proteína</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button id="tour-calorie-cam" onClick={handleCalorieCamClick} className="bg-blue-500 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1s_infinite]"></div>
                    {!userData?.isPro && <div className="absolute top-2 right-2 bg-white text-blue-500 text-[10px] px-1.5 rounded font-bold shadow-sm flex items-center gap-1"><LockIcon className="w-2.5 h-2.5"/> PRO</div>}
                    <div className="bg-white/20 p-2 rounded-full"><DietIcon className="w-6 h-6" /></div>
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
                                <p className="text-xs text-gray-500 mt-0.5">{meal.time}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">{Math.round(meal.calories)} kcal</p>
                                    <p className="text-xs text-blue-500 font-medium">{Math.round(meal.protein)}g prot</p>
                                </div>
                                <button 
                                    onClick={() => handleFavorite(meal)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors active:scale-95"
                                    title="Salvar nos favoritos"
                                >
                                    <HeartIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isManualModalOpen && (
                <ManualMealModal
                    onClose={() => setIsManualModalOpen(false)}
                    onAddMeal={onAddMeal}
                />
            )}
            {isCalorieCamOpen && (
                <CalorieCamModal 
                    onClose={() => setIsCalorieCamOpen(false)}
                    onAddMeal={onAddMeal}
                />
            )}
            
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
    )
}

// --- Diet Plan View ---
// The DietPlanView component has been moved to ./diet/DietPlanView.tsx

// --- Main Component ---

export const MealsTab: React.FC = () => {
  const { setMeals, updateStreak } = useAppContext();
  const [activeView, setActiveView] = useState<'today' | 'fasting' | 'diet'>('today');

  const handleAddMeal = (newMealData: Omit<Meal, 'id' | 'time'>) => {
    const newMeal: Meal = {
        ...newMealData,
        id: new Date().toISOString(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMeals(prevMeals => [...prevMeals, newMeal]);
    updateStreak();
  };

  const navItems = [
      { id: 'today', label: 'Hoje' },
      { id: 'fasting', label: 'Jejum' },
      { id: 'diet', label: 'Dieta' },
  ];

  return (
    <div className="pb-24 min-h-screen bg-ios-bg dark:bg-black animate-fade-in flex flex-col">
      
      {/* Top Rounded Navigation */}
      <div id="tour-diet-main" className="px-4 pt-4 pb-2 sticky top-0 z-30 bg-ios-bg/95 dark:bg-black/95 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white pl-2">Alimentação</h1>
              <StreakBadge />
          </div>
          <div className="flex p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full relative">
              {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-300 z-10 ${activeView === item.id ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm scale-[1.02]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                  >
                      {item.label}
                  </button>
              ))}
          </div>
      </div>

      <div className="flex-grow">
        {activeView === 'today' && <TodayView onAddMeal={handleAddMeal} />}
        {activeView === 'fasting' && <FastingView />}
        {activeView === 'diet' && <DietPlanView />}
      </div>

    </div>
  );
};
