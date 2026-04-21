import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MainApp } from './components/MainApp';
import { Auth } from './components/Auth';
import { useAppContext } from './components/AppContext';
import type { UserData } from './types';
import { SupabaseSetupMessage } from './components/SupabaseSetupMessage';
import { DEFAULT_USER_DATA } from './constants';
import { InitialSettings } from './components/tabs/InitialSettings';
import { TermsPage } from './components/legal/TermsPage';
import { PrivacyPage } from './components/legal/PrivacyPage';
import { SuccessPage } from './components/payment/SuccessPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { ReferralDashboard } from './components/ReferralDashboard';
import { useToast } from './components/ToastProvider';
import { NotificationSystem } from './components/NotificationSystem';
import { TrialResultsScreen } from './components/TrialResultsScreen';
import { StepFinalPlan } from './components/onboarding/StepFinalPlan';

import { ConsultationRoute } from './components/payment/ConsultationRoute';
import { ConsultationDashboard } from './components/consultation/ConsultationDashboard';
import { AnamnesisForm } from './components/consultation/AnamnesisForm';
import { DietPlanPage } from './components/consultation/DietPlanPage';
import { SubscriptionPage } from './components/SubscriptionPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Target the #root element which is the scroll container in index.html
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.scrollTop = 0;
        rootElement.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    scrollToTop();
    const timeoutId = setTimeout(scrollToTop, 0);
    const timeoutId2 = setTimeout(scrollToTop, 100);
    const rafId = requestAnimationFrame(scrollToTop);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return null;
};


// Redireciona /invite/:code para /?ref=:code (compatibilidade com links antigos)
const InviteRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  if (code) {
    localStorage.setItem('affiliate_ref', code.toUpperCase());
    sessionStorage.setItem('affiliate_ref', code.toUpperCase());
  }
  return <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const { userData, loading: contextLoading, fetchData } = useAppContext();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (!contextLoading && userData) {
      if (userData.isPro) {
        localStorage.removeItem('trigger_pro_tour');
        localStorage.removeItem('trial_results_dismissed');
        localStorage.removeItem('trial_final_plan_dismissed');
      }
    }
  }, [userData, contextLoading]);

  useEffect(() => {
    // Desativar a restauração automática de scroll do navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Limpa a URL caso o Supabase jogue o usuário de volta com o token gigante
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      if (window.location.hash.includes('type=signup')) {
        addToast("Conta verificada e criada com sucesso!", "success");
      }
      setTimeout(() => {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }, 500);
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
          supabase.auth.signOut();
          setSession(null);
        }
      } else {
        setSession(session);
        if (session) fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
      
      if (_event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setProfileExists(null);
      } else {
        setSession(session);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── REGISTRO DE INDICAÇÃO ─────────────────────────────────────────────────
  // Função separada para poder ser chamada em dois momentos:
  // 1. Quando a sessão muda (login normal)
  // 2. Na montagem do app (usuário JÁ estava logado e abriu o link ?ref=)
  const registerReferralIfNeeded = async (userId: string) => {
    const affiliateRef =
      localStorage.getItem('affiliate_ref') || sessionStorage.getItem('affiliate_ref');

    console.log("🔍 [Referral Check] Sessão ativa:", userId);
    console.log("🔍 [Referral Check] Código encontrado:", affiliateRef || 'NENHUM');

    if (!affiliateRef) return;

    try {
      const { data, error } = await supabase.rpc('register_referral', {
        p_affiliate_ref: affiliateRef
      });

      if (error) {
        console.error("❌ [Referral] Erro RPC:", error.message);
        return;
      }

      const result = data as { success: boolean; status?: string; error?: string; code?: string };
      console.log("📋 [Referral] Resultado:", result);

      if (result.success) {
        // NÃO limpa o localStorage — PaymentPage ainda precisa do código
        if (result.status === 'registered') {
          console.log("✅ [Referral] Indicação registrada! Código:", result.code);
        } else {
          console.log("ℹ️ [Referral] Indicação já existia no banco.");
        }
      } else {
        if (result.error === 'self_referral' || result.error === 'code_not_found') {
          console.warn("⚠️ [Referral] Código inválido:", result.error);
          localStorage.removeItem('affiliate_ref');
          sessionStorage.removeItem('affiliate_ref');
        }
      }
    } catch (err) {
      console.error("💥 [Referral] Erro crítico:", err);
    }
  };

  // Dispara quando a sessão MUDA (novo login)
  useEffect(() => {
    if (session?.user?.id) {
      registerReferralIfNeeded(session.user.id);
    }
  }, [session]);

  // Dispara na MONTAGEM do app — cobre o caso onde o usuário JÁ estava logado
  // e abriu o link ?ref= sem precisar fazer login novamente
  useEffect(() => {
    const checkOnMount = async () => {
      // Pequeno delay para o script do index.html ter tempo de salvar no localStorage
      await new Promise(r => setTimeout(r, 300));
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user?.id) {
        const hasRef = localStorage.getItem('affiliate_ref') || sessionStorage.getItem('affiliate_ref');
        if (hasRef) {
          console.log('🔁 [Referral] Usuário já logado, verificando código na montagem...');
          registerReferralIfNeeded(currentSession.user.id);
        }
      }
    };
    checkOnMount();
  }, []); // só na montagem

  const fetchProfile = async (userId: string) => {
    try {
      console.log("🔍 Buscando perfil do usuário:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfileExists(!!data);
    } catch (err) {
      console.error("❌ Erro ao buscar perfil:", err);
    }
  };

  const handleOnboardingComplete = async (userData: Omit<UserData, 'id'>) => {
    if (!session) return;

    const profileData = {
      id: session.user.id,
      name: userData.name || 'Usuário',
      gender: userData.gender,
      age: userData.age,
      birth_date: (userData.birthDate && typeof userData.birthDate === 'string' && userData.birthDate.includes('-')) ? userData.birthDate : null,
      height: userData.height,
      weight: userData.weight,
      target_weight: userData.targetWeight,
      start_weight: userData.startWeight,
      start_weight_date: userData.startWeightDate || new Date().toISOString(),
      activity_level: userData.activityLevel,
      glp_status: userData.glpStatus,
      application_frequency: userData.applicationFrequency,
      pace: userData.pace,
      motivation: Array.isArray(userData.motivation) ? userData.motivation : (userData.motivation ? [userData.motivation] : []),
      main_side_effect: userData.mainSideEffect || null,
      medication: userData.medication || null,
      notifications: userData.notifications || null,
      goals: userData.goals || null,
      streak: userData.streak || 0,
      last_activity_date: userData.lastActivityDate || new Date().toISOString(),
      journey_duration: userData.journeyDuration || null,
      biggest_frustration: userData.biggestFrustration || null,
      future_worry: userData.futureWorry || null,
      one_thing_guaranteed: userData.oneThingGuaranteed || null,
      dream_outcome: userData.dreamOutcome || null,
      monthly_investment: userData.monthlyInvestment || null,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });
      if (error) {
        console.error("Error saving profile:", error);
        return; // Early return to prevent navigation on error
      } else {
        console.log("✅ Profile salvo com sucesso no onboarding.");
      }
      await fetchData();
      setProfileExists(true);
      setUpsellDismissed(true);
      navigate('/');
    } catch (err) {
      console.error("Critical error during onboarding complete:", err);
      return; // Early return to prevent navigation on error
    }
  };

  if (contextLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <NotificationSystem />
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/consultoria" element={<ConsultationRoute />} />
        <Route path="/consultoria-premium" element={<ConsultationDashboard />} />
        <Route path="/anamnese" element={<AnamnesisForm />} />
        <Route path="/dieta" element={<DietPlanPage />} />
        <Route path="/assinaturas" element={<ConsultationRoute initialStep={2} />} />
        <Route path="/referrals" element={session ? <ReferralDashboard /> : <Navigate to="/auth" />} />
        
        <Route path="/*" element={
          session ? (
            profileExists === null ? (
              <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
              </div>
            ) : profileExists ? (
              (userData?.isPro || upsellDismissed || localStorage.getItem('trigger_pro_tour') === 'true') ? (
                <MainApp />
              ) : (
                ['canceled', 'past_due', 'unpaid'].includes(userData?.subscriptionStatus || '') ? (
                  !localStorage.getItem('trial_results_dismissed') ? (
                    <TrialResultsScreen onClose={() => {
                      localStorage.setItem('trial_results_dismissed', 'true');
                      window.location.reload();
                    }} />
                  ) : !localStorage.getItem('trial_final_plan_dismissed') ? (
                    <StepFinalPlan 
                      data={userData ? (({ id, ...rest }) => rest)(userData) : DEFAULT_USER_DATA}
                      buttonLabel="Renovar Assinatura"
                      onNext={() => {
                        localStorage.setItem('trial_final_plan_dismissed', 'true');
                        window.location.reload();
                      }}
                      onBack={() => {
                        localStorage.removeItem('trial_results_dismissed');
                        window.location.reload();
                      }}
                    />
                  ) : (
                    <SubscriptionPage 
                      onClose={() => setUpsellDismissed(true)} 
                      onSubscribe={() => {
                        setUpsellDismissed(true);
                        window.location.reload();
                      }}
                      customUserData={userData ? (({ id, ...rest }) => rest)(userData) : undefined}
                    />
                  )
                ) : (
                  <OnboardingFlow 
                    onComplete={handleOnboardingComplete} 
                    initialData={userData ? (({ id, ...rest }) => rest)(userData) : undefined} 
                  />
                )
              )
            ) : (
              <OnboardingFlow onComplete={handleOnboardingComplete} />
            )
          ) : (
            <Navigate to="/auth" />
          )
        } />
        
        <Route path="/settings/initial-setup" element={session ? <InitialSettings /> : <Navigate to="/auth" />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  if (!supabase) {
    return (
      <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto shadow-lg">
        <SupabaseSetupMessage />
      </div>
    );
  }

  return <AppContent />;
};

export default App;
