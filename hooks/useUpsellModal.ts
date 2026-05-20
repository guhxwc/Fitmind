import { useAppContext } from '../components/AppContext';

export const useUpsellModal = () => {
  const { userData, consultationStatus } = useAppContext();

  const canShowUpsell = (trigger: string, force: boolean = false): boolean => {
    // 1. Test Mode Bypass (highest priority)
    if (localStorage.getItem('fitmind_upsell_test_mode') === 'true') {
      return true;
    }

    // If an action is forced (e.g. user clicked on locked icon / day card), bypass general cooldown checks
    if (force) {
      // Still respect consultation checks (don't show upsell if already active)
      const isConsultationActiveVal = ['pending', 'anamnese_done', 'active'].includes(consultationStatus || '');
      
      if (isConsultationActiveVal) return false;
      return true;
    }

    // 2. No consultation active: pending, anamnese_done, active
    const isConsultationActive = ['pending', 'anamnese_done', 'active'].includes(consultationStatus || '');

    if (isConsultationActive) return false;

    // 3. No non-pro check: must be PRO
    if (!userData?.isPro) return false;

    // 4. One modal per session check (sessionStorage)
    if (sessionStorage.getItem('fitmind_upsell_shown_session') === 'true') {
      return false;
    }

    // 5. Min pro days check: 7 days minimum of PRO (except when triggering diet_limit)
    if (trigger !== 'diet_limit') {
      if (userData?.proStartDate) {
        const proStart = new Date(userData.proStartDate);
        const diffDays = (Date.now() - proStart.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays < 7) return false;
      } else {
        // Fallback or treat as pro
      }
    }

    // 6. Dismiss Cooldown: 72 hours after any explicit dismissal/dismiss
    const dismissedAt = localStorage.getItem('fitmind_upsell_dismissed_at');
    if (dismissedAt) {
      const diffHours = (Date.now() - new Date(dismissedAt).getTime()) / (1000 * 60 * 60);
      if (diffHours < 72) return false;
    }

    // 7. Click but no buy cooldown: 7 days if clicked on CTA but didn't upgrade
    const lastClick = localStorage.getItem('fitmind_upsell_last_click');
    if (lastClick) {
      const diffDays = (Date.now() - new Date(lastClick).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) return false;
    }

    // 8. Max Shows Pause: After 3 dismissals, pause shows for 14 days
    const shownCount = parseInt(localStorage.getItem('fitmind_upsell_shown_count') || '0', 10);
    if (shownCount >= 3) {
      let pauseStart = localStorage.getItem('fitmind_upsell_pause_start');
      if (!pauseStart) {
        pauseStart = new Date().toISOString();
        localStorage.setItem('fitmind_upsell_pause_start', pauseStart);
      }
      
      const diffDays = (Date.now() - new Date(pauseStart).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 14) {
        return false;
      } else {
        // Cooldown has expired, auto reset shown count and pause start
        localStorage.setItem('fitmind_upsell_shown_count', '0');
        localStorage.removeItem('fitmind_upsell_pause_start');
      }
    }

    return true;
  };

  const recordUpsellShown = () => {
    // Only set browser tab session flag if not in test mode
    if (localStorage.getItem('fitmind_upsell_test_mode') !== 'true') {
      sessionStorage.setItem('fitmind_upsell_shown_session', 'true');
    }
  };

  return {
    canShowUpsell,
    recordUpsellShown,
  };
};
