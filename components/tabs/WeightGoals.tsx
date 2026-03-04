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
        { value: 0.25, label: '0.25 kg/semana' },
        { value: 0.5, label: '0.5 kg/semana' },
        { value: 0.75, label: '0.75 kg/semana' },
        { value: 1, label: '1 kg/semana' },
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
        <div className="min-h-screen bg-ios-bg dark:bg-ios-dark-bg animate-fade-in pb-32">
            <header className="sticky top-0 z-10 bg-ios-bg/80 dark:bg-ios-dark-bg/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 px-4 py-4 flex items-center justify-between">
                <button onClick={() => navigate('/settings')} className="flex items-center text-blue-500 active:opacity-70 transition-opacity">
                    <ChevronLeftIcon className="w-6 h-6" />
                    <span className="text-[17px] font-medium ml-1">Ajustes</span>
                </button>
                <h1 className="text-[17px] font-semibold text-gray-900 dark:text-white">Metas de Peso</h1>
                <div className="w-20"></div> {/* Spacer for centering */}
            </header>

            <div className="p-5 space-y-8">
                {/* Meta de Peso */}
                <section>
                    <h2 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 ml-4">Peso Meta</h2>
                    <div className="bg-ios-card dark:bg-ios-dark-card rounded-[10px] p-4 shadow-sm flex items-center justify-between">
                        <input 
                            type="number" 
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(e.target.value)}
                            className="bg-transparent text-gray-900 dark:text-white text-2xl font-bold outline-none w-full"
                            placeholder="Ex: 70.5"
                            step="0.1"
                        />
                        <span className="text-gray-400 dark:text-gray-500 font-semibold text-xl">kg</span>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-2 ml-4 leading-relaxed">
                        Este é o peso que você deseja atingir ao final da sua jornada.
                    </p>
                </section>

                {/* Meta Semanal */}
                <section>
                    <h2 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 ml-4">Meta Semanal</h2>
                    <div className="bg-ios-card dark:bg-ios-dark-card rounded-[10px] overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                            <p className="text-[15px] font-medium text-gray-900 dark:text-white">
                                Escolha a velocidade que deseja perder peso
                            </p>
                        </div>
                        {paces.map((p, index) => (
                            <button 
                                key={p.value}
                                onClick={() => setPace(p.value)}
                                className={`w-full flex items-center justify-between px-4 py-3 bg-ios-card dark:bg-ios-dark-card active:bg-gray-100 dark:active:bg-gray-800 transition-colors ${index !== paces.length - 1 ? 'border-b border-gray-200/50 dark:border-gray-700/50' : ''}`}
                            >
                                <span className={`text-[17px] ${pace === p.value ? 'text-blue-500 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                                    {p.label}
                                </span>
                                {pace === p.value && <CheckCircleIcon className="w-5 h-5 text-blue-500" />}
                            </button>
                        ))}
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-2 ml-4 leading-relaxed">
                        Perder peso de forma gradual (0.25-0.5 kg/semana) é mais sustentável a longo prazo.
                    </p>
                </section>

                {/* Aviso Médico */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[10px] p-4 flex gap-3 items-start">
                    <span className="text-xl">⚠️</span>
                    <p className="text-[13px] text-yellow-800 dark:text-yellow-200 leading-relaxed font-medium">
                        Sempre consulte seu médico antes de definir metas agressivas de perda de peso.
                    </p>
                </div>

                {/* Salvar */}
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-bold text-[17px] active:scale-95 transition-transform disabled:opacity-50 mt-4"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
};
