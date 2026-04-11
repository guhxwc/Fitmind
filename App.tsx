
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

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
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
      }
    }
  }, [userData, contextLoading]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

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

  useEffect(() => {
    const registerReferral = async () => {
      if (!session?.user?.id) return;

      const affiliateRef =
        localStorage.getItem('affiliate_ref') || sessionStorage.getItem('affiliate_ref');

      console.log("🔍 [Referral Check] Sessão ativa:", session.user.id);
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
          localStorage.removeItem('affiliate_ref');
          sessionStorage.removeItem('affiliate_ref');
          if (result.status === 'registered') {
            console.log("✅ [Referral] Indicação registrada! Código:", result.code);
          } else {
            console.log("ℹ️ [Referral] Indicação já existia no banco.");
          }
        } else {
          if (result.error === 'self_referral' || result.error === 'code_not_found') {
            console.warn("⚠️ [Referral] Código inválido ou auto-indicação:", result.error);
            localStorage.removeItem('affiliate_ref');
            sessionStorage.removeItem('affiliate_ref');
          }
        }
      } catch (err) {
        console.error("💥 [Referral] Erro crítico:", err);
      }
    };

    if (session) {
      registerReferral();
    }
  }, [session]);

  const fetchProfile = async (userId: string) => {
    try {
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
      motivation: userData.motivation,
      main_side_effect: userData.mainSideEffect || null,
      medication: userData.medication,
      notifications: userData.notifications,
      goals: userData.goals,
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
      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) {
        console.error("Error saving profile:", error);
      }
      await fetchData();
      setProfileExists(true);
      setUpsellDismissed(true);
      navigate('/');
    } catch (err) {
      console.error("Critical error during onboarding complete:", err);
      setProfileExists(true);
      navigate('/');
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
        <Route path="/referrals" element={session ? <ReferralDashboard /> : <Navigate to="/auth" />} />
        <Route path="/invite/:code" element={<InviteRedirect />} />

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
                <OnboardingFlow
                  onComplete={handleOnboardingComplete}
                  initialData={userData ? (({ id, ...rest }) => rest)(userData) : undefined}
                />
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
