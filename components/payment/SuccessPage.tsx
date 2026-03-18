import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, session } = useAppContext();
    const [statusMsg, setStatusMsg] = useState('Ativando sua conta PRO...');

    useEffect(() => {
        if (!session) {
            navigate('/auth', { replace: true });
            return;
        }
        activatePro();
    }, [session]);

    const activatePro = async () => {
        if (!session) return;
        const userId = session.user.id;

        try {
            // 1. Verifica se já está Pro (webhook pode ter chegado rápido)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_pro, subscription_status')
                .eq('id', userId)
                .maybeSingle();

            const alreadyPro = profile?.is_pro || profile?.subscription_status === 'active';

            if (alreadyPro) {
                await finish();
                return;
            }

            // 2. Se o perfil não existe, cria com dados do onboarding
            if (!profile) {
                const savedData = localStorage.getItem('onboarding_userData');
                const parsed = savedData ? JSON.parse(savedData) : {};
                
                const { error } = await supabase.from('profiles').upsert({
                    id: userId,
                    name: parsed.name || 'Usuário',
                    gender: parsed.gender || null,
                    age: parsed.age || null,
                    birth_date: parsed.birthDate || null,
                    height: parsed.height || null,
                    weight: parsed.weight || null,
                    target_weight: parsed.targetWeight || null,
                    start_weight: parsed.startWeight || null,
                    start_weight_date: parsed.startWeightDate || new Date().toISOString(),
                    activity_level: parsed.activityLevel || null,
                    glp_status: parsed.glpStatus || null,
                    application_frequency: parsed.applicationFrequency || null,
                    pace: parsed.pace || null,
                    motivation: parsed.motivation || [],
                    main_side_effect: parsed.mainSideEffect || null,
                    medication: parsed.medication || null,
                    notifications: parsed.notifications || null,
                    goals: parsed.goals || null,
                    streak: 0,
                    last_activity_date: new Date().toISOString(),
                });

                if (error) throw error;
            }

            // 3. Invoca a função de sync (opcional, mas recomendado se existir)
            setStatusMsg('Sincronizando assinatura...');
            try {
                await supabase.functions.invoke('stripe-webhook-sync-profile');
            } catch (e) {
                console.warn('Falha ao invocar sync function:', e);
            }

            // 4. Polling (máximo 10 segundos)
            setStatusMsg('Confirmando status PRO...');
            let attempts = 0;
            const maxAttempts = 5; // 5 vezes a cada 2 segundos = 10s
            
            while (attempts < maxAttempts) {
                const { data: updatedProfile } = await supabase
                    .from('profiles')
                    .select('is_pro, subscription_status')
                    .eq('id', userId)
                    .maybeSingle();
                
                if (updatedProfile?.is_pro || updatedProfile?.subscription_status === 'active') {
                    break;
                }
                
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            await finish();

        } catch (err) {
            console.error('Erro ao ativar PRO:', err);
            await finish();
        }
    };

    const finish = async () => {
        localStorage.setItem('trigger_pro_tour', 'true');
        localStorage.setItem('has_seen_onboarding', 'true');
        localStorage.removeItem('onboarding_step');
        localStorage.removeItem('affiliate_ref');
        await fetchData();
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-gray-100 dark:border-gray-800 rounded-full" />
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Bem-vindo ao PRO! 🎉
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{statusMsg}</p>
        </div>
    );
};