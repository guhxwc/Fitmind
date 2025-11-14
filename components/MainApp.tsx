
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import type { UserData, Meal, WeightEntry, ProgressPhoto, WorkoutPlan, WorkoutFeedback } from '../types';
import { SummaryTab } from './tabs/SummaryTab';
import { MealsTab } from './tabs/MealsTab';
import { WorkoutsTab } from './tabs/WorkoutsTab';
import { ProgressTab } from './tabs/ProgressTab';
import { SettingsTab } from './tabs/SettingsTab';
import { BottomNav } from './core/BottomNav';
import { SubscriptionPage } from './SubscriptionPage';
import { ProFeatureModal } from './ProFeatureModal';
import { ProUpsellModal } from './ProUpsellModal';
import { PaymentPage } from './PaymentPage';

interface MainAppProps {
  session: Session;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export const MainApp: React.FC<MainAppProps> = ({ session, userData, setUserData }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  
  // App-wide state, fetched from Supabase
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutFeedback[]>([]);

  // Local state (not persisted in this version)
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Ovos com Abacate', time: '08:30', calories: 450, protein: 25 },
    { id: '2', name: 'Frango Grelhado e Salada', time: '13:00', calories: 600, protein: 50 },
  ]);
  const [quickAddProtein, setQuickAddProtein] = useState(0);

  // Subscription flow state
  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [proModal, setProModal] = useState<{type: 'feature' | 'engagement', title?: string} | null>(null);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    
    const { data: weightData } = await supabase.from('weight_history').select('*').eq('user_id', session.user.id).order('date', { ascending: false });
    const { data: photoData } = await supabase.from('progress_photos').select('*').eq('user_id', session.user.id).order('date', { ascending: false });
    const { data: planData } = await supabase.from('workout_plans').select('plan').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).single();
    const { data: workoutHistoryData } = await supabase.from('workout_history').select('*').eq('user_id', session.user.id).order('date', { ascending: false });

    setWeightHistory(weightData || []);
    setProgressPhotos(photoData || []);
    setWorkoutPlan(planData?.plan || null);
    setWorkoutHistory(workoutHistoryData || []);
    
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleShowProModal = (type: 'feature' | 'engagement', title?: string) => {
    if (userData.isPro) return;
    setProModal({ type, title });
  };
  
  const handleOpenSubscription = () => {
    setProModal(null);
    setShowSubscriptionPage(true);
  }

  const handleSubscribe = (plan: 'annual' | 'monthly') => {
    setSelectedPlan(plan);
    setShowSubscriptionPage(false);
    setShowPaymentPage(true);
  };

  const handlePaymentSuccess = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', session.user.id)
      .select()
      .single();
    
    if (data && setUserData) {
        setUserData(data as UserData);
    }
    if (error) {
        console.error("Error updating to PRO:", error);
    }
    setShowPaymentPage(false);
    alert('Pagamento aprovado! Bem-vindo ao FitMind PRO.');
  };


  const renderContent = () => {
    if (loading) return <div className="h-full flex items-center justify-center">Carregando seus dados...</div>;
    
    switch (activeTab) {
      case 'summary':
        return <SummaryTab userData={userData} meals={meals} quickAddProtein={quickAddProtein} setQuickAddProtein={setQuickAddProtein} />;
      case 'settings':
        return <SettingsTab userData={userData} onShowSubscription={() => setShowSubscriptionPage(true)} />;
      case 'meals':
        return <MealsTab userData={userData} meals={meals} setMeals={setMeals} quickAddProtein={quickAddProtein} onShowProModal={handleShowProModal} />;
      case 'workouts':
        return <WorkoutsTab userData={userData} plan={workoutPlan} setPlan={setWorkoutPlan} history={workoutHistory} setHistory={setWorkoutHistory} onShowProModal={handleShowProModal} />;
      case 'progress':
        return <ProgressTab userData={userData} weightHistory={weightHistory} setWeightHistory={setWeightHistory} progressPhotos={progressPhotos} setProgressPhotos={setProgressPhotos} onShowProModal={handleShowProModal} />;
      default:
        return <SummaryTab userData={userData} meals={meals} quickAddProtein={quickAddProtein} setQuickAddProtein={setQuickAddProtein} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-grow overflow-y-auto pb-24">{renderContent()}</main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {showSubscriptionPage && <SubscriptionPage onClose={() => setShowSubscriptionPage(false)} onSubscribe={handleSubscribe} />}
      {showPaymentPage && <PaymentPage plan={selectedPlan} onClose={() => setShowPaymentPage(false)} onPaymentSuccess={handlePaymentSuccess} />}
      {proModal?.type === 'feature' && (
        <ProFeatureModal 
            title={proModal.title || 'Recurso PRO'}
            onClose={() => setProModal(null)}
            onUnlock={handleOpenSubscription}
        />
      )}
      {proModal?.type === 'engagement' && (
        <ProUpsellModal 
            onClose={() => setProModal(null)}
            onUnlock={handleOpenSubscription}
        />
      )}
    </div>
  );
};