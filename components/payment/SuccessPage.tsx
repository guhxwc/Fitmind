
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, userData } = useAppContext();
    const pollingInterval = useRef<number | null>(null);
    const attempts = useRef(0);
    const maxAttempts = 20; // Aproximadamente 30 segundos de tentativa

    const checkProStatus = async () => {
        if (!userData?.id) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', userData.id)
                .single();

            if (error) throw error;

            if (data?.is_pro) {
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                
                // Configura as flags para o Tour Guide e remove rastros de onboarding
                localStorage.setItem('trigger_pro_tour', 'true');
                localStorage.setItem('has_seen_onboarding', 'true');
                localStorage.removeItem('onboarding_step');

                // Sincroniza os dados globais silenciosamente
                await fetchData(); 
                
                // Redireciona imediatamente para a dashboard
                navigate('/', { replace: true });
            } else {
                attempts.current += 1;
                if (attempts.current >= maxAttempts) {
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                    // Redireciona mesmo se falhar o polling, o sync de fundo do AppContext resolverá depois
                    navigate('/', { replace: true });
                }
            }
        } catch (err) {
            console.error("Erro ao verificar status PRO:", err);
        }
    };

    useEffect(() => {
        // Inicia verificação imediata e depois em intervalo
        checkProStatus();
        pollingInterval.current = window.setInterval(checkProStatus, 1500);
        
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [userData?.id]);

    // Renderiza apenas um estado de transição minimalista e elegante (iOS-style loader)
    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-6 tracking-tight">Ativando sua conta PRO</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Finalizando sua assinatura com a Stripe...</p>
        </div>
    );
};
