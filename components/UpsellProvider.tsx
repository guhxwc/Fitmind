import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from './AppContext';
import { useUpsellModal } from '../hooks/useUpsellModal';
import { ConsultationUpsellModal, UpsellTrigger } from './consultation/ConsultationUpsellModal';

interface UpsellContextType {
  triggerUpsell: (trigger: UpsellTrigger, force?: boolean) => void;
  activeTrigger: UpsellTrigger | null;
  setActiveTrigger: React.Dispatch<React.SetStateAction<UpsellTrigger | null>>;
}

const UpsellContext = createContext<UpsellContextType | undefined>(undefined);

export const useUpsell = () => {
  const context = useContext(UpsellContext);
  if (!context) {
    throw new Error('useUpsell must be used within an UpsellProvider');
  }
  return context;
};

export const UpsellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { userData, weightHistory } = useAppContext();
  const { canShowUpsell, recordUpsellShown } = useUpsellModal();
  const [activeTrigger, setActiveTrigger] = useState<UpsellTrigger | null>(null);

  const triggerUpsell = (trigger: UpsellTrigger, force: boolean = false) => {
    if (canShowUpsell(trigger, force)) {
      recordUpsellShown();
      setActiveTrigger(trigger);
    }
  };

  // 1. Engaged user (enters '/' with a delay of 3s)
  useEffect(() => {
    if (location.pathname === '/' && userData?.isPro) {
      const timer = setTimeout(() => {
        if (canShowUpsell('engaged_user')) {
          recordUpsellShown();
          setActiveTrigger('engaged_user');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, userData]);

  // 2. Scheduled Day 10-12 checkout
  useEffect(() => {
    if (userData?.isPro && userData?.proStartDate) {
      const proStart = new Date(userData.proStartDate);
      const diffDays = (Date.now() - proStart.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 10 && diffDays <= 12) {
        const day10Shown = localStorage.getItem('fitmind_upsell_day10_shown');
        if (day10Shown !== 'true' && canShowUpsell('scheduled_day10')) {
          localStorage.setItem('fitmind_upsell_day10_shown', 'true');
          recordUpsellShown();
          setActiveTrigger('scheduled_day10');
        }
      }
    }
  }, [userData]);

  // 3. Plateau detection on weightHistory change
  useEffect(() => {
    if (userData?.isPro && weightHistory && weightHistory.length >= 2) {
      const sortedHistory = [...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const newestEntry = sortedHistory[0];
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Find an entry older than or equal to 14 days ago
      const olderEntry = sortedHistory.find(entry => new Date(entry.date) <= twoWeeksAgo);
      if (olderEntry) {
        const weightDiff = Math.abs(newestEntry.weight - olderEntry.weight);
        if (weightDiff < 0.3) {
          const lastPlateau = localStorage.getItem('fitmind_upsell_plateau_last');
          let shouldTrigger = true;
          if (lastPlateau) {
            const diffDays = (Date.now() - new Date(lastPlateau).getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays < 14) {
              shouldTrigger = false;
            }
          }
          if (shouldTrigger && canShowUpsell('plateau')) {
            localStorage.setItem('fitmind_upsell_plateau_last', new Date().toISOString());
            recordUpsellShown();
            setActiveTrigger('plateau');
          }
        }
      }
    }
  }, [weightHistory, userData]);

  return (
    <UpsellContext.Provider value={{ triggerUpsell, activeTrigger, setActiveTrigger }}>
      {children}
      {activeTrigger && (
        <ConsultationUpsellModal
          trigger={activeTrigger}
          onClose={() => setActiveTrigger(null)}
        />
      )}
    </UpsellContext.Provider>
  );
};
