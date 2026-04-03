import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon } from 'lucide-react';
import { useAppContext } from './AppContext';
import { NOTIFICATIONS, AppNotification, NotificationContext } from '../lib/notifications';
import { useNavigate } from 'react-router-dom';

export const NotificationSystem: React.FC = () => {
    const { userData, meals, currentWater, weightHistory } = useAppContext();
    const navigate = useNavigate();
    
    const [activeModal, setActiveModal] = useState<AppNotification | null>(null);
    const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
    
    const [dismissedInSession, setDismissedInSession] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Evaluate triggers every minute or when context changes
        const evaluate = () => {
            if (activeModal) return; // Don't evaluate if a modal is already open

            const now = new Date();
            
            // Build Context
            const ctx: NotificationContext = {
                userData,
                meals,
                currentWater,
                weightHistory,
                currentTime: now,
                sessionStart: new Date(), // Mocked for now
                isFirstTimeOpening: localStorage.getItem('hasOpenedBefore') !== 'true',
                hasCompletedOnboarding: !!userData?.name,
                daysSinceSignup: 2, // Mocked
                isSubscriber: false, // Mocked
                subscriberDays: 0, // Mocked
                lastWeightRecordDate: weightHistory.length > 0 ? new Date(weightHistory[0].date) : null,
                lastDoseDate: null, // Mocked
                doseDayOfWeek: 1, // Mocked
                hasLoggedSideEffectToday: false, // Mocked
                hasStrongSideEffect: false, // Mocked
                proteinProgress: 0.5, // Mocked
                waterProgress: currentWater,
                weightDiff: weightHistory.length >= 2 ? weightHistory[0].weight - weightHistory[1].weight : null,
            };

            // Mark as opened
            if (ctx.isFirstTimeOpening) {
                localStorage.setItem('hasOpenedBefore', 'true');
            }

            // Find eligible notifications
            const eligible = NOTIFICATIONS.filter(n => {
                if (dismissedInSession.has(n.id)) return false;
                
                // Check snooze/never again in localStorage
                const snoozeUntil = localStorage.getItem(`snooze_${n.id}`);
                if (snoozeUntil && new Date(snoozeUntil) > now) return false;
                if (localStorage.getItem(`never_${n.id}`) === 'true') return false;

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
                // Sort by priority (lower number = higher priority)
                modals.sort((a, b) => a.priority - b.priority);
                setActiveModal(modals[0]);
            }

            // Show highest priority toast if none active
            if (toasts.length > 0 && !activeToast) {
                toasts.sort((a, b) => a.priority - b.priority);
                setActiveToast(toasts[0]);
            }
        };

        evaluate();
        const interval = setInterval(evaluate, 60000);
        return () => clearInterval(interval);
    }, [userData, meals, waterRecords, weightRecords, activeModal, activeToast, dismissedInSession]);

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
        } else {
            // Custom actions like 'camera', 'share_referral', 'whatsapp_feedback'
            console.log('Custom action triggered:', action);
            setDismissedInSession(prev => new Set(prev).add(notification.id));
        }

        if (notification.type === 'modal') setActiveModal(null);
        if (notification.type === 'toast') setActiveToast(null);
    };

    // Helper to render text that might be a function
    const renderText = (text: string | ((data: any) => string)) => {
        if (typeof text === 'function') {
            // Pass a dummy context for rendering, ideally we'd pass the real one
            return text({ userData, waterProgress: waterRecords.reduce((sum, r) => sum + r.amount, 0), proteinProgress: 0.5, subscriberDays: 30, weightDiff: -1.5 });
        }
        return text;
    };

    return (
        <>
            {/* TOASTS */}
            <AnimatePresence>
                {activeToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-4 left-4 right-4 z-50 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-4 flex flex-col gap-2"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{renderText(activeToast.title)}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-snug">{renderText(activeToast.body)}</p>
                            </div>
                            <button onClick={() => handleAction(activeToast, 'dismiss')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {activeToast.primaryAction && (
                            <button 
                                onClick={() => handleAction(activeToast, activeToast.primaryAction!.action)}
                                className="mt-2 text-sm font-bold text-blue-500 self-start"
                            >
                                {activeToast.primaryAction.label}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => handleAction(activeModal, 'dismiss')}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
                )}
            </AnimatePresence>
        </>
    );
};
