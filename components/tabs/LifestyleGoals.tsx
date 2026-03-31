
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { useToast } from '../ToastProvider';
import { ChevronLeftIcon, WaterDropIcon, DumbbellIcon, FlameIcon } from '../core/Icons';

const GoalInput: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    unit?: string;
    onChange: (val: number) => void;
    colorClass: string;
}> = ({ icon, label, value, unit, onChange, colorClass }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                {icon}
            </div>
            <span className="text-[17px] font-medium text-gray-900 dark:text-white">{label}</span>
        </div>
        <div className="flex items-center gap-1">
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-20 bg-transparent text-right text-[19px] font-bold text-gray-900 dark:text-white outline-none"
            />
            {unit && (
                <span className="text-[17px] font-medium text-gray-400 dark:text-gray-500">{unit}</span>
            )}
        </div>
    </div>
);

export const LifestyleGoals: React.FC = () => {
    const { userData, setUserData } = useAppContext();
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
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">Metas Diárias</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="p-4 space-y-8 animate-fade-in">
                
                {/* Nutrição */}
                <section>
                    <h2 className="text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Nutrição e Hidratação</h2>
                    <div className="bg-white dark:bg-gray-900 px-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                        <GoalInput 
                            icon={<WaterDropIcon className="w-5 h-5 text-blue-500" />}
                            colorClass="bg-blue-50 dark:bg-blue-500/10"
                            label="Água" 
                            value={goals.water} 
                            unit="ml" 
                            onChange={(v) => handleChange('water', v)} 
                        />
                        <GoalInput 
                            icon={<FlameIcon className="w-5 h-5 text-orange-500" />}
                            colorClass="bg-orange-50 dark:bg-orange-500/10"
                            label="Calorias" 
                            value={goals.calories} 
                            unit="kcal" 
                            onChange={(v) => handleChange('calories', v)} 
                        />
                        <GoalInput 
                            icon={<span className="text-xl">🥩</span>}
                            colorClass="bg-red-50 dark:bg-red-500/10"
                            label="Proteínas" 
                            value={goals.protein} 
                            unit="g" 
                            onChange={(v) => handleChange('protein', v)} 
                        />
                    </div>
                </section>

                {/* Atividade */}
                <section>
                    <h2 className="text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Atividade Física</h2>
                    <div className="bg-white dark:bg-gray-900 px-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                        <GoalInput 
                            icon={<span className="text-xl">👟</span>}
                            colorClass="bg-green-50 dark:bg-green-500/10"
                            label="Passos" 
                            value={goals.steps || 10000} 
                            unit="passos" 
                            onChange={(v) => handleChange('steps', v)} 
                        />
                        <GoalInput 
                            icon={<DumbbellIcon className="w-5 h-5 text-purple-500" />}
                            colorClass="bg-purple-50 dark:bg-purple-500/10"
                            label="Exercício" 
                            value={goals.exerciseMinutes || 30} 
                            unit="min" 
                            onChange={(v) => handleChange('exerciseMinutes', v)} 
                        />
                    </div>
                </section>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-[20px] p-4 flex gap-3 items-start">
                    <span className="text-xl">💡</span>
                    <p className="text-[13px] text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                        Estas metas são usadas para acompanhar seu progresso diário. Ajuste-as conforme sua evolução e orientação profissional.
                    </p>
                </div>

            </div>

            {/* Save Button */}
            <div className="px-4 pt-4 pb-12 mt-4">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-70 text-[17px]"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
};
