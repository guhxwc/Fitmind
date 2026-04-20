import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConsultationUpsell } from './ConsultationUpsell';
import { ConsultationPlans } from './ConsultationPlans';

export const ConsultationRoute: React.FC<{ initialStep?: number }> = ({ initialStep = 1 }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const source = searchParams.get('ref');
    const [step, setStep] = useState<number>(initialStep);

    useEffect(() => {
        // Enforce top scroll on pure mount just to be safe
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.scrollTop = 0;
        }
    }, [step]); // re-trigger on step change

    const handleAcceptUpsell = () => {
        // Advance to step 2: Plans
        setStep(2);
    };

    const handlePlanSelected = async (planId: string) => {
        // Construct custom message based on plan
        const planMap: Record<string, string> = {
            'mensal': 'Mensal',
            'trimestral': 'Trimestral (3 Meses)',
            'semestral': 'Semestral (6 Meses)'
        };
        const planName = planMap[planId] || planId;
        const text = encodeURIComponent(`Olá, vim pelo app e gostaria de assinar a consultoria vip no plano ${planName}.`);
        
        // Temporarily commented out to not trigger WhatsApp randomly
        // window.open(`https://wa.me/554199999999?text=${text}`, '_blank');

        // Garante que o modal de boas-vindas apareça após uma nova confirmação
        localStorage.removeItem('fitmind_consultation_intro');
        
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData?.session;
            if (session?.user?.id) {
                await supabase.rpc('register_consultation', {
                    p_user_id: session.user.id,
                    p_nutritionist_id: '6178130c-e47a-4534-a794-9b80b823766b'
                });
            }
        } catch (e) {
            console.error(e);
        }

        // Redireciona para o processo de anamnese (aba de consultoria)
        setTimeout(() => {
            navigate('/consultation', { replace: true });
        }, 100);
    };

    const handleDecline = () => {
        if (source === 'success') {
            navigate('/', { replace: true });
        } else {
            navigate(-1); // Back to settings
        }
    };

    const handleBackFromPlans = () => {
        setStep(1);
    };

    return (
        <div className="w-full min-h-[100dvh] bg-[#e5e5e5] dark:bg-[#111111] relative z-[99999]">
            {step === 1 ? (
                <ConsultationUpsell 
                    onAccept={handleAcceptUpsell} 
                    onDecline={handleDecline} 
                />
            ) : (
                <ConsultationPlans 
                    onPlanSelected={handlePlanSelected}
                    onBack={handleBackFromPlans}
                />
            )}
        </div>
    );
};
