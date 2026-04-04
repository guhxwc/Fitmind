import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { useToast } from '../ToastProvider';
import { ChevronLeftIcon, PlusIcon, FlameIcon, TrashIcon } from '../core/Icons';
import type { FavoriteMeal, Meal } from '../../types';
import { useScrollLock } from '../../hooks/useScrollLock';

interface FavoriteMealsModalProps {
    onClose: () => void;
    onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void;
}

export const FavoriteMealsModal: React.FC<FavoriteMealsModalProps> = ({ onClose, onAddMeal }) => {
    const { userData } = useAppContext();
    const { addToast } = useToast();
    const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
    const [loading, setLoading] = useState(true);

    useScrollLock(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        if (!userData) return;
        try {
            const { data, error } = await supabase
                .from('favorite_meals')
                .select('*')
                .eq('user_id', userData.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFavorites(data || []);
        } catch (error) {
            console.error("Error fetching favorite meals:", error);
            addToast("Erro ao carregar favoritos.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('favorite_meals')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setFavorites(prev => prev.filter(f => f.id !== id));
            addToast("Refeição removida dos favoritos.", "success");
        } catch (error) {
            console.error("Error deleting favorite meal:", error);
            addToast("Erro ao remover favorito.", "error");
        }
    };

    const handleSelect = (fav: FavoriteMeal) => {
        onAddMeal({
            name: fav.name,
            calories: fav.calories,
            protein: fav.protein,
            type: fav.type as any
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-md rounded-[32px] flex flex-col animate-pop-in shadow-2xl relative max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-black rounded-t-[32px] z-10">
                    <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full active:scale-95 transition-transform">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Favoritos</h2>
                    <div className="w-10"></div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p>Você ainda não tem refeições favoritas.</p>
                            <p className="text-sm mt-2">Adicione refeições aos favoritos na aba de refeições.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {favorites.map((fav) => (
                                <div 
                                    key={fav.id} 
                                    onClick={() => handleSelect(fav)}
                                    className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{fav.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs font-medium text-gray-500">
                                            <span>{fav.type}</span>
                                            <span className="flex items-center gap-1 text-orange-500">
                                                <FlameIcon className="w-3 h-3" /> {fav.calories} kcal
                                            </span>
                                            <span>{fav.protein}g prot</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(e, fav.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
