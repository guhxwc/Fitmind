
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, userData, session } = useAppContext();
    const pollingInterval = useRef<number | null>(null);
    const attempts = useRef(0);
    const maxAttempts = 20; // Aproximadamente 30 segundos de tentativa

    const checkProStatus = async () => {
        if (!session) {
            navigate('/auth', { replace: true });
            return;
        }
        
        // Use session.user.id instead of userData?.id because userData might not be loaded yet
        const userId = session.user.id;
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', userId)
                .maybeSingle();

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
            } else if (!data) {
                // Profile doesn't exist yet! The user paid before finishing onboarding.
                // Let's create the profile using the saved onboarding data.
                const savedData = localStorage.getItem('onboarding_userData');
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    const profileData = {
                        id: userId,
                        name: parsedData.name || 'Usuário',
                        gender: parsedData.gender,
                        age: parsedData.age,
                        birth_date: parsedData.birthDate || null,
                        height: parsedData.height,
                        weight: parsedData.weight,
                        target_weight: parsedData.targetWeight,
                        start_weight: parsedData.startWeight,
                        start_weight_date: parsedData.startWeightDate || new Date().toISOString(),
                        activity_level: parsedData.activityLevel,
                        glp_status: parsedData.glpStatus,
                        application_frequency: parsedData.applicationFrequency,
                        pace: parsedData.pace,
                        motivation: parsedData.motivation,
                        main_side_effect: parsedData.mainSideEffect || null,
                        medication: parsedData.medication,
                        notifications: parsedData.notifications,
                        goals: parsedData.goals,
                        streak: parsedData.streak || 0,
                        last_activity_date: parsedData.lastActivityDate || new Date().toISOString(),
                        is_pro: true, // They just paid!
                        subscription_status: 'active',
                        journey_duration: parsedData.journeyDuration || null,
                        biggest_frustration: parsedData.biggestFrustration || null,
                        future_worry: parsedData.futureWorry || null,
                        one_thing_guaranteed: parsedData.oneThingGuaranteed || null,
                        dream_outcome: parsedData.dreamOutcome || null,
                        monthly_investment: parsedData.monthlyInvestment || null,
                    };
                    
                    const { error: upsertError } = await supabase.from('profiles').upsert(profileData);
                    
                    if (!upsertError) {
                        if (pollingInterval.current) clearInterval(pollingInterval.current);
                        localStorage.setItem('trigger_pro_tour', 'true');
                        localStorage.setItem('has_seen_onboarding', 'true');
                        localStorage.removeItem('onboarding_step');
                        await fetchData();
                        navigate('/', { replace: true });
                        return;
                    } else {
                        console.error("Erro ao criar perfil:", upsertError);
                    }
                }
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
        if (!session) {
            navigate('/auth', { replace: true });
            return;
        }
        // Inicia verificação imediata e depois em intervalo
        checkProStatus();
        pollingInterval.current = window.setInterval(checkProStatus, 1500);
        
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [session, navigate]);

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
