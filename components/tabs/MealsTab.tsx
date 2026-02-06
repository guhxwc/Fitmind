
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { FlameIcon, UtensilsIcon, AppleIcon, CoffeeIcon, SoupIcon, PlusIcon } from '../core/Icons';
import type { Meal } from '../../types';
import { ManualMealModal } from './ManualMealModal';
import { CalorieCamModal } from './CalorieCamModal';
import { DietQuiz } from './DietQuiz';
import { FastingView } from './FastingView';
import { SubscriptionPage } from '../SubscriptionPage';
import { ProFeatureModal } from '../ProFeatureModal';

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
                <button onClick={handleCalorieCamClick} className="bg-blue-500 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform relative overflow-hidden">
                    {!userData?.isPro && <div className="absolute top-2 right-2 bg-white text-blue-500 text-[10px] px-1.5 rounded font-bold">PRO</div>}
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
                                <p className="text-xs text-gray-500 mt-0.5">{meal.time}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">{meal.calories} kcal</p>
                                <p className="text-xs text-blue-500 font-medium">{meal.protein}g prot</p>
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
const DietPlanView: React.FC = () => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const { userData } = useAppContext();

    return (
        <div className="px-5 py-6 space-y-6 animate-fade-in min-h-screen">
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seu Plano Nutricional</h2>
                <p className="text-gray-500 dark:text-gray-400">Personalizado por IA para {userData?.name}</p>
             </div>

             <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 border border-green-100 dark:border-gray-700 p-6 rounded-3xl text-center shadow-sm">
                 <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
                     🥗
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Plano Flexível GLP-1</h3>
                 <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                     Focado em proteínas e fibras para maximizar a saciedade e minimizar efeitos colaterais da medicação.
                 </p>
                 <button onClick={() => setIsQuizOpen(true)} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                     Refazer Quiz de Dieta
                 </button>
             </div>

             <div className="space-y-4">
                 <h3 className="font-bold text-gray-900 dark:text-white px-1">Recomendações Diárias</h3>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                     <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600 dark:text-orange-400"><CoffeeIcon /></div>
                     <div>
                         <p className="font-bold text-gray-900 dark:text-white">Café da Manhã</p>
                         <p className="text-xs text-gray-500">Ovos mexidos com espinafre</p>
                     </div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                     <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl text-yellow-600 dark:text-yellow-400"><SoupIcon /></div>
                     <div>
                         <p className="font-bold text-gray-900 dark:text-white">Almoço</p>
                         <p className="text-xs text-gray-500">Frango grelhado e salada</p>
                     </div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                     <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-green-600 dark:text-green-400"><AppleIcon /></div>
                     <div>
                         <p className="font-bold text-gray-900 dark:text-white">Lanche</p>
                         <p className="text-xs text-gray-500">Iogurte natural com frutas</p>
                     </div>
                 </div>
             </div>

             {isQuizOpen && (
                 <DietQuiz 
                    onComplete={() => setIsQuizOpen(false)} 
                    onClose={() => setIsQuizOpen(false)} 
                 />
             )}
        </div>
    )
}

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
      <div className="px-4 pt-4 pb-2 sticky top-0 z-30 bg-ios-bg/95 dark:bg-black/95 backdrop-blur-xl">
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