import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon } from 'lucide-react';
import { useAppContext } from './AppContext';
import { NOTIFICATIONS, AppNotification, NotificationContext } from '../lib/notifications';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScrollLock } from '../hooks/useScrollLock';
import { WEEKDAYS } from '../constants';
import Portal from './core/Portal';

export const NotificationSystem: React.FC = () => {
    const { userData, meals, currentWater, quickAddProtein, weightHistory, applicationHistory, setIsMealModalOpen, setIsWeightModalOpen, setInitialMode, weightMilestoneData, targetMacros } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeModal, setActiveModal] = useState<AppNotification | null>(null);
    const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
    
    const [dismissedInSession, setDismissedInSession] = useState<Set<string>>(new Set());
    const [currentCtx, setCurrentCtx] = useState<NotificationContext | null>(null);
    const [sessionStartTime] = useState(Date.now());

    useScrollLock(!!activeModal || !!weightMilestoneData);

    // Auto-dismiss toast after 5 seconds
    useEffect(() => {
        if (activeToast) {
            const timer = setTimeout(() => {
                setActiveToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [activeToast]);

    // UX-Focused Cooldown Logic
    const getGlobalCooldown = (priority: number) => {
        if (priority <= 2) return 0; // Critical (Onboarding/Dose): No global cooldown
        if (priority <= 5) return 5 * 60 * 1000; // Routine (Weight/Meals/Water): 5 mins
        return 60 * 60 * 1000; // Engagement/Upsell: 1 hour
    };

    const getPerNotificationCooldown = (notification: AppNotification) => {
        if (notification.priority <= 1) return 60 * 60 * 1000; // Onboarding: 1 hour cooldown
        if (notification.type === 'toast') return 30 * 1000; // Toasts: 30 seconds
        if (notification.priority <= 5) return 4 * 60 * 60 * 1000; // Routine: 4 hours
        return 24 * 60 * 60 * 1000; // Engagement: 24 hours
    };

    useEffect(() => {
        // Evaluate triggers every 10 seconds
        const evaluate = () => {
            if (!userData || !userData.name) return;
            
            // USER REQUEST: Notifications ONLY for PRO users. No exceptions.
            if (!userData.isPro) return;

            // Don't show new notifications if one is already active or weight milestone is showing
            if (activeModal || activeToast || weightMilestoneData) return;
            
            const now = new Date().getTime();

            // Build Context
            const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0) + quickAddProtein;
            const proteinGoal = targetMacros?.protein || userData?.goals?.protein || 100;
            
            const lastDoseDate = applicationHistory && applicationHistory.length > 0 
                ? new Date(applicationHistory[0].date) 
                : null;
                
            const doseDayOfWeek = WEEKDAYS.indexOf(userData.medication.nextApplication);
            const isDaily = userData.applicationFrequency === 'Diariamente';

            const ctx: NotificationContext = {
                userData,
                meals,
                currentWater,
                weightHistory,
                currentTime: new Date(),
                sessionStart: new Date(), // Mocked
                isFirstTimeOpening: localStorage.getItem('hasOpenedBefore') !== 'true',
                hasCompletedOnboarding: !!userData?.name,
                daysSinceSignup: 2, // Mocked
                isSubscriber: userData?.isPro || false,
                subscriberDays: 0, // Mocked
                lastWeightRecordDate: weightHistory.length > 0 ? new Date(weightHistory[0].date) : null,
                lastDoseDate,
                doseDayOfWeek: isDaily ? new Date().getDay() : (doseDayOfWeek !== -1 ? doseDayOfWeek : 1),
                hasLoggedSideEffectToday: false, // Mocked
                hasStrongSideEffect: false, // Mocked
                proteinProgress: totalProtein / proteinGoal,
                waterProgress: currentWater,
                weightDiff: weightHistory.length >= 2 ? weightHistory[0].weight - weightHistory[1].weight : null,
                currentPath: location.pathname,
            };

            setCurrentCtx(ctx);

            // Mark as opened
            if (ctx.isFirstTimeOpening) {
                localStorage.setItem('hasOpenedBefore', 'true');
            }

            // Find eligible notifications with SMART COOLDOWN
            const lastGlobalModalTime = parseInt(localStorage.getItem('last_modal_time') || '0');
            const lastGlobalToastTime = parseInt(localStorage.getItem('last_toast_time') || '0');

            const eligible = NOTIFICATIONS.filter(n => {
                if (dismissedInSession.has(n.id)) return false;
                
                // 1. Check per-notification cooldown
                const lastShown = parseInt(localStorage.getItem(`last_shown_${n.id}`) || '0');
                if (now - lastShown < getPerNotificationCooldown(n)) return false;

                // 2. Check snooze/never again
                const snoozeUntil = localStorage.getItem(`snooze_${n.id}`);
                if (snoozeUntil && new Date(snoozeUntil).getTime() > now) return false;
                if (localStorage.getItem(`never_${n.id}`) === 'true') return false;

                // 3. Check global cooldown based on priority
                if (n.type === 'modal') {
                    if (now - lastGlobalModalTime < getGlobalCooldown(n.priority)) return false;
                } else {
                    if (now - lastGlobalToastTime < 30000) return false; // Fixed 30s for toasts
                }

                try {
                    return n.evaluateTrigger(ctx);
                } catch (e) {
                    return false;
                }
            });

            // Separate Modals and Toasts
            const modals = eligible.filter(n => n.type === 'modal');
            const toasts = eligible.filter(n => n.type === 'toast');

            // Show highest priority modal
            if (modals.length > 0) {
                modals.sort((a, b) => a.priority - b.priority);
                const selected = modals[0];
                setActiveModal(selected);
                localStorage.setItem('last_modal_time', now.toString());
                localStorage.setItem(`last_shown_${selected.id}`, now.toString());
                return;
            }

            // Show highest priority toast
            if (toasts.length > 0) {
                toasts.sort((a, b) => a.priority - b.priority);
                const selected = toasts[0];
                setActiveToast(selected);
                localStorage.setItem('last_toast_time', now.toString());
                localStorage.setItem(`last_shown_${selected.id}`, now.toString());
            }
        };

        evaluate();
        const interval = setInterval(evaluate, 10000);
        return () => clearInterval(interval);
    }, [userData, meals, currentWater, quickAddProtein, weightHistory, activeModal, activeToast, dismissedInSession, weightMilestoneData]);

    const handleAction = (notification: AppNotification, action: string) => {
        // Handle dismiss/snooze logic
        if (action === 'dismiss') {
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        } else if (action === 'never_again') {
            localStorage.setItem(`never_${notification.id}`, 'true');
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        } else if (action.startsWith('snooze')) {
            const now = new Date();
            let snoozeTime = new Date();
            if (action === 'snooze_1h') snoozeTime.setHours(now.getHours() + 1);
            else if (action === 'snooze_tomorrow') snoozeTime.setDate(now.getDate() + 1);
            else if (action === 'snooze_7d') snoozeTime.setDate(now.getDate() + 7);
            else if (action === 'snooze_14d') snoozeTime.setDate(now.getDate() + 14);
            else snoozeTime.setHours(now.getHours() + 4); // default snooze

            localStorage.setItem(`snooze_${notification.id}`, snoozeTime.toISOString());
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        } else if (action.startsWith('/')) {
            navigate(action);
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        } else if (action === 'camera') {
            setInitialMode('camera');
            setIsMealModalOpen(true);
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        } else if (action === 'weight') {
            setIsWeightModalOpen(true);
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        } else {
            // Custom actions like 'share_referral', 'whatsapp_feedback'
            console.log('Custom action triggered:', action);
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        }

        if (notification.type === 'modal') setActiveModal(null);
        if (notification.type === 'toast') setActiveToast(null);
    };

    // Helper to render text that might be a function
    const renderText = (text: string | ((data: any) => string)) => {
        if (typeof text === 'function') {
            const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0) + quickAddProtein;
            const proteinGoal = targetMacros?.protein || userData?.goals?.protein || 100;
            
            return text(currentCtx || { 
                userData, 
                waterProgress: currentWater, 
                proteinProgress: totalProtein / proteinGoal, 
                proteinGoal,
                subscriberDays: 30, 
                weightDiff: -1.5 
            });
        }
        return text;
    };

    return (
        <>
            {/* TOASTS (Floating Snackbar) */}
            <AnimatePresence>
                {activeToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 left-4 right-4 z-[9998] flex justify-center pointer-events-none"
                    >
                        <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-md w-full pointer-events-auto">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                {activeToast.id.includes('weight') ? (
                                    <span className="text-xl">🔥</span>
                                ) : activeToast.id.includes('water') ? (
                                    <span className="text-xl">💧</span>
                                ) : activeToast.id.includes('protein') ? (
                                    <span className="text-xl">💪</span>
                                ) : (
                                    <span className="text-xl">✨</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate">
                                    {renderText(activeToast.title)}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-1">
                                    {renderText(activeToast.body)}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleAction(activeToast, 'dismiss')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XIcon className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <Portal>
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => handleAction(activeModal, 'dismiss')}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ 
                                    opacity: 1, 
                                    scale: 1, 
                                    y: 0,
                                    transition: {
                                        type: "spring",
                                        damping: 25,
                                        stiffness: 300
                                    }
                                }}
                                exit={{ 
                                    opacity: 0, 
                                    scale: 0.9, 
                                    y: 20,
                                    transition: { duration: 0.2 }
                                }}
                                className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                                        <span className="text-3xl">✨</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                        {renderText(activeModal.title)}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                        {renderText(activeModal.body)}
                                    </p>

                                    <div className="w-full flex flex-col gap-3">
                                        {activeModal.primaryAction && (
                                            <button 
                                                onClick={() => handleAction(activeModal, activeModal.primaryAction!.action)}
                                                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg active:scale-95 transition-transform"
                                            >
                                                {activeModal.primaryAction.label}
                                            </button>
                                        )}
                                        {activeModal.secondaryAction && (
                                            <button 
                                                onClick={() => handleAction(activeModal, activeModal.secondaryAction!.action)}
                                                className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg active:scale-95 transition-transform"
                                            >
                                                {activeModal.secondaryAction.label}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </Portal>
                )}
            </AnimatePresence>
        </>
    );
};
