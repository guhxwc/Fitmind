import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './AppContext';
import { SummaryTab } from './tabs/SummaryTab';
import { MealsTab } from './tabs/MealsTab';
import { WorkoutsTab } from './tabs/WorkoutsTab';
import { ProgressTab } from './tabs/ProgressTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AccountSettings } from './tabs/AccountSettings';
import { ApplicationTab } from './tabs/ApplicationTab';
import { BottomNav } from './core/BottomNav';
import { WEEKDAYS } from '../constants';
import { HelpTab } from './tabs/HelpTab';
import { PrivacySettings } from './tabs/PrivacySettings';

const AppContent: React.FC = () => {
  const { userData, session, loading } = useAppContext();
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


  if (loading || !userData || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-ios-bg dark:bg-ios-dark-bg">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-ios-bg dark:bg-ios-dark-bg max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <main className="flex-grow overflow-y-auto hide-scrollbar pb-28 pt-safe-top">
        <Routes>
          <Route path="/" element={<SummaryTab />} />
          <Route path="/applications" element={<ApplicationTab />} />
          <Route path="/meals" element={<MealsTab />} />
          <Route path="/workouts" element={<WorkoutsTab />} />
          <Route path="/progress" element={<ProgressTab />} />
          <Route path="/settings" element={<SettingsTab />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/help" element={<HelpTab />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
};


export const MainApp: React.FC = () => (
  <AppContextProvider>
    <AppContent />
  </AppContextProvider>
);