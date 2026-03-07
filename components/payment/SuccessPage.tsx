import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, session } = useAppContext();
    const pollingInterval = useRef<number | null>(null);
    const attempts = useRef(0);
    const maxAttempts = 40; // ~60 segundos (40 x 1500ms)
    const [statusMsg, setStatusMsg] = useState('Confirmando pagamento com a Stripe...');

    const checkProStatus = async () => {
        if (!session) {
            navigate('/auth', { replace: true });
            return;
        }

        const userId = session.user.id;
        attempts.current += 1;

        // Atualiza mensagem conforme o tempo passa
        if (attempts.current > 10) setStatusMsg('Aguardando confirmação do banco...');
        if (attempts.current > 20) setStatusMsg('Quase lá, finalizando...');

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_pro, subscription_status')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;

            const isPro = data?.is_pro || data?.subscription_status === 'active';

            if (isPro) {
                // ✅ Confirmado como PRO
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                localStorage.setItem('trigger_pro_tour', 'true');
                localStorage.setItem('has_seen_onboarding', 'true');
                localStorage.removeItem('onboarding_step');
                localStorage.removeItem('affiliate_ref'); // limpa ref após conversão
                await fetchData();
                navigate('/', { replace: true });
                return;
            }

            // Perfil não existe ainda — pagou antes de completar onboarding
            if (!data) {
                const savedData = localStorage.getItem('onboarding_userData');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    const { error: upsertError } = await supabase.from('profiles').upsert({
                        id: userId,
                        name: parsed.name || 'Usuário',
                        gender: parsed.gender,
                        age: parsed.age,
                        birth_date: parsed.birthDate || null,
                        height: parsed.height,
                        weight: parsed.weight,
                        target_weight: parsed.targetWeight,
                        start_weight: parsed.startWeight,
                        start_weight_date: parsed.startWeightDate || new Date().toISOString(),
                        activity_level: parsed.activityLevel,
                        glp_status: parsed.glpStatus,
                        application_frequency: parsed.applicationFrequency,
                        pace: parsed.pace,
                        motivation: parsed.motivation,
                        main_side_effect: parsed.mainSideEffect || null,
                        medication: parsed.medication,
                        notifications: parsed.notifications,
                        goals: parsed.goals,
                        streak: 0,
                        last_activity_date: new Date().toISOString(),
                        is_pro: true,
                        subscription_status: 'active',
                        journey_duration: parsed.journeyDuration || null,
                        biggest_frustration: parsed.biggestFrustration || null,
                        future_worry: parsed.futureWorry || null,
                        one_thing_guaranteed: parsed.oneThingGuaranteed || null,
                        dream_outcome: parsed.dreamOutcome || null,
                        monthly_investment: parsed.monthlyInvestment || null,
                    });

                    if (!upsertError) {
                        if (pollingInterval.current) clearInterval(pollingInterval.current);
                        localStorage.setItem('trigger_pro_tour', 'true');
                        localStorage.setItem('has_seen_onboarding', 'true');
                        localStorage.removeItem('onboarding_step');
                        localStorage.removeItem('affiliate_ref');
                        await fetchData();
                        navigate('/', { replace: true });
                        return;
                    }
                }
            }

            // Esgotou tentativas — força atualização manual e redireciona
            if (attempts.current >= maxAttempts) {
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                // Tenta forçar is_pro=true diretamente (caso webhook tenha atrasado muito)
                await supabase
                    .from('profiles')
                    .update({ is_pro: true, subscription_status: 'active' })
                    .eq('id', userId);
                localStorage.setItem('has_seen_onboarding', 'true');
                localStorage.removeItem('affiliate_ref');
                await fetchData();
                navigate('/', { replace: true });
            }

        } catch (err) {
            console.error('Erro ao verificar status PRO:', err);
        }
    };

    useEffect(() => {
        if (!session) {
            navigate('/auth', { replace: true });
            return;
        }
        checkProStatus();
        pollingInterval.current = window.setInterval(checkProStatus, 1500);
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [session]);

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-gray-100 dark:border-gray-800 rounded-full" />
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Ativando sua conta PRO
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{statusMsg}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-6 max-w-xs">
                Isso pode levar alguns segundos. Não feche essa página.
            </p>
        </div>
    );
};