
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, StarIcon, SparklesIcon, ArrowPathIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, userData } = useAppContext();
    const [status, setStatus] = useState<'activating' | 'success'>('activating');

    useEffect(() => {
        const syncData = async () => {
            // 1. Espera um pouco para o Webhook da Stripe bater no Supabase
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // 2. Tenta buscar os dados atualizados
            await fetchData();
            
            // 3. Marca como concluído
            setStatus('success');
            
            // 4. Salva flags de tutorial/onboarding
            localStorage.setItem('trigger_pro_tour', 'true');
            localStorage.setItem('has_seen_onboarding', 'true');
            localStorage.removeItem('onboarding_step');
        };
        syncData();
    }, [fetchData]);

    if (status === 'activating') {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-8 relative">
                    <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin" />
                    <SparklesIcon className="w-5 h-5 text-blue-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Processando Pagamento...</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    Quase lá! Estamos ativando seus recursos PRO e preparando seu plano personalizado.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative mb-8">
                <div className="w-28 h-28 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-lg animate-pop-in">
                    <CheckCircleIcon className="w-16 h-16" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-xl animate-bounce border-4 border-white dark:border-black">
                    <StarIcon className="w-6 h-6 fill-current" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
                Você é PRO!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium max-w-xs mx-auto mb-12 leading-relaxed">
                Bem-vindo ao nível máximo do FitMind, <strong>{userData?.name}</strong>. Sua transformação começa agora.
            </p>

            <div className="w-full max-w-sm space-y-3 mb-12">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 text-left animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">CalorieCam Liberado</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Registre refeições por foto instantaneamente.</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 text-left animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"/></svg>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Treinos Adaptativos</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Sua rotina de exercícios agora é gerada por IA.</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => navigate('/')}
                className="w-full max-w-sm bg-black dark:bg-white text-white dark:text-black py-5 rounded-[24px] text-xl font-bold shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
                Entrar no App PRO
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            
            <p className="mt-6 text-xs text-gray-400 font-medium">Você já pode fechar esta página.</p>
        </div>
    );
};
