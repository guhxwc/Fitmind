import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './AppContext';
import { useToast } from './ToastProvider';
import { SummaryTab } from './tabs/SummaryTab';
import { MealsTab } from './tabs/MealsTab';
import { WorkoutsTab } from './tabs/WorkoutsTab';
import { ProgressTab } from './tabs/ProgressTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AccountSettings } from './tabs/AccountSettings';
import { ApplicationTab } from './tabs/ApplicationTab';
import { BottomNav } from './core/BottomNav';
import { SubscriptionPage } from './SubscriptionPage';
import { ProFeatureModal } from './ProFeatureModal';
import { ProUpsellModal } from './ProUpsellModal';
import { PaymentPage } from './PaymentPage';
import { WEEKDAYS } from '../constants';
import { HelpTab } from './tabs/HelpTab';
import { PrivacySettings } from './tabs/PrivacySettings';
import { ProPlanTab } from './tabs/ProPlanTab';

const AppContent: React.FC = () => {
  const { userData, session, setUserData, loading } = useAppContext();
  const { addToast } = useToast();

  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [proModal, setProModal] = useState<{ type: 'feature' | 'engagement', title?: string } | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous timeout whenever userData changes
    if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
    }

    if (userData?.medicationReminder?.enabled && userData.medication.nextApplication && userData.medicationReminder.time) {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

        const { nextApplication } = userData.medication;
        const reminderTime = userData.medicationReminder.time; // e.g., "09:00"

        const today = new Date();
        const todayDayIndex = today.getDay(); // Sunday is 0
        const targetDayName = nextApplication;
        
        const targetDayIndex = WEEKDAYS.indexOf(targetDayName);

        if (targetDayIndex === -1) return;

        let dayDifference = targetDayIndex - todayDayIndex;
        
        const [hours, minutes] = reminderTime.split(':').map(Number);
        
        const now = new Date();
        const potentialReminderDateForToday = new Date();
        potentialReminderDateForToday.setHours(hours, minutes, 0, 0);

        if (dayDifference === 0 && now > potentialReminderDateForToday) { // If it's today but time has passed
            dayDifference = 7;
        } else if (dayDifference < 0) { // If the day has passed this week
            dayDifference += 7;
        }

        const nextReminderDate = new Date();
        nextReminderDate.setDate(today.getDate() + dayDifference);
        nextReminderDate.setHours(hours, minutes, 0, 0);

        const delay = nextReminderDate.getTime() - now.getTime();

        if (delay > 0) {
            notificationTimeoutRef.current = window.setTimeout(() => {
                 new Notification('FitMind: Lembrete de Aplicação', {
                    body: `Olá, ${userData.name}! Está na hora de registrar sua aplicação de ${userData.medication.name}.`,
                    // You can add an icon if you have one in your public folder
                    // icon: '/logo.png' 
                });
            }, delay);
        }
    }

    // Cleanup on unmount
    return () => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
    };
}, [userData]);


  const handleShowProModal = (type: 'feature' | 'engagement', title?: string) => {
    if (userData?.isPro) return;
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
    if (setUserData) {
      setUserData(prev => prev ? { ...prev, isPro: true } : null);
    }
    setShowPaymentPage(false);
    addToast('Pagamento aprovado! Bem-vindo ao FitMind PRO.', 'success');
  };

  if (loading || !userData || !session) {
    return <div className="h-full flex items-center justify-center text-gray-800 dark:text-gray-200">Carregando seus dados...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      <main className="flex-grow overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<SummaryTab />} />
          <Route path="/applications" element={<ApplicationTab />} />
          <Route path="/meals" element={<MealsTab onShowProModal={handleShowProModal} />} />
          <Route path="/workouts" element={<WorkoutsTab onShowProModal={handleShowProModal} />} />
          <Route path="/progress" element={<ProgressTab onShowProModal={handleShowProModal} />} />
          <Route path="/settings" element={<SettingsTab onShowSubscription={() => setShowSubscriptionPage(true)} />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/help" element={<HelpTab />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/pro" element={<ProPlanTab />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <BottomNav />

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


export const MainApp: React.FC = () => (
  <AppContextProvider>
    <AppContent />
  </AppContextProvider>
);