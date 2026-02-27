
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
    <div className="group">
        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 ml-1 block">{label}</label>
        <div className="relative">
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-800/40 rounded-2xl px-4 py-3.5 text-xl font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-gray-800 transition-all"
            />
            {unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 dark:text-gray-600">
                    {unit}
                </span>
            )}
        </div>
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
    const [targetWeight, setTargetWeight] = useState(userData?.targetWeight || 0);
    const [weeklyPace, setWeeklyPace] = useState(userData?.pace || 0.5);

    if (!userData) return null;

    const handleChange = (key: string, val: number) => {
        setGoals(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ 
                goals,
                target_weight: targetWeight,
                pace: weeklyPace
            })
            .eq('id', userData.id);

        if (error) {
            addToast('Erro ao salvar metas.', 'error');
        } else {
            setUserData({ ...userData, goals, targetWeight, pace: weeklyPace });
            addToast('Metas atualizadas com sucesso!', 'success');
            navigate(-1);
        }
        setIsSaving(false);
    };

    const paceOptions = [0.25, 0.5, 0.75, 1];

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
                
                {/* Metas de Peso */}
                <section>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Metas de Peso</h2>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
                        
                        {/* Peso Meta */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1 block">Peso Meta</label>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={targetWeight}
                                    onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-gray-50 dark:bg-gray-800/40 rounded-2xl px-5 py-5 text-4xl font-black text-gray-900 dark:text-white outline-none border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-gray-800 transition-all tracking-tighter"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400 dark:text-gray-600">kg</span>
                            </div>
                        </div>

                        {/* Velocidade */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-1 block">
                                Velocidade de Perda
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {paceOptions.map(pace => (
                                    <button
                                        key={pace}
                                        onClick={() => setWeeklyPace(pace)}
                                        className={`py-4 px-2 rounded-2xl text-sm font-bold transition-all border ${
                                            weeklyPace === pace
                                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-black/10 dark:shadow-white/5'
                                            : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {pace} kg / semana
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Nutrição */}
                <section>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Nutrição Diária</h2>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                        <GoalInput 
                            label="Meta de Água" 
                            value={goals.water} 
                            unit="ml" 
                            onChange={(v) => handleChange('water', v)} 
                        />
                        <GoalInput 
                            label="Meta de Proteínas" 
                            value={goals.protein} 
                            unit="g" 
                            onChange={(v) => handleChange('protein', v)} 
                        />
                        <GoalInput 
                            label="Meta de Calorias" 
                            value={goals.calories} 
                            unit="kcal" 
                            onChange={(v) => handleChange('calories', v)} 
                        />
                    </div>
                </section>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                    <div className="text-xl">💡</div>
                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                        Estas metas são usadas para acompanhar seu progresso diário e calcular suas estatísticas. Ajuste conforme orientação profissional.
                    </p>
                </div>

            </div>

            {/* Save Button */}
            <div className="px-4 pt-4 pb-12 mt-4">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-4 px-6">
                    Suas metas serão sincronizadas com todos os seus dispositivos.
                </p>
            </div>
        </div>
    );
};
