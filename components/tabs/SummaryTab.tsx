
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { WaterDropIcon, FlameIcon, LeafIcon, EditIcon, CoffeeIcon, SoupIcon, UtensilsIcon, AppleIcon, PlusIcon, MinusIcon, SparklesIcon, SyringeIcon, ChevronRightIcon, LockIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import { ManualMealModal } from './ManualMealModal';
import { SmartLogModal } from '../SmartLogModal';
import { ProFeatureModal } from '../ProFeatureModal';
import { SubscriptionPage } from '../SubscriptionPage';
import type { Meal } from '../../types';

const DonutCard: React.FC<{ icon: React.ReactNode; title: string; value: number; goal: number; unit: string; color: string; accentColor: string }> = ({ icon, title, value, goal, unit, color, accentColor }) => {
  const data = [
    { name: 'completed', value: value, color: color },
    { name: 'remaining', value: Math.max(0, goal - value), color: 'rgba(229, 229, 234, 0.5)' }, // lighter gray for track 
  ];
  
  return (
    <div className="bg-ios-card dark:bg-ios-dark-card p-5 rounded-[24px] shadow-soft flex flex-col items-center justify-between h-full relative overflow-hidden transition-transform active:scale-[0.98] duration-200">
      <div className="w-full flex justify-between items-center mb-2">
          <span className={`text-xs font-bold uppercase tracking-widest ${accentColor} opacity-90`}>{title}</span>
          <div className={`p-1.5 rounded-full bg-opacity-10 ${accentColor.replace('text-', 'bg-')}`}>
             {React.cloneElement(icon as React.ReactElement<any>, { className: `w-3.5 h-3.5 ${accentColor}` })}
          </div>
      </div>
      
      <div className="relative h-32 w-32 flex-grow flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
                data={data} 
                cx="50%" 
                cy="50%" 
                dataKey="value" 
                innerRadius={45} 
                outerRadius={55} 
                startAngle={90} 
                endAngle={-270} 
                paddingAngle={0} 
                cornerRadius={10}
                stroke="none"
            >
              {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 1 && document.documentElement.classList.contains('dark') ? '#2C2C2E' : entry.color} />))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{unit === 'L' ? value.toFixed(1) : value}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">de {goal}</span>
        </div>
      </div>
    </div>
  );
};

const MiniControlButton: React.FC<{onClick: () => void, children: React.ReactNode, disabled?: boolean}> = ({onClick, children, disabled = false}) => (
    <button 
      type="button"
      onClick={!disabled ? onClick : undefined} 
      className={`flex-1 h-11 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-900 dark:text-white transition-all active:scale-95 shadow-sm ${disabled ? 'opacity-30 cursor-not-allowed' : '' }`}
      disabled={disabled}
    >
      {children}
    </button>
);

const MealCard: React.FC<{ icon: React.ReactNode, title: string, calories: number, goal: number, onAdd: () => void, color: string, bgClass: string }> = ({ icon, title, calories, goal, onAdd, color, bgClass }) => (
    <div className="bg-ios-card dark:bg-ios-dark-card p-4 rounded-[24px] shadow-soft mb-3 flex items-center justify-between border border-gray-100 dark:border-white/5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-4 flex-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${bgClass} text-white`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-end mb-1 pr-4">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white leading-none">{title}</h4>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className={`text-sm font-bold ${color}`}>{calories}</span> / {goal} kcal
                    </p>
                </div>
                <div className="w-full pr-4">
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${bgClass.replace('bg-', 'bg-')}`} // Use dynamic bg
                            style={{ width: `${Math.min((calories/goal)*100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        <button onClick={onAdd} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-90 border border-gray-200 dark:border-gray-700">
            <PlusIcon className="w-5 h-5" />
        </button>
    </div>
);

const WeightCard: React.FC = () => {
    const { userData, setUserData, setWeightHistory } = useAppContext();
    const debounceTimer = useRef<number | null>(null);

    if (!userData) return null;

    const handleWeightUpdate = (change: number) => {
        const currentWeight = userData.weight;
        const newWeight = parseFloat((currentWeight + change).toFixed(1));

        setUserData(prev => prev ? ({ ...prev, weight: newWeight }) : null);
        
        const todayStr = new Date().toISOString().split('T')[0];
        setWeightHistory(prev => {
            const existingEntryIndex = prev.findIndex(w => w.date.startsWith(todayStr));
            if (existingEntryIndex > -1) {
                const updatedHistory = [...prev];
                updatedHistory[existingEntryIndex] = { ...updatedHistory[existingEntryIndex], weight: newWeight };
                return updatedHistory;
            } else {
                return [{ id: -1, user_id: userData.id, date: new Date().toISOString(), weight: newWeight }, ...prev];
            }
        });

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = window.setTimeout(async () => {
            try {
                await supabase.from('profiles').update({ weight: newWeight }).eq('id', userData.id);
                 await supabase
                    .from('weight_history')
                    .insert({ user_id: userData.id, date: new Date().toISOString(), weight: newWeight });

            } catch (error) {
                console.error("Failed to update weight in DB:", error);
            }
        }, 1000);
    };

    return (
        <div className="bg-ios-card dark:bg-ios-dark-card p-6 rounded-[24px] shadow-soft flex flex-col items-center text-center">
             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 w-full text-left">Controle de Peso</h3>
             <div className="flex items-center justify-between w-full mb-6">
                 <button onClick={() => handleWeightUpdate(-0.1)} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center active:scale-90 transition-transform">
                     <MinusIcon className="w-6 h-6" />
                 </button>
                 
                 <div>
                     <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tighter">{userData.weight.toFixed(1).replace('.', ',')}</span>
                     <span className="text-base font-semibold text-gray-400 ml-1">kg</span>
                 </div>

                 <button onClick={() => handleWeightUpdate(0.1)} className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center active:scale-90 transition-transform shadow-lg">
                     <PlusIcon className="w-6 h-6" />
                 </button>
             </div>
             <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(((userData.weight - userData.targetWeight) / userData.weight) * 100, 100)}%`}}></div>
             </div>
             <div className="flex justify-between w-full mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                 <span>Atual</span>
                 <span>Meta: {userData.targetWeight}kg</span>
             </div>
        </div>
    )
}

export const SummaryTab: React.FC = () => {
  const { userData, meals, setMeals, updateStreak, quickAddProtein, setQuickAddProtein, currentWater, setCurrentWater, unlockPro } = useAppContext();
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isSmartLogOpen, setIsSmartLogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  
  // Pro Features Logic
  const [showProModal, setShowProModal] = useState(false);
  const [showSubPage, setShowSubPage] = useState(false);

  if (!userData) return null;
  
  const totalProteinFromMeals = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalProtein = totalProteinFromMeals + quickAddProtein;

  const handleAddProtein = () => setQuickAddProtein(p => p + 5);
  const handleRemoveProtein = () => setQuickAddProtein(p => Math.max(0, p - 5));
  
  const openAddMeal = (type: string) => {
      setSelectedMealType(type);
      setIsMealModalOpen(true);
  };

  const handleSmartLogClick = () => {
      if (userData.isPro) {
          setIsSmartLogOpen(true);
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
      setIsSmartLogOpen(true); // Open what they wanted
  };

  const handleAddMeal = (newMealData: Omit<Meal, 'id' | 'time'>) => {
    const newMeal: Meal = {
        ...newMealData,
        id: new Date().toISOString(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMeals(prevMeals => [...prevMeals, newMeal]);
    updateStreak();
    setIsMealModalOpen(false);
  };

  const getMealStats = (startTime: number, endTime: number) => {
      const filteredMeals = meals.filter(m => {
          const hour = parseInt(m.time.split(':')[0], 10);
          return hour >= startTime && hour < endTime;
      });
      return filteredMeals.reduce((sum, m) => sum + m.calories, 0);
  };

  const breakfastCals = getMealStats(5, 11);
  const lunchCals = getMealStats(11, 15);
  const snackCals = getMealStats(15, 18) + getMealStats(0, 5) + getMealStats(22, 24);
  const dinnerCals = getMealStats(18, 22);

  const dailyGoal = userData.goals.calories;
  const breakfastGoal = Math.round(dailyGoal * 0.20);
  const lunchGoal = Math.round(dailyGoal * 0.35);
  const dinnerGoal = Math.round(dailyGoal * 0.30);
  const snackGoal = Math.round(dailyGoal * 0.15);

  return (
    <div className="px-5 space-y-6 animate-fade-in relative pb-24">
      {/* Header */}
      <header className="flex justify-between items-end pt-4">
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Resumo</h1>
        </div>
        <div className="flex items-center gap-3">
            <StreakBadge />
            <Link to="/progress">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-black shadow-md">
                    {userData.name.charAt(0)}
                </div>
            </Link>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
          {/* Medication Card - Full Width - REDESIGNED */}
          <Link to="/applications" className="col-span-2 bg-white dark:bg-ios-dark-card p-5 rounded-[24px] shadow-soft border border-gray-100 dark:border-white/5 flex items-center justify-between relative overflow-hidden group active:scale-[0.99] transition-all">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Próxima Dose</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{userData.medication.nextApplication}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-0.5">{userData.medication.name} • {userData.medication.dose}</p>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 shadow-sm border border-gray-100 dark:border-white/5">
                <SyringeIcon className="w-5 h-5" />
            </div>
            
            {/* Subtle decorative blob */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </Link>

          {/* Protein Card */}
          <div className="flex flex-col gap-3">
             <div className="flex-grow">
                <DonutCard 
                    icon={<FlameIcon />} 
                    title="Proteína" 
                    value={totalProtein} 
                    goal={userData.goals.protein} 
                    unit="g" 
                    color="#FF9500" 
                    accentColor="text-orange-500"
                />
             </div>
             <div className="flex justify-between gap-2 bg-ios-card dark:bg-ios-dark-card p-2 rounded-[20px] shadow-soft">
                  <MiniControlButton onClick={handleRemoveProtein} disabled={quickAddProtein <= 0}>
                      <MinusIcon className="w-5 h-5 flex-shrink-0" />
                  </MiniControlButton>
                  <MiniControlButton onClick={handleAddProtein}>
                      <PlusIcon className="w-5 h-5 flex-shrink-0" />
                  </MiniControlButton>
             </div>
          </div>
        
          {/* Water Card */}
          <div className="flex flex-col gap-3">
             <div className="flex-grow">
                <DonutCard 
                    icon={<WaterDropIcon />} 
                    title="Hidratação" 
                    value={currentWater} 
                    goal={userData.goals.water} 
                    unit="L" 
                    color="#007AFF" 
                    accentColor="text-blue-500"
                />
             </div>
             <div className="flex justify-between gap-2 bg-ios-card dark:bg-ios-dark-card p-2 rounded-[20px] shadow-soft">
                  <MiniControlButton onClick={() => setCurrentWater(w => Math.max(0, parseFloat((w - 0.2).toFixed(1))))} disabled={currentWater <= 0}>
                      <MinusIcon className="w-5 h-5 flex-shrink-0" />
                  </MiniControlButton>
                  <MiniControlButton onClick={() => setCurrentWater(w => parseFloat((w + 0.2).toFixed(1)))}>
                      <PlusIcon className="w-5 h-5 flex-shrink-0" />
                  </MiniControlButton>
             </div>
          </div>

          {/* Weight Control */}
          <div className="col-span-2">
              <WeightCard />
          </div>
      </div>
      
      {/* Meals List - REDESIGNED */}
      <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 px-1">Refeições</h2>
          <div className="space-y-3">
              <MealCard 
                icon={<CoffeeIcon />} 
                title="Café da manhã" 
                calories={breakfastCals} 
                goal={breakfastGoal} 
                onAdd={() => openAddMeal('Café da manhã')}
                color="text-orange-500"
                bgClass="bg-orange-500"
              />
              <MealCard 
                icon={<SoupIcon />} 
                title="Almoço" 
                calories={lunchCals} 
                goal={lunchGoal} 
                onAdd={() => openAddMeal('Almoço')}
                color="text-yellow-500"
                bgClass="bg-yellow-500"
              />
              <MealCard 
                icon={<UtensilsIcon />} 
                title="Jantar" 
                calories={dinnerCals} 
                goal={dinnerGoal} 
                onAdd={() => openAddMeal('Jantar')}
                color="text-purple-500"
                bgClass="bg-purple-500"
              />
              <MealCard 
                icon={<AppleIcon />} 
                title="Lanches" 
                calories={snackCals} 
                goal={snackGoal} 
                onAdd={() => openAddMeal('Lanche')}
                color="text-green-500"
                bgClass="bg-green-500"
              />
          </div>
      </section>

      {/* AI Smart Action Button */}
      <button
        onClick={handleSmartLogClick}
        className="w-full bg-white dark:bg-gray-900 p-4 rounded-[24px] shadow-soft border border-blue-100 dark:border-blue-900/30 flex items-center justify-between group active:scale-[0.99] transition-all relative overflow-hidden"
      >
        {!userData.isPro && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-xl font-bold z-10 flex items-center gap-1">
                <LockIcon className="w-2.5 h-2.5" /> PRO
            </div>
        )}
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center shadow-sm">
                <SparklesIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="text-left">
                <h3 className="text-gray-900 dark:text-white font-bold text-base leading-tight">Registro Inteligente</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-0.5">Descreva o que comeu para a IA</p>
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
            <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
      </button>

      {isMealModalOpen && (
        <ManualMealModal
            initialName={selectedMealType}
            onClose={() => setIsMealModalOpen(false)}
            onAddMeal={handleAddMeal}
        />
      )}

      {isSmartLogOpen && (
          <SmartLogModal onClose={() => setIsSmartLogOpen(false)} />
      )}
      
      {showProModal && (
          <ProFeatureModal 
              title="Registro com IA"
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