import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { ConsultationDashboard } from '../consultation/ConsultationDashboard';
import { AnamnesisForm } from '../consultation/AnamnesisForm';
import { WelcomeConsultation } from '../consultation/WelcomeConsultation';
import { ConsultationPlans } from '../payment/ConsultationPlans';

export const ConsultationTab: React.FC = () => {
    const { session, consultationStatus, setConsultationStatus, fetchData } = useAppContext();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [showPlans, setShowPlans] = useState(false);
    const [pollingMsg, setPollingMsg] = useState('');

    const fetchConsultation = useCallback(async () => {
        // Buscar sessão diretamente se AppContext não tiver ainda
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const userId = session?.user?.id || currentSession?.user?.id;
        if (!userId) return null;

        const { data, error } = await supabase
            .from('consultations')
            .select('status')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar consultoria:', error);
        }
        return data?.status ?? null;
    }, [session?.user?.id]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const justPaid = searchParams.get('payment_success') === 'true';

            if (justPaid) {
                // Polling: aguarda o webhook criar a consultation (até 10s)
                setPollingMsg('Ativando sua consultoria...');
                let status: string | null = null;
                for (let i = 0; i < 5; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    status = await fetchConsultation();
                    if (status) break;
                    setPollingMsg(`Aguardando confirmação... (${i + 1}/5)`);
                }
                if (!status) {
                    // Se o webhook demorou, criar a consultation manualmente
                    const { data: { session: s } } = await supabase.auth.getSession();
                    const userId = s?.user?.id;
                    if (userId) {
                        await supabase.rpc('register_consultation', {
                            p_user_id: userId,
                            p_nutritionist_id: '6178130c-e47a-4534-a794-9b80b823766b'
                        });
                        status = await fetchConsultation();
                    }
                }
                setPollingMsg('');
                setConsultationStatus(status);
            } else {
                const status = await fetchConsultation();
                setConsultationStatus(status);
            }

            setLoading(false);
        };

        init();
    }, [session?.user?.id]);

    const handleCreateConsultation = async () => {
        const { data: { session: s } } = await supabase.auth.getSession();
        const userId = s?.user?.id;
        if (!userId) return;
        setLoading(true);
        try {
            await supabase.rpc('register_consultation', {
                p_user_id: userId,
                p_nutritionist_id: '6178130c-e47a-4534-a794-9b80b823766b'
            });
            const status = await fetchConsultation();
            setConsultationStatus(status);
        } catch (err) {
            console.error('Erro ao registrar consultoria', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#F2F2F7] dark:bg-black gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent animate-spin rounded-full" />
                {pollingMsg && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{pollingMsg}</p>
                )}
            </div>
        );
    }

    // Sem consultoria — mostrar vendas ou planos
    if (!consultationStatus) {
        if (showPlans) {
            return (
                <ConsultationPlans
                    onPlanSelected={() => {}}
                    onBack={() => setShowPlans(false)}
                />
            );
        }
        return <WelcomeConsultation onStart={() => setShowPlans(true)} />;
    }

    // Anamnese pendente
    if (consultationStatus === 'pending') {
        return <AnamnesisForm onSuccess={async () => {
            const status = await fetchConsultation();
            setConsultationStatus(status);
        }} />;
    }

    // Anamnese feita ou ativa
    return <ConsultationDashboard status={consultationStatus} onReload={async () => {
        const status = await fetchConsultation();
        setConsultationStatus(status);
    }} />;
};