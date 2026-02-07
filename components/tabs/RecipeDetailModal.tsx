
import React, { useState } from 'react';
import { ClockIcon, FlameIcon, BarChartIcon, CheckCircleIcon, PlusIcon, ChevronLeftIcon } from '../core/Icons';
import type { Recipe } from './recipesData';
import Portal from '../core/Portal';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onAddLog: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose, onAddLog }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  const toggleIngredient = (ing: string) => {
    if (checkedIngredients.includes(ing)) {
      setCheckedIngredients(prev => prev.filter(i => i !== ing));
    } else {
      setCheckedIngredients(prev => [...prev, ing]);
    }
  };

  const handleAddToLog = () => {
      onAddLog(recipe);
      onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 z-[90] flex items-end justify-center p-0 sm:p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md h-[95vh] sm:h-[90vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col relative overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            
            {/* Header Image */}
            <div className="relative h-64 w-full flex-shrink-0">
                <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <button 
                    onClick={onClose}
                    className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {recipe.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-lg border border-white/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h2 className="text-3xl font-bold text-white leading-tight shadow-sm">{recipe.name}</h2>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto bg-white dark:bg-[#1C1C1E] -mt-6 rounded-t-[32px] relative z-10 px-6 pt-8 pb-32">
                
                {/* Stats Row */}
                <div className="flex justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div className="flex flex-col items-center gap-1">
                        <ClockIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tempo</span>
                        <span className="font-bold text-gray-900 dark:text-white">{recipe.prepTime}</span>
                    </div>
                    <div className="w-px bg-gray-100 dark:bg-gray-800"></div>
                    <div className="flex flex-col items-center gap-1">
                        <FlameIcon className="w-5 h-5 text-orange-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Calorias</span>
                        <span className="font-bold text-gray-900 dark:text-white">{recipe.calories}</span>
                    </div>
                    <div className="w-px bg-gray-100 dark:bg-gray-800"></div>
                    <div className="flex flex-col items-center gap-1">
                        <BarChartIcon className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Proteína</span>
                        <span className="font-bold text-gray-900 dark:text-white">{recipe.protein}g</span>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 italic text-sm border-l-2 border-blue-500 pl-4">
                    "{recipe.description}"
                </p>

                {/* Ingredients */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        Ingredientes
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{recipe.ingredients.length} itens</span>
                    </h3>
                    <ul className="space-y-3">
                        {recipe.ingredients.map((ing, idx) => {
                            const isChecked = checkedIngredients.includes(ing);
                            return (
                                <li 
                                    key={idx} 
                                    onClick={() => toggleIngredient(ing)}
                                    className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${isChecked ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60' : 'bg-white dark:bg-gray-900/50 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {isChecked && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{ing}</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>

                {/* Instructions */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Modo de Preparo</h3>
                    <div className="space-y-6 relative">
                        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
                        {recipe.instructions.map((step, idx) => (
                            <div key={idx} className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white dark:ring-[#1C1C1E]">
                                    {idx + 1}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-20">
                <button 
                    onClick={handleAddToLog}
                    className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar ao Diário ({recipe.calories} kcal)
                </button>
            </div>

        </div>
      </div>
    </Portal>
  );
};
