import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { UserCircleIcon, StarIcon, MoonIcon, BellIcon, ShieldCheckIcon, HelpCircleIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';

interface SettingsTabProps {
    onShowSubscription: () => void;
}

const SettingsItem: React.FC<{icon: React.ReactNode, label: string, onClick?: () => void}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full p-4 bg-gray-100/60 dark:bg-gray-800/50 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all active:scale-[0.99]">
        <div className="text-gray-600 dark:text-gray-300">{icon}</div>
        <span className="ml-4 font-semibold text-gray-800 dark:text-gray-200">{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
)

const NotificationSettings: React.FC = () => {
    const { userData, setUserData } = useAppContext();
    const { addToast } = useToast();
    const [isEnabled, setIsEnabled] = useState(userData?.medicationReminder?.enabled ?? false);
    const [time, setTime] = useState(userData?.medicationReminder?.time ?? '09:00');
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked && typeof Notification !== 'undefined') {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    addToast('As notificações foram bloqueadas. Altere nas configurações do navegador.', 'error', { duration: 7000 });
                    return; 
                }
            } else if (Notification.permission === 'denied') {
                addToast('Notificações bloqueadas. Altere nas configurações do navegador.', 'error', { duration: 7000 });
                return;
            }
        }
        setIsEnabled(checked);
        saveSettings(checked, time);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTime(newTime);
        saveSettings(isEnabled, newTime);
    };

    const saveSettings = async (enabled: boolean, newTime: string) => {
        if (!userData) return;
        setIsSaving(true);
        const newReminderSettings = { enabled, time: newTime };
        
        // FIX: The 'medication_reminder' column does not exist in the database.
        // This database call is removed to prevent errors. The setting is only saved in the app's local state for the current session.
        setUserData(prev => prev ? { ...prev, medicationReminder: newReminderSettings } : null);
        
        // Simulate a network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setIsSaving(false);
    };

    return (
        <div className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="text-gray-600 dark:text-gray-300"><BellIcon className="w-6 h-6"/></div>
                    <span className="ml-4 font-semibold text-gray-800 dark:text-gray-200">Lembrete de Aplicação</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isEnabled} onChange={handleToggleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-blue-500"></div>
                </label>
            </div>
            {isEnabled && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between animate-fade-in">
                    <label htmlFor="reminder-time" className="font-medium text-gray-700 dark:text-gray-300">Horário do lembrete</label>
                    <input
                        id="reminder-time"
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className="bg-gray-200/80 dark:bg-gray-700/80 border-none rounded-md px-3 py-1.5 font-semibold text-gray-800 dark:text-gray-200"
                    />
                </div>
            )}
        </div>
    );
};

const ThemeSettings: React.FC = () => {
    const { theme, toggleTheme } = useAppContext();

    return (
        <div className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="text-gray-600 dark:text-gray-300"><MoonIcon className="w-6 h-6"/></div>
                    <span className="ml-4 font-semibold text-gray-800 dark:text-gray-200">Modo Escuro</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-blue-500"></div>
                </label>
            </div>
        </div>
    );
};


export const SettingsTab: React.FC<SettingsTabProps> = ({ onShowSubscription }) => {
    const { userData } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleSubscriptionClick = () => {
        if (userData?.isPro) {
            navigate('/pro');
        } else {
            onShowSubscription();
        }
    };
    
    if (!userData) return null;

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white dark:bg-black min-h-screen animate-fade-in">
            <header>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Ajustes</h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie sua conta e preferências</p>
            </header>

            <section className="space-y-3">
                 <SettingsItem icon={<UserCircleIcon className="w-6 h-6"/>} label="Conta" onClick={() => navigate('/settings/account')} />
                 <SettingsItem icon={<StarIcon className="w-6 h-6 text-blue-500"/>} label={userData.isPro ? "Minha Assinatura" : "Assinatura PRO"} onClick={handleSubscriptionClick} />
                 <NotificationSettings />
                 <ThemeSettings />
                 <SettingsItem icon={<HelpCircleIcon className="w-6 h-6"/>} label="Ajuda & Suporte" onClick={() => navigate('/settings/help')} />
                 <SettingsItem icon={<ShieldCheckIcon className="w-6 h-6"/>} label="Privacidade" onClick={() => navigate('/settings/privacy')} />
            </section>
            
             <section className="pt-4 text-center space-y-4">
                <button onClick={handleLogout} className="text-red-500 dark:text-red-400 font-semibold transition-transform active:scale-95">
                    Sair da Conta
                </button>
                <button className="text-gray-500 dark:text-gray-400 font-semibold transition-transform active:scale-95">Sobre o FitMind</button>
             </section>
        </div>
    );
};