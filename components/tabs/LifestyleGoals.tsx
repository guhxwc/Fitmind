
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { useToast } from '../ToastProvider';
import { ChevronLeftIcon } from '../core/Icons';

const GoalInput: React.FC<{
    label: string;
    value: number;
    unit?: string;
    onChange: (val: number) => void;
}> = ({ label, value, unit, onChange }) => (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{label} {unit && `(${unit})`}</label>
        <input 
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="bg-transparent text-xl font-bold text-gray-900 dark:text-white outline-none w-full placeholder-gray-300"
        />
    </div>
);

export const LifestyleGoals: React.FC = () => {
    const { userData, setUserData, fetchData } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Local state initialized with user data
    const [goals, setGoals] = useState(userData?.goals || {
        water: 0, protein: 0, calories: 0, fiber: 0, carbs: 0, fats: 0, steps: 0, exerciseMinutes: 0
    });

    if (!userData) return null;

    const handleChange = (key: string, val: number) => {
        setGoals(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ goals })
            .eq('id', userData.id);

        if (error) {
            addToast('Erro ao salvar metas.', 'error');
        } else {
            setUserData({ ...userData, goals });
            addToast('Metas atualizadas com sucesso!', 'success');
            navigate(-1);
        }
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">Metas de Estilo de Vida</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="p-4 space-y-8 animate-fade-in">
                
                {/* Nutrição */}
                <section>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Nutrição</h2>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                        <GoalInput 
                            label="Proteínas" 
                            value={goals.protein} 
                            unit="g" 
                            onChange={(v) => handleChange('protein', v)} 
                        />
                        <GoalInput 
                            label="Fibras" 
                            value={goals.fiber || 0} 
                            unit="g" 
                            onChange={(v) => handleChange('fiber', v)} 
                        />
                        <GoalInput 
                            label="Água" 
                            value={goals.water} 
                            unit="ml" // Convert to ml logic if needed, treating input as direct unit
                            onChange={(v) => handleChange('water', v)} 
                        />
                        <GoalInput 
                            label="Calorias" 
                            value={goals.calories} 
                            unit="kcal" 
                            onChange={(v) => handleChange('calories', v)} 
                        />
                        <GoalInput 
                            label="Carboidratos" 
                            value={goals.carbs || 0} 
                            unit="g" 
                            onChange={(v) => handleChange('carbs', v)} 
                        />
                        <GoalInput 
                            label="Gorduras" 
                            value={goals.fats || 0} 
                            unit="g" 
                            onChange={(v) => handleChange('fats', v)} 
                        />
                    </div>
                </section>

                {/* Atividade Física */}
                <section>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Atividade Física</h2>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                        <GoalInput 
                            label="Passos" 
                            value={goals.steps || 0} 
                            onChange={(v) => handleChange('steps', v)} 
                        />
                        <GoalInput 
                            label="Exercício" 
                            value={goals.exerciseMinutes || 0} 
                            unit="min" 
                            onChange={(v) => handleChange('exerciseMinutes', v)} 
                        />
                    </div>
                </section>

                {/* Info Box */}
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex gap-3">
                    <div className="text-xl">💡</div>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed font-medium">
                        Estas metas são usadas para acompanhar seu progresso diário e calcular suas estatísticas. Ajuste conforme orientação do seu nutricionista.
                    </p>
                </div>

            </div>

            {/* Save Button - Increased z-index to overlay bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 z-[100]">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full max-w-md mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    );
};
