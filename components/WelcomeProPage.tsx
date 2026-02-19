import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, StarIcon, CameraIcon, FlameIcon, BarChartIcon } from './core/Icons';
import { useAppContext } from './AppContext';

export const WelcomeProPage: React.FC = () => {
    const navigate = useNavigate();
    const { userData } = useAppContext();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    const handleStart = () => {
        // Marca que o usuário já viu esta tela (usando a nova chave para forçar reexibição em atualizações)
        localStorage.setItem('has_seen_pro_welcome_2', 'true');
        localStorage.setItem('trigger_pro_tour', 'true');
        navigate('/', { replace: true });
    };

    const FeatureCard = ({ icon, title, delay }: { icon: React.ReactNode, title: string, delay: string }) => (
        <div 
            className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm opacity-0 animate-slide-up" 
            style={{ animationDelay: delay, animationFillMode: 'forwards' }}
        >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                {icon}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm text-left leading-tight">{title}</h3>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
                
                {/* Icon Badge */}
                <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pop-in rotate-3 border-4 border-white/10 dark:border-[#1C1C1E]">
                        <StarIcon className="w-12 h-12 text-white transform -rotate-3" />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-green-500 rounded-full p-1.5 border-4 border-[#F2F2F7] dark:border-black animate-pop-in shadow-lg" style={{ animationDelay: '0.3s' }}>
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards', opacity: 0 }}>
                    Pagamento Concluído!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 animate-slide-up text-base leading-relaxed px-2" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
                    Parabéns, <strong>{userData?.name?.split(' ')[0] || 'usuário'}</strong>. Sua conta FitMind PRO está ativa e seus recursos foram liberados.
                </p>

                <div className="w-full space-y-3 mb-12">
                    <FeatureCard icon={<CameraIcon className="w-6 h-6"/>} title="CalorieCam IA Liberada para leitura de pratos" delay="0.4s" />
                    <FeatureCard icon={<FlameIcon className="w-6 h-6"/>} title="Personal Trainer e Treinos Adaptativos" delay="0.5s" />
                    <FeatureCard icon={<BarChartIcon className="w-6 h-6"/>} title="Análises de Saúde e Relatórios Semanais" delay="0.6s" />
                </div>

                <button 
                    onClick={handleStart}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 sm:py-5 rounded-2xl sm:rounded-[24px] text-lg sm:text-xl font-bold shadow-2xl active:scale-[0.98] transition-transform animate-slide-up relative overflow-hidden group" 
                    style={{ animationDelay: '0.7s', animationFillMode: 'forwards', opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-[shimmer_2s_infinite] transition-transform duration-1000"></div>
                    Entrar no App
                </button>
            </div>
        </div>
    );
};