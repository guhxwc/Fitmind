
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, StarIcon, SparklesIcon, ArrowPathIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, userData } = useAppContext();
    const [status, setStatus] = useState<'activating' | 'success' | 'error'>('activating');
    const [attempts, setAttempts] = useState(0);
    const maxAttempts = 15; // Tenta por aproximadamente 22 segundos (15 * 1.5s)
    const pollingInterval = useRef<number | null>(null);

    const checkProStatus = async () => {
        if (!userData?.id) return;

        try {
            // Buscamos diretamente do Supabase ignorando qualquer cache local
            const { data, error } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', userData.id)
                .single();

            if (error) throw error;

            if (data?.is_pro) {
                // SUCESSO! O Webhook já processou.
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                await fetchData(); // Atualiza todo o contexto global
                setStatus('success');
                
                // Flags de Onboarding
                localStorage.setItem('trigger_pro_tour', 'true');
                localStorage.setItem('has_seen_onboarding', 'true');
                localStorage.removeItem('onboarding_step');
            } else {
                // Ainda não é PRO, incrementa tentativa
                setAttempts(prev => {
                    const next = prev + 1;
                    if (next >= maxAttempts) {
                        if (pollingInterval.current) clearInterval(pollingInterval.current);
                        setStatus('error');
                    }
                    return next;
                });
            }
        } catch (err) {
            console.error("Erro ao verificar status PRO:", err);
        }
    };

    useEffect(() => {
        // Inicia o polling a cada 1.5 segundos
        pollingInterval.current = window.setInterval(checkProStatus, 1500);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [userData?.id]);

    const handleGoHome = () => {
        navigate('/');
    };

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-3xl flex items-center justify-center mb-8">
                    <span className="text-4xl">⏳</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Processamento Lento</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                    Seu pagamento foi aprovado, mas a sincronização está demorando mais que o esperado. Não se preocupe, seu acesso será liberado em instantes.
                </p>
                <button 
                    onClick={handleGoHome}
                    className="w-full max-w-sm bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
                >
                    Ir para o Início
                </button>
            </div>
        );
    }

    if (status === 'activating') {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-8 relative">
                    <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin" />
                    <SparklesIcon className="w-5 h-5 text-blue-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Validando Assinatura...</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    Estamos confirmando os dados com a Stripe. Seus recursos PRO aparecem em alguns segundos.
                </p>
                <div className="mt-8 flex gap-1 justify-center">
                    {[...Array(maxAttempts)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-500 ${i < attempts ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                    ))}
                </div>
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
                Bem-vindo ao nível máximo do FitMind, <strong>{userData?.name}</strong>. Sua transformação agora tem ferramentas de elite.
            </p>

            <div className="w-full max-w-sm space-y-3 mb-12">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 text-left animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Acesso Total Liberado</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">CalorieCam, Treinos IA e Dieta Anti-Rebote ativos.</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleGoHome}
                className="w-full max-w-sm bg-black dark:bg-white text-white dark:text-black py-5 rounded-[24px] text-xl font-bold shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
                Entrar no App PRO
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
        </div>
    );
};
