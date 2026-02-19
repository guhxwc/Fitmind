import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ArrowPathIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, userData } = useAppContext();
    const [status, setStatus] = useState<'activating' | 'error'>('activating');
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
                
                // Em vez de renderizar o sucesso aqui, redirecionamos para a tela centralizada maravilhosa
                navigate('/welcome-pro', { replace: true });
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
};