import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { CheckCircleIcon, ChevronRightIcon, SparklesIcon } from '../core/Icons';
import { ConsultationUpsell } from './ConsultationUpsell';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { fetchData, session } = useAppContext();
    const [statusMsg, setStatusMsg] = useState('Ativando sua conta PRO...');
    const [isPolling, setIsPolling] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        const sessionId = searchParams.get('session_id');
        
        setIsPolling(true);
        setError(null);

        try {
            // 1. Tenta forçar uma sincronização via Edge Function se tivermos o sessionId
            if (sessionId) {
                setStatusMsg('Sincronizando com o Stripe...');
                try {
                    const { data: syncData, error: syncError } = await supabase.functions.invoke('stripe-sync-profile', {
                        body: { sessionId, userId }
                    });
                    
                    if (!syncError && syncData?.isPro) {
                        setIsConfirmed(true);
                        setIsPolling(false);
                        setStatusMsg('Assinatura PRO ativada com sucesso!');
                        setTimeout(() => navigate('/', { replace: true }), 2000);
                        return;
                    }
                } catch (syncErr) {
                    console.error('Erro na sincronização forçada:', syncErr);
                    // Continua para o polling normal se a sincronização falhar
                }
            }

            // 2. Verifica se já está Pro no banco (webhook pode ter chegado rápido)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_pro, subscription_status')
                .eq('id', userId)
                .maybeSingle();

            const alreadyPro = profile?.is_pro || profile?.subscription_status === 'active';

            if (alreadyPro) {
                setIsConfirmed(true);
                setIsPolling(false);
                setStatusMsg('Status PRO confirmado!');
                setTimeout(() => navigate('/', { replace: true }), 2000);
                return;
            }

            // 3. Se o perfil não existe, cria com dados do onboarding
            if (!profile) {
                setStatusMsg('Criando seu perfil...');
                const savedData = localStorage.getItem('onboarding_userData');
                const parsed = savedData ? JSON.parse(savedData) : {};
                
                const { error: upsertError } = await supabase.from('profiles').upsert({
                    id: userId,
                    name: parsed.name || 'Usuário',
                    gender: parsed.gender || null,
                    age: parsed.age || null,
                    birth_date: (parsed.birthDate && typeof parsed.birthDate === 'string' && parsed.birthDate.includes('-')) ? parsed.birthDate : null,
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

                if (upsertError) throw upsertError;
            }

            // 4. Polling (máximo 30 segundos)
            setStatusMsg('Aguardando confirmação do pagamento...');
            let attempts = 0;
            const maxAttempts = 15; // 15 vezes a cada 2 segundos = 30s
            
            while (attempts < maxAttempts) {
                const { data: updatedProfile } = await supabase
                    .from('profiles')
                    .select('is_pro, subscription_status')
                    .eq('id', userId)
                    .maybeSingle();
                
                if (updatedProfile?.is_pro || updatedProfile?.subscription_status === 'active') {
                    setIsConfirmed(true);
                    setIsPolling(false);
                    setStatusMsg('Assinatura confirmada com sucesso!');
                    setTimeout(() => navigate('/', { replace: true }), 2000);
                    return;
                }
                
                attempts++;
                if (attempts > 5) setStatusMsg(`Aguardando confirmação (Tentativa ${attempts}/${maxAttempts})...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Se chegou aqui, o polling falhou
            setIsPolling(false);
            setStatusMsg('O pagamento foi processado, mas o status PRO ainda não foi atualizado.');
            setError('A confirmação está demorando um pouco mais que o esperado. Não se preocupe, sua conta será ativada automaticamente em alguns minutos.');

        } catch (err) {
            console.error('Erro ao ativar PRO:', err);
            setIsPolling(false);
            setError('Ocorreu um erro ao verificar sua assinatura. Por favor, tente atualizar a página.');
        }
    };

    const finish = async () => {
        localStorage.setItem('trigger_pro_tour', 'true');
        localStorage.setItem('has_seen_onboarding', 'true');
        localStorage.removeItem('onboarding_step');
        localStorage.removeItem('affiliate_ref');

        // Converter indicação pendente para 'converted' se existir
        try {
            const { data: referral } = await supabase
                .from('referrals')
                .select('id, status')
                .eq('user_id', session?.user.id)
                .in('status', ['pending', 'accepted'])
                .maybeSingle();

            if (referral) {
                // O webhook já deve ter feito isso, mas garantimos via front como fallback
                await supabase
                    .from('referrals')
                    .update({ status: 'completed' })
                    .eq('id', referral.id)
                    .neq('status', 'completed'); // idempotente
                console.log('Indicação convertida para PRO!');
            }
        } catch (err) {
            console.error('Erro ao converter indicação:', err);
        }

        await fetchData();
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-8">
                {isPolling ? (
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-100 dark:border-gray-800 rounded-full" />
                        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
                    </div>
                ) : isConfirmed ? (
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 animate-bounce-in">
                        <CheckCircleIcon className="w-12 h-12" />
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-500">
                        <SparklesIcon className="w-10 h-10" />
                    </div>
                )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                {isConfirmed ? 'Bem-vindo ao PRO! 🎉' : 'Quase lá...'}
            </h1>
            
            <p className={`text-sm font-medium mb-6 ${isConfirmed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {statusMsg}
            </p>

            {error && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl mb-8 max-w-sm">
                    <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                        {error}
                    </p>
                </div>
            )}

            {!isPolling && (
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    {!isConfirmed && (
                        <button 
                            onClick={activatePro}
                            className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            Verificar Novamente
                        </button>
                    )}
                    <button 
                        onClick={finish}
                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                        Ir para o Início <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="mt-12 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-bold">
                FitMind Health Technologies
            </div>
        </div>
    );
};