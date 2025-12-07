
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { RECIPES_DATABASE, Recipe } from './recipesData';
import Portal from '../core/Portal';
import { FlameIcon, ClockIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, UtensilsIcon, AppleIcon, CoffeeIcon, SoupIcon, CheckCircleIcon, LockIcon, EditIcon, PersonStandingIcon, BarChartIcon, CalendarIcon, ArrowPathIcon, RefrigeratorIcon } from '../core/Icons';
import type { Meal } from '../../types';
import { ManualMealModal } from './ManualMealModal';
import { CalorieCamModal } from './CalorieCamModal';
import { DietQuiz } from './DietQuiz';
import { FastingQuiz } from './FastingQuiz';
import { PantryChefModal } from './PantryChefModal';

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

// --- Recipe Detail Modal (Redesigned UI/UX) ---
const RecipeDetailModal: React.FC<{ recipe: Recipe; onClose: () => void; onLog: () => void }> = ({ recipe, onClose, onLog }) => {
    // Prevent scrolling on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <Portal>
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                <div 
                    className="bg-white dark:bg-[#000000] w-full h-full sm:h-[90vh] sm:max-w-md sm:rounded-[40px] flex flex-col relative overflow-hidden shadow-2xl animate-slide-up" 
                    onClick={e => e.stopPropagation()}
                >
                    {/* Top Navigation & Image Hero */}
                    <div className="relative h-[40vh] w-full shrink-0 group">
                        <img 
                            src={recipe.image} 
                            alt={recipe.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>

                        <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-20">
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-all active:scale-95"
                            >
                                 <ChevronLeftIcon className="w-6 h-6"/>
                            </button>
                            <button 
                                className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-all active:scale-95"
                            >
                                 <StarIcon className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                            <h2 className="text-3xl font-extrabold text-white leading-tight shadow-sm tracking-tight mb-2">
                                {recipe.name}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
                                    <ClockIcon className="w-3.5 h-3.5" /> {recipe.prepTime}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
                                    <FlameIcon className="w-3.5 h-3.5 text-orange-300" /> {recipe.calories} kcal
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
                                    <BarChartIcon className="w-3.5 h-3.5 text-green-300" /> {recipe.protein}g Prot
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 bg-white dark:bg-[#1C1C1E] -mt-6 rounded-t-[32px] relative z-10 overflow-y-auto hide-scrollbar pb-32">
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-2 sticky top-0 bg-white dark:bg-[#1C1C1E] z-20">
                            <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        </div>

                        <div className="px-6 pb-6">
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium mt-2">
                                {recipe.description}
                            </p>

                            <div className="my-8">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ingredientes</h3>
                                <div className="space-y-3">
                                    {recipe.ingredients.map((ing, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                            <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                                            <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{ing}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* INSTRUCTIONS SECTION - REDESIGNED */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Modo de Preparo</h3>
                                <div className="relative pl-3">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[15px] top-3 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
                                    
                                    <div className="space-y-8">
                                        {recipe.instructions.map((step, i) => {
                                            const isLast = i === recipe.instructions.length - 1;
                                            return (
                                                <div key={i} className="relative flex gap-5 group">
                                                    {/* Number Circle */}
                                                    <div className={`
                                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-lg ring-[6px] ring-white dark:ring-[#1C1C1E] z-10 transition-transform duration-300
                                                        ${isLast ? 'bg-green-500 scale-110' : 'bg-blue-600 group-hover:scale-110'}
                                                    `}>
                                                        {i + 1}
                                                    </div>
                                                    
                                                    {/* Text Content */}
                                                    <div className={`pt-0.5 transition-opacity duration-300 ${isLast ? 'opacity-100' : 'opacity-90'}`}>
                                                        <p className={`text-[15px] leading-relaxed font-medium ${isLast ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {step}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Finish Flag */}
                                    <div className="flex gap-5 mt-8 items-center opacity-40 pl-0.5">
                                         <div className="w-8 flex justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                                         </div>
                                         <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Finalizado</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 left-0 w-full p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#000000] dark:via-[#000000]/95 z-30">
                        <button 
                            onClick={onLog}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-[20px] text-lg shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <PlusIcon className="w-6 h-6" />
                            <span>Registrar Refeição</span>
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

// --- Components for Discovery View ---

const SectionHeader: React.FC<{ title: string, onClick?: () => void }> = ({ title, onClick }) => (
    <div className="flex justify-between items-center px-5 mb-3 mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
        {onClick && <button onClick={onClick} className="text-blue-500 text-sm font-semibold">Ver tudo</button>}
    </div>
);

const HorizontalScrollList: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`flex overflow-x-auto hide-scrollbar gap-3 px-5 pb-2 ${className}`}>
        {children}
    </div>
);

const FeaturedCard: React.FC<{ recipe: Recipe, onClick: () => void }> = ({ recipe, onClick }) => (
    <div onClick={onClick} className="min-w-[260px] w-[260px] flex flex-col gap-3 cursor-pointer group">
        <div className="w-full h-[340px] relative rounded-[24px] overflow-hidden shadow-sm">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-xs font-medium text-white mb-2">
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10"><ClockIcon className="w-3 h-3"/> {recipe.prepTime}</span>
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10"><FlameIcon className="w-3 h-3 text-orange-400"/> {recipe.calories}</span>
                </div>
                <h3 className="font-bold text-white text-xl leading-snug shadow-sm">{recipe.name}</h3>
            </div>
        </div>
    </div>
);

const CommonCategoryCard: React.FC<{ label: string; icon: string; onClick: () => void }> = ({ label, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="min-w-[100px] h-[76px] bg-white dark:bg-[#1C1C1E] rounded-2xl p-2 flex flex-col justify-center items-center cursor-pointer active:scale-95 transition-transform shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]"
    >
        <span className="text-2xl mb-1">{icon}</span>
        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center leading-tight w-full px-1 truncate">{label}</span>
    </button>
);

const CalorieCard: React.FC<{ label: string; image: string; onClick: () => void }> = ({ label, image, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full h-[72px] bg-white dark:bg-[#1C1C1E] rounded-2xl px-4 flex items-center gap-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5"
    >
        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#2C2C2E] flex items-center justify-center text-xl flex-shrink-0">
            {image}
        </div>
        <div className="text-left">
             <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Faixa</span>
             <span className="text-sm font-bold text-gray-900 dark:text-white">{label}</span>
        </div>
    </button>
);

const DietCard: React.FC<{ label: string; icon: string; color: string; onClick: () => void }> = ({ label, icon, color, onClick }) => {
     return (
        <button 
            onClick={onClick}
            className="w-full h-[80px] bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 group"
        >
            <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-gray-900 dark:text-white z-10">{label}</span>
                <span className="text-xl z-10">{icon}</span>
            </div>
            
            {/* Decorative colored glow */}
            <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full ${color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
        </button>
    );
};


const RecipeListView: React.FC<{ 
    filter: string; 
    onBack: () => void; 
    onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void; 
}> = ({ filter, onBack, onAddMeal }) => {
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    // Filtering Logic
    const filteredRecipes = RECIPES_DATABASE.filter(recipe => {
        if (!filter) return true;
        const lowerFilter = filter.toLowerCase();
        const lowerTags = recipe.tags.map(t => t.toLowerCase());
        
        if (filter.includes('kcal')) {
             const cals = recipe.calories;
             if (filter === '50-100 kcal') return cals >= 50 && cals < 100;
             if (filter === '100-200 kcal') return cals >= 100 && cals < 200;
             if (filter === '200-300 kcal') return cals >= 200 && cals < 300;
             if (filter === '300-400 kcal') return cals >= 300 && cals < 400;
             if (filter === '400-500 kcal') return cals >= 400 && cals < 500;
             if (filter === '500-600 kcal') return cals >= 500 && cals < 600;
             if (filter === '600-700 kcal') return cals >= 600 && cals < 700;
             if (filter === '700+ kcal') return cals >= 700;
        }
        
        if (lowerFilter === 'café da manhã') return recipe.category === 'breakfast';
        if (lowerFilter === 'almoço') return recipe.category === 'lunch';
        if (lowerFilter === 'jantar') return recipe.category === 'dinner';
        if (lowerFilter === 'lanche') return recipe.category === 'snack';
        
        // Tag matching
        if (lowerFilter === 'vegano') return lowerTags.includes('vegano');
        if (lowerFilter === 'vegetariano') return lowerTags.includes('vegetariano') || lowerTags.includes('vegano');
        if (lowerFilter === 'baixo carboidrato') return lowerTags.includes('low-carb');
        if (lowerFilter === 'sem glúten') return lowerTags.includes('sem glúten');
        if (lowerFilter === 'sem açúcar') return lowerTags.includes('sem açúcar') || lowerTags.includes('zero açúcar');
        if (lowerFilter === 'proteico' || lowerFilter === 'rico em proteína') return lowerTags.includes('proteico');

        return lowerTags.includes(lowerFilter);
    });

    return (
        <div className="animate-fade-in pb-24 min-h-screen bg-ios-bg dark:bg-black">
            <div className="sticky top-0 z-20 bg-ios-bg/90 dark:bg-black/90 backdrop-blur-md px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize truncate">{filter}</h2>
            </div>

            <div className="p-5 grid gap-4">
                {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => (
                    <div 
                        key={recipe.id} 
                        onClick={() => setSelectedRecipe(recipe)}
                        className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-3 flex gap-4 shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        <img src={recipe.image} alt={recipe.name} className="w-24 h-24 rounded-xl object-cover shrink-0 bg-gray-100 dark:bg-gray-800" />
                        <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-[16px] mb-1 truncate">{recipe.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">{recipe.description}</p>
                            <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
                                <span className="flex items-center gap-1"><FlameIcon className="w-3 h-3 text-orange-500"/> {recipe.calories}</span>
                                <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-blue-500"/> {recipe.prepTime}</span>
                            </div>
                        </div>
                        <div className="self-center text-gray-300 dark:text-gray-600 pr-2">
                            <ChevronRightIcon className="w-5 h-5" />
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma receita encontrada.</p>
                        <p className="text-gray-400 text-sm mt-1">Tente outra categoria.</p>
                    </div>
                )}
            </div>

            {selectedRecipe && (
                <RecipeDetailModal 
                    recipe={selectedRecipe} 
                    onClose={() => setSelectedRecipe(null)} 
                    onLog={() => {
                        onAddMeal({
                            name: selectedRecipe.name,
                            calories: selectedRecipe.calories,
                            protein: selectedRecipe.protein
                        });
                        setSelectedRecipe(null);
                    }}
                />
            )}
        </div>
    );
};

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

// --- Recipes Main View ---
const RecipesView: React.FC<{ onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void }> = ({ onAddMeal }) => {
    const [activeTab, setActiveTab] = useState<'discover' | 'favorites'>('discover');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isPantryChefOpen, setIsPantryChefOpen] = useState(false);

    // Featured Recipes
    const featuredRecipes = RECIPES_DATABASE.filter(r => 
        ['pizza-couve-flor', 'lasanha-abobrinha', 'hamburguer-feijao', 'risoto-shitake', 'mousse-abacate-cacau', 'crepioca'].includes(r.id)
    );

    const commonCategories = [
        { label: 'Café da manhã', icon: '☕' },
        { label: 'Almoço', icon: '🍲' },
        { label: 'Jantar', icon: '🥗' },
        { label: 'Lanche', icon: '🍎' },
        { label: 'Vegano', icon: '🌱' },
    ];

    const calorieRanges = [
        { label: '50-100 kcal', img: '🍉' },
        { label: '100-200 kcal', img: '🥪' },
        { label: '200-300 kcal', img: '🥯' },
        { label: '300-400 kcal', img: '🥞' },
        { label: '400-500 kcal', img: '🍛' },
        { label: '500-600 kcal', img: '🍱' },
        { label: '600-700 kcal', img: '🍝' },
        { label: '700+ kcal', img: '🍔' },
    ];

    const dietas = [
        { name: 'Vegetariano', icon: '🧀', color: 'bg-amber-500' },
        { name: 'Vegano', icon: '🌱', color: 'bg-green-600' },
        { name: 'Baixo carboidrato', icon: '🥜', color: 'bg-orange-700' },
        { name: 'Baixa gordura', icon: '🥬', color: 'bg-green-500' },
        { name: 'Baixa caloria', icon: '🍏', color: 'bg-emerald-600' },
        { name: 'Rico em proteína', icon: '🍳', color: 'bg-blue-600' },
        { name: 'Sem glúten', icon: '🌾', color: 'bg-yellow-600' },
        { name: 'Sem açúcar', icon: '🍬', color: 'bg-pink-500' },
    ];
    
    const collections = [
        { title: 'Receitas virais', subtitle: 'As mais populares da internet', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000&auto=format&fit=crop', filter: 'popular' },
        { title: 'Cozinha coreana', subtitle: 'Saudável e cheia de sabor', image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1000&auto=format&fit=crop', filter: 'asiatico' },
        { title: 'Delícias com morango', subtitle: 'Aproveite a estação', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1000&auto=format&fit=crop', filter: 'morango' },
    ];

    if (selectedCategory) {
        return <RecipeListView filter={selectedCategory} onBack={() => setSelectedCategory(null)} onAddMeal={onAddMeal} />;
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Sub-tabs for Recipes */}
            <div className="px-5 flex border-b border-gray-200 dark:border-gray-800 sticky top-14 bg-ios-bg dark:bg-black z-10 pt-2">
                <button 
                    onClick={() => setActiveTab('discover')}
                    className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-all relative ${activeTab === 'discover' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    Descubra
                    {activeTab === 'discover' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-all relative ${activeTab === 'favorites' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    Favoritas
                    {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>}
                </button>
            </div>

            {activeTab === 'discover' ? (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* 0. Pantry Chef (New Feature) */}
                    <section className="px-5 mt-2">
                        <button 
                            onClick={() => setIsPantryChefOpen(true)}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-3xl shadow-lg shadow-blue-500/20 flex items-center justify-between relative overflow-hidden active:scale-[0.98] transition-transform group"
                        >
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                                    <RefrigeratorIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-lg">Chef da Despensa</h3>
                                    <p className="text-blue-100 text-sm opacity-90">Diga o que tem na geladeira</p>
                                </div>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-white/70" />
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                        </button>
                    </section>

                    {/* 1. Common Categories */}
                    <section>
                        <SectionHeader title="Categorias comuns" />
                        <HorizontalScrollList>
                            {commonCategories.map(cat => (
                                <CommonCategoryCard 
                                    key={cat.label} 
                                    label={cat.label} 
                                    icon={cat.icon} 
                                    onClick={() => setSelectedCategory(cat.label)} 
                                />
                            ))}
                        </HorizontalScrollList>
                    </section>

                    {/* 2. Calorie Ranges */}
                    <section>
                        <SectionHeader title="Receitas por faixa calórica" />
                        <div className="grid grid-cols-2 gap-3 px-5">
                            {calorieRanges.map(range => (
                                <CalorieCard 
                                    key={range.label} 
                                    label={range.label} 
                                    image={range.img} 
                                    onClick={() => setSelectedCategory(range.label)} 
                                />
                            ))}
                        </div>
                    </section>
                    
                    {/* 3. Collections */}
                    <section>
                        <SectionHeader title="Pelo mundo afora" />
                        <HorizontalScrollList>
                            {collections.map(col => (
                                <div key={col.title} onClick={() => setSelectedCategory(col.filter)} className="relative min-w-[280px] h-[200px] rounded-[24px] overflow-hidden cursor-pointer group shadow-sm">
                                    <img src={col.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="absolute bottom-5 left-5 right-5">
                                        <h3 className="text-white font-bold text-xl leading-tight">{col.title}</h3>
                                        <p className="text-gray-300 text-sm mt-1">{col.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </HorizontalScrollList>
                    </section>

                    {/* 4. Featured Recipes */}
                    <section>
                        <SectionHeader title="Algumas receitas" />
                        <HorizontalScrollList>
                            {featuredRecipes.map((recipe) => (
                                <FeaturedCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
                            ))}
                        </HorizontalScrollList>
                    </section>

                    {/* 5. Choose Diet */}
                    <section className="pb-8">
                        <SectionHeader title="Escolha sua dieta" />
                        <div className="grid grid-cols-2 gap-3 px-5">
                            {dietas.map(diet => (
                                <DietCard 
                                    key={diet.name} 
                                    label={diet.name} 
                                    icon={diet.icon} 
                                    color={diet.color} 
                                    onClick={() => setSelectedCategory(diet.name)} 
                                />
                            ))}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="px-5 pt-10 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <StarIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nenhuma favorita ainda</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto">Explore receitas e toque no coração para salvar as que você mais gosta para acessar facilmente.</p>
                    <button onClick={() => setActiveTab('discover')} className="mt-8 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-95 transition-transform">
                        Explorar Receitas
                    </button>
                </div>
            )}

            {selectedRecipe && (
                <RecipeDetailModal 
                    recipe={selectedRecipe} 
                    onClose={() => setSelectedRecipe(null)} 
                    onLog={() => {
                        onAddMeal({
                            name: selectedRecipe.name,
                            calories: selectedRecipe.calories,
                            protein: selectedRecipe.protein
                        });
                        setSelectedRecipe(null);
                    }}
                />
            )}

            {isPantryChefOpen && (
                <PantryChefModal
                    onClose={() => setIsPantryChefOpen(false)}
                    onSelectRecipe={setSelectedRecipe}
                />
            )}
        </div>
    );
};

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
  const [activeView, setActiveView] = useState<'today' | 'recipes' | 'fasting' | 'diet'>('today');

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
      { id: 'recipes', label: 'Receitas' },
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
        {activeView === 'recipes' && <RecipesView onAddMeal={handleAddMeal} />}
        {activeView === 'fasting' && <FastingView />}
        {activeView === 'diet' && <DietPlanView />}
      </div>

    </div>
  );
};
