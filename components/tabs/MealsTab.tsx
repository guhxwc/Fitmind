
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import Portal from '../core/Portal';
import { FlameIcon, ClockIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, UtensilsIcon, AppleIcon, CoffeeIcon, SoupIcon, CheckCircleIcon, LockIcon, EditIcon, PersonStandingIcon, BarChartIcon, CalendarIcon, ArrowPathIcon, RefrigeratorIcon } from '../core/Icons';
import type { Meal } from '../../types';
import { ManualMealModal } from './ManualMealModal';
import { CalorieCamModal } from './CalorieCamModal';
import { DietQuiz } from './DietQuiz';
import { FastingQuiz } from './FastingQuiz';

// --- HELPER TYPES & DATA FOR FASTING ---

interface FastingPlanData {
    id: string;
    label: string;
    fastingHours: number;
    eatingHours: number;
    description: string;
    color: string;
}

const FASTING_PLANS: FastingPlanData[] = [
    { id: '12:12', label: '12:12 Circadiano', fastingHours: 12, eatingHours: 12, description: 'Ótimo para iniciantes.', color: 'from-blue-400 to-blue-600' },
    { id: '14:10', label: '14:10 Leve', fastingHours: 14, eatingHours: 10, description: 'Começa a queima de gordura.', color: 'from-teal-400 to-teal-600' },
    { id: '16:8', label: '16:8 Leangains', fastingHours: 16, eatingHours: 8, description: 'O protocolo mais popular.', color: 'from-purple-400 to-purple-600' },
    { id: '18:6', label: '18:6 Avançado', fastingHours: 18, eatingHours: 6, description: 'Autofagia potencializada.', color: 'from-orange-400 to-orange-600' },
    { id: '20:4', label: '20:4 Guerreiro', fastingHours: 20, eatingHours: 4, description: 'Máxima eficácia.', color: 'from-red-400 to-red-600' },
];

const BIOLOGICAL_STAGES = [
    { start: 0, end: 2, title: "Aumento de Glicose", description: "Seu corpo está digerindo a última refeição. O açúcar no sangue sobe.", icon: "🍽️" },
    { start: 2, end: 5, title: "Queda de Glicose", description: "A insulina começa a cair. O corpo termina a digestão.", icon: "📉" },
    { start: 5, end: 8, title: "Normalização", description: "Seu corpo parou de estocar gordura. O hormônio GH começa a subir.", icon: "✨" },
    { start: 8, end: 12, title: "Queima de Gordura", description: "Início da mobilização de estoques de gordura para energia.", icon: "🔥" },
    { start: 12, end: 18, title: "Cetose", description: "Modo metabólico de alta eficiência. Queima intensa de gordura.", icon: "⚡" },
    { start: 18, end: 24, title: "Autofagia", description: "Limpeza celular profunda. Reciclagem de células velhas.", icon: "🧬" },
    { start: 24, end: 72, title: "Pico de GH", description: "Hormônio do crescimento em níveis máximos para preservação muscular.", icon: "💪" },
];

// --- Today View ---
const TodayView: React.FC<{ onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void }> = ({ onAddMeal }) => {
    const { meals, userData } = useAppContext();
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isCalorieCamOpen, setIsCalorieCamOpen] = useState(false);

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
                <button onClick={() => setIsCalorieCamOpen(true)} className="bg-blue-500 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform">
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
        </div>
    )
}

// --- NEW FASTING VIEW ---

const FastingView: React.FC = () => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState<string>(localStorage.getItem('fastingPlanId') || '16:8');
    const [isFasting, setIsFasting] = useState<boolean>(localStorage.getItem('isFasting') === 'true');
    const [startTime, setStartTime] = useState<number | null>(localStorage.getItem('fastingStartTime') ? parseInt(localStorage.getItem('fastingStartTime')!) : null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [showPlansModal, setShowPlansModal] = useState(false);

    const plan = FASTING_PLANS.find(p => p.id === currentPlanId) || FASTING_PLANS[2];

    useEffect(() => {
        let interval: any;
        if (isFasting && startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                setElapsedTime(now - startTime);
            }, 1000); // Update every second
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [isFasting, startTime]);

    // Initial sync for elapsed time on mount if fasting
    useEffect(() => {
        if (isFasting && startTime) {
            setElapsedTime(Date.now() - startTime);
        }
    }, []);

    const toggleFasting = () => {
        if (isFasting) {
            // Stop Fasting
            setIsFasting(false);
            setStartTime(null);
            setElapsedTime(0);
            localStorage.setItem('isFasting', 'false');
            localStorage.removeItem('fastingStartTime');
        } else {
            // Start Fasting
            const now = Date.now();
            setIsFasting(true);
            setStartTime(now);
            localStorage.setItem('isFasting', 'true');
            localStorage.setItem('fastingStartTime', now.toString());
        }
    };

    const changePlan = (id: string) => {
        setCurrentPlanId(id);
        localStorage.setItem('fastingPlanId', id);
        setShowPlansModal(false);
    };

    // Calculations
    const totalSeconds = plan.fastingHours * 3600;
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const progress = Math.min((elapsedSeconds / totalSeconds) * 100, 100);
    const hoursElapsed = Math.floor(elapsedSeconds / 3600);
    const minutesElapsed = Math.floor((elapsedSeconds % 3600) / 60);
    const secondsElapsed = elapsedSeconds % 60;

    // Current Biological Stage
    const currentStage = BIOLOGICAL_STAGES.find(s => hoursElapsed >= s.start && hoursElapsed < s.end) || BIOLOGICAL_STAGES[BIOLOGICAL_STAGES.length - 1];

    // Circular Progress Data
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="p-5 space-y-6 pb-24 animate-fade-in min-h-screen bg-gray-50 dark:bg-black">
            
            {/* Hero / Timer Section */}
            <div className="flex flex-col items-center justify-center pt-6 relative">
                <div className="relative w-[280px] h-[280px] flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            className="stroke-gray-200 dark:stroke-gray-800"
                            strokeWidth="20"
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            className={`transition-all duration-1000 ease-linear stroke-blue-500`} // Could be dynamic color based on plan
                            strokeWidth="20"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    
                    {/* Inner Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        {isFasting ? (
                            <>
                                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">Tempo Decorrido</span>
                                <div className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
                                    {hoursElapsed}:{minutesElapsed.toString().padStart(2, '0')}:{secondsElapsed.toString().padStart(2, '0')}
                                </div>
                                <span className="text-blue-500 font-semibold mt-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                    Meta: {plan.fastingHours}h
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                                    <ClockIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Pronto para jejuar?</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{plan.label}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <button 
                    onClick={toggleFasting}
                    className={`mt-8 w-full max-w-xs py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${isFasting ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-black dark:bg-white text-white dark:text-black shadow-black/20 dark:shadow-white/10'}`}
                >
                    {isFasting ? 'Encerrar Jejum' : 'Iniciar Agora'}
                </button>
            </div>

            {/* Current Biological Stage (Only visible if fasting or showing intro) */}
            <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">O que está acontecendo?</h3>
                    <span className="text-2xl">{isFasting ? currentStage.icon : '🤔'}</span>
                </div>
                {isFasting ? (
                    <div className="animate-fade-in">
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-1">{currentStage.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{currentStage.description}</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{width: `${Math.min(((hoursElapsed - currentStage.start) / (currentStage.end - currentStage.start)) * 100, 100)}%`}}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">Próxima fase em {Math.max(0, currentStage.end - hoursElapsed)}h</p>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Inicie o cronômetro para acompanhar as fases biológicas do seu corpo em tempo real.</p>
                )}
            </div>

            {/* Plan Selector & Quiz */}
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowPlansModal(true)} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 text-left active:scale-95 transition-transform">
                    <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mb-3">
                        <EditIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Plano Atual</p>
                    <p className="font-bold text-gray-900 dark:text-white text-lg truncate">{plan.id}</p>
                </button>
                <button onClick={() => setIsQuizOpen(true)} className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-[24px] shadow-lg shadow-blue-500/20 text-left active:scale-95 transition-transform text-white">
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                        <span className="text-lg">📝</span>
                    </div>
                    <p className="text-xs text-blue-100 font-bold uppercase">Dúvidas?</p>
                    <p className="font-bold text-white text-lg">Quiz de Jejum</p>
                </button>
            </div>

            {/* Education / Timeline Preview */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white px-2">Linha do Tempo Corporal</h3>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-2 shadow-sm border border-gray-100 dark:border-white/5">
                    {BIOLOGICAL_STAGES.slice(0, 5).map((stage, idx) => (
                        <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl ${isFasting && hoursElapsed >= stage.start ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
                                {stage.icon}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{stage.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stage.start}h - {stage.end}h</p>
                            </div>
                            {isFasting && hoursElapsed >= stage.start && (
                                <div className="ml-auto text-green-500">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {showPlansModal && (
                <Portal>
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4 backdrop-blur-sm" onClick={() => setShowPlansModal(false)}>
                        <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-[32px] p-6 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Escolha seu Plano</h3>
                            <div className="space-y-3">
                                {FASTING_PLANS.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => changePlan(p.id)}
                                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${currentPlanId === p.id ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-transparent bg-gray-100 dark:bg-gray-900'}`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white text-lg">{p.label}</span>
                                            {currentPlanId === p.id && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{p.description}</p>
                                        <div className="mt-3 flex gap-2 text-xs font-bold uppercase tracking-wide">
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-md">{p.fastingHours}h Jejum</span>
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-md">{p.eatingHours}h Janela</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {isQuizOpen && (
                <FastingQuiz 
                    onComplete={(id) => { changePlan(id); setIsQuizOpen(false); }}
                    onClose={() => setIsQuizOpen(false)}
                />
            )}
        </div>
    );
};

// --- Diet Plan View ---
const DietPlanView: React.FC = () => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const { userData } = useAppContext();

    // Simple mock for plan display
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
