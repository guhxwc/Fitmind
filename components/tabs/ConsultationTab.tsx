import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { ConsultationDashboard } from '../consultation/ConsultationDashboard';
import { AnamnesisForm } from '../consultation/AnamnesisForm';
import { WelcomeConsultation } from '../consultation/WelcomeConsultation';
import { ConsultationPlans } from '../payment/ConsultationPlans';

export const ConsultationTab: React.FC = () => {
    const { session } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [showPlans, setShowPlans] = useState(false);
    const [consultationStatus, setConsultationStatus] = useState<string | null>(null);

    const fetchConsultation = async () => {
        if (!session?.user?.id) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('consultations')
                .select('status')
                .eq('user_id', session.user.id)
                .maybeSingle();
            
            if (error && error.code !== 'PGRST116') {
                console.error("Erro ao buscar consultoria:", error);
            }
            if (data) {
                setConsultationStatus(data.status);
            } else {
                setConsultationStatus(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultation();
    }, [session?.user?.id]);

    const handleCreateConsultation = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('register_consultation', {
                p_user_id: session.user.id,
                p_nutritionist_id: '6178130c-e47a-4534-a794-9b80b823766b'
            });
            if (error) throw error;
            if (data && data.success) {
                await fetchConsultation();
            }
        } catch (error) {
            console.error("Erro ao registrar consultoria", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F2F2F7] dark:bg-black">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent flex items-center justify-center animate-spin rounded-full"></div>
            </div>
        );
    }

    if (!consultationStatus) {
        if (showPlans) {
            return (
                <ConsultationPlans 
                    onPlanSelected={(planId) => {
                        console.log('Plano selecionado:', planId);
                        // O redirecionamento agora acontece dentro do componente ConsultationPlans
                    }} 
                    onBack={() => setShowPlans(false)} 
                />
            );
        }
        return <WelcomeConsultation onStart={() => setShowPlans(true)} />;
    }

    if (consultationStatus === 'pending' || consultationStatus === 'anamnese_done' || consultationStatus === 'active') {
        return <ConsultationDashboard status={consultationStatus} onReload={fetchConsultation} />;
    }

    return <ConsultationDashboard status={consultationStatus} onReload={fetchConsultation} />;
};
