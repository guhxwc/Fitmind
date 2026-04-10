import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAppContext } from './AppContext';
import { useToast } from './ToastProvider';
import Portal from './core/Portal';
import { StarIcon, WaterDropIcon, FlameIcon, ScaleIcon, CheckCircleIcon } from './core/Icons';
import { ArrowRight, X, AlertTriangle } from 'lucide-react';

interface TrialResultsScreenProps {
    onClose: () => void;
}

export const TrialResultsScreen: React.FC<TrialResultsScreenProps> = ({ onClose }) => {
    const { userData, session } = useAppContext();
    const { addToast } = useToast();
    const [stats, setStats] = useState({
        totalWater: 0,
        totalMeals: 0,
        daysActive: 0,
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!userData) return;
            try {
                const { data: records } = await supabase
                    .from('daily_records')
                    .select('water_liters, meals, date')
                    .eq('user_id', userData.id);

                if (records) {
                    let water = 0;
                    let mealsCount = 0;
                    const uniqueDays = new Set();

                    records.forEach(record => {
                        water += record.water_liters || 0;
                        if (record.meals && Array.isArray(record.meals)) {
                            mealsCount += record.meals.length;
                        }
                        uniqueDays.add(record.date);
                    });

                    setStats({
                        totalWater: water,
                        totalMeals: mealsCount,
                        daysActive: uniqueDays.size > 0 ? uniqueDays.size : userData.streak || 1,
                    });
                }
            } catch (error) {
                console.error("Error fetching trial stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userData]);

    if (!userData || loading) {
        return (
            <Portal>
                <div className="fixed inset-0 bg-white dark:bg-black z-[100] flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            </Portal>
        );
    }

    const weightLost = userData.startWeight - userData.weight;
    const hasLostWeight = weightLost > 0;

    const handleContinue = async () => {
        if (!userData || !session?.user?.email) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('launch_waitlist')
                .insert([
                    { user_id: userData.id, email: session.user.email }
                ]);

            if (error) {
                console.error("Erro ao registrar na lista:", error);
                // Se der erro de duplicidade, não tem problema, apenas avisa que deu certo
            }

            addToast("Sua vaga está garantida! Avisaremos você no lançamento oficial.", "success");
            onClose();
        } catch (err) {
            console.error(err);
            addToast("Erro ao registrar. Tente novamente.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-white dark:bg-[#121214] z-[100] animate-fade-in font-sans flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="min-h-full flex flex-col pb-56">
                        {/* Header Image / Graphic */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center overflow-hidden shrink-0 pb-8">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 text-center px-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mb-4 shadow-xl border border-white/30">
                                <StarIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                                Seu período de teste<br/>chegou ao fim.
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-6 bg-white dark:bg-[#121214] rounded-t-3xl relative z-20">
                        {/* Weight Stat - Overlapping Header */}
                        <div className="-mt-12 mb-8 relative z-30">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between gap-4 overflow-hidden shadow-xl shadow-blue-900/5 dark:shadow-black/20">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 truncate">Evolução de Peso</p>
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                            {hasLostWeight ? `-${weightLost.toFixed(1)}` : userData.weight.toFixed(1)}
                                        </span>
                                        <span className="text-lg font-bold text-gray-500 dark:text-gray-400">kg</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                        De {userData.startWeight.toFixed(1)}kg para {userData.weight.toFixed(1)}kg
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm shrink-0">
                                    <ScaleIcon className="w-7 h-7 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Olha o quanto você evoluiu!
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Em apenas alguns dias, você construiu hábitos que vão transformar sua vida.
                            </p>
                        </div>

                        {/* Other Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* Consistency */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                                <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3 shrink-0">
                                    <FlameIcon className="w-5 h-5 text-orange-500" />
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.daysActive}</p>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mt-1">Dias de Foco</p>
                            </div>

                            {/* Water */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                                <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 shrink-0">
                                    <WaterDropIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.totalWater.toFixed(1)}L</p>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mt-1">Água Ingerida</p>
                            </div>
                        </div>

                        {/* Persuasive Text */}
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                                O que você conquistou:
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                    Você já saiu do zero ({stats.totalMeals} refeições registradas).
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                    Você já está na frente de 80% das pessoas que desistem.
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                    Deu o primeiro passo real em direção à sua meta de {userData.targetWeight}kg.
                                </li>
                            </ul>
                        </div>

                        {/* Loss Aversion Section */}
                        <div className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 mb-8">
                            <h3 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                O que acontece se você parar:
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                                    Se você parar agora, existe grande chance de perder esse progresso.
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                                    A consistência que você criou pode se quebrar.
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                                    Seus resultados podem regredir.
                                </li>
                            </ul>
                        </div>
                        
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium px-4 mb-4">
                            Não deixe esse progresso parar agora. O FitMind já conhece seu corpo e sua rotina.
                        </p>
                    </div>
                    </div>
                </div>

                {/* Fixed Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-[#121214] border-t border-gray-100 dark:border-gray-800 z-30 pb-safe-bottom">
                    <div className="flex flex-col gap-3 max-w-md mx-auto">
                        <button 
                            onClick={handleContinue}
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Garantindo vaga..." : "Quero continuar evoluindo"}
                            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                        </button>
                        
                        <button 
                            onClick={handleCancel}
                            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 py-4 rounded-2xl text-base font-bold active:scale-[0.98] transition-all"
                        >
                            Sair / Não continuar
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};
