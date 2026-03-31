import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ChevronLeftIcon, CheckCircleIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';

export const WeightGoals: React.FC = () => {
    const { userData, setUserData, calculateGoals } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [targetWeight, setTargetWeight] = useState<string>(userData?.targetWeight?.toString() || '');
    const [pace, setPace] = useState<number>(userData?.pace || 0.5);
    const [isSaving, setIsSaving] = useState(false);

    if (!userData) return null;

    const paces = [
        { value: 0.25, label: '0.25 kg', desc: 'Lento e fácil de manter' },
        { value: 0.5, label: '0.50 kg', desc: 'Recomendado para a maioria' },
        { value: 0.75, label: '0.75 kg', desc: 'Exige mais dedicação' },
        { value: 1, label: '1.00 kg', desc: 'Intenso, requer foco total' },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        const newTargetWeight = parseFloat(targetWeight);
        
        if (isNaN(newTargetWeight) || newTargetWeight <= 0) {
            addToast("Por favor, insira um peso válido.", "error");
            setIsSaving(false);
            return;
        }

        const newGoals = calculateGoals(newTargetWeight, userData.activityLevel);

        const updatedData = {
            ...userData,
            targetWeight: newTargetWeight,
            pace: pace,
            goals: newGoals
        };

        const { error } = await supabase.from('profiles').update({
            target_weight: newTargetWeight,
            pace: pace,
            goals: newGoals
        }).eq('id', userData.id);

        if (error) {
            addToast("Erro ao salvar metas.", "error");
        } else {
            setUserData(updatedData);
            addToast("Metas atualizadas com sucesso!", "success");
            navigate('/settings');
        }
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between">
                    <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">Metas de Peso</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="p-5 space-y-8 animate-fade-in">
                
                {/* Meta de Peso - Apple Health Style */}
                <section className="flex flex-col items-center justify-center py-6">
                    <div className="flex items-baseline gap-1 relative">
                        <input 
                            type="number" 
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(e.target.value)}
                            className="bg-transparent text-gray-900 dark:text-white text-[5rem] leading-none font-black outline-none w-48 text-center tracking-tighter"
                            placeholder="0.0"
                            step="0.1"
                        />
                        <span className="text-gray-400 dark:text-gray-500 font-bold text-2xl absolute -right-6 bottom-4">kg</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium uppercase tracking-widest">Seu Peso Objetivo</p>
                </section>

                {/* Meta Semanal */}
                <section>
                    <h2 className="text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Ritmo Semanal</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                        {paces.map((p, index) => (
                            <button 
                                key={p.value}
                                onClick={() => setPace(p.value)}
                                className={`w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 active:bg-gray-50 dark:active:bg-gray-800 transition-colors ${index !== paces.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                            >
                                <div className="flex flex-col items-start text-left">
                                    <span className={`text-[17px] font-semibold ${pace === p.value ? 'text-blue-600 dark:text-blue-500' : 'text-gray-900 dark:text-white'}`}>
                                        {p.label} / semana
                                    </span>
                                    <span className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                                        {p.desc}
                                    </span>
                                </div>
                                {pace === p.value && (
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                        <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Aviso Médico */}
                <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-[20px] p-4 flex gap-3 items-start">
                    <span className="text-xl">💡</span>
                    <p className="text-[13px] text-orange-800 dark:text-orange-200 leading-relaxed font-medium">
                        Perder peso de forma gradual (0.25 a 0.5 kg por semana) é mais saudável e sustentável a longo prazo.
                    </p>
                </div>

                {/* Salvar */}
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-[17px] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 mt-4"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
};
