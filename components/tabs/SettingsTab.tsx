
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { UserCircleIcon, MoonIcon, BellIcon, ShieldCheckIcon, HelpCircleIcon, ChevronRightIcon, StarIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { SubscriptionPage } from '../SubscriptionPage';

const SettingsGroup: React.FC<{ title?: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        {title && <h3 className="px-4 mb-2 text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</h3>}
        <div className="bg-ios-card dark:bg-ios-dark-card rounded-[10px] overflow-hidden shadow-sm">
            {children}
        </div>
    </div>
);

const SettingsItem: React.FC<{icon?: React.ReactNode, label: string, value?: string, onClick?: () => void, isDestructive?: boolean, isLast?: boolean}> = ({ icon, label, value, onClick, isDestructive, isLast }) => (
    <div className="pl-4 bg-ios-card dark:bg-ios-dark-card">
        <button onClick={onClick} className={`flex items-center w-full py-3 pr-4 active:bg-gray-100 dark:active:bg-gray-800 transition-colors ${!isLast ? 'border-b border-gray-200/50 dark:border-gray-700/50' : ''}`}>
            {icon && <div className="text-gray-900 dark:text-white mr-3">{icon}</div>}
            <span className={`flex-grow text-left font-medium text-[17px] ${isDestructive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{label}</span>
            {value && <span className="text-gray-400 dark:text-gray-500 mr-2 text-[17px]">{value}</span>}
            {!isDestructive && <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
        </button>
    </div>
)

const ToggleItem: React.FC<{ icon: React.ReactNode, label: string, isEnabled: boolean, onToggle: () => void, isLast?: boolean }> = ({ icon, label, isEnabled, onToggle, isLast }) => (
    <div className="pl-4 bg-ios-card dark:bg-ios-dark-card">
        <div className={`flex items-center justify-between py-3 pr-4 ${!isLast ? 'border-b border-gray-200/50 dark:border-gray-700/50' : ''}`}>
            <div className="flex items-center">
                {icon && <div className="text-gray-900 dark:text-white mr-3">{icon}</div>}
                <span className="font-medium text-gray-900 dark:text-white text-[17px]">{label}</span>
            </div>
            <div 
                onClick={onToggle}
                className={`w-[51px] h-[31px] rounded-full p-0.5 cursor-pointer transition-colors duration-300 ease-in-out shadow-inner ${isEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
                <div className={`bg-white w-[27px] h-[27px] rounded-full shadow-md transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </div>
        </div>
    </div>
);

const NotificationSettings: React.FC = () => {
    const { userData, setUserData } = useAppContext();
    const { addToast } = useToast();
    const [isEnabled, setIsEnabled] = useState(userData?.medicationReminder?.enabled ?? false);
    const [time, setTime] = useState(userData?.medicationReminder?.time ?? '09:00');

    const handleToggle = async () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        saveSettings(newState, time);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTime(newTime);
        saveSettings(isEnabled, newTime);
    };

    const saveSettings = async (enabled: boolean, newTime: string) => {
        if (!userData) return;
        const newReminderSettings = { enabled, time: newTime };
        
        const { error } = await supabase
            .from('profiles')
            .update({ medication_reminder: newReminderSettings })
            .eq('id', userData.id);

        if (error) {
            addToast('Falha ao salvar lembrete.', 'error');
            setIsEnabled(userData.medicationReminder?.enabled ?? false);
        } else {
            setUserData(prev => prev ? { ...prev, medicationReminder: newReminderSettings } : null);
        }
    };

    return (
        <SettingsGroup title="Notificações">
             <ToggleItem 
                icon={<div className="bg-red-500 p-1.5 rounded-md text-white"><BellIcon className="w-4 h-4"/></div>}
                label="Lembrete de Aplicação" 
                isEnabled={isEnabled} 
                onToggle={handleToggle} 
                isLast={!isEnabled}
            />
            {isEnabled && (
                <div className="pl-4 bg-ios-card dark:bg-ios-dark-card">
                    <div className="flex items-center justify-between py-3 pr-4">
                        <span className="text-gray-900 dark:text-white text-[17px]">Horário</span>
                        <input
                            type="time"
                            value={time}
                            onChange={handleTimeChange}
                            className="bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-gray-900 dark:text-white focus:outline-none font-mono text-base"
                        />
                    </div>
                </div>
            )}
        </SettingsGroup>
    );
};

const ThemeSettings: React.FC = () => {
    const { theme, toggleTheme } = useAppContext();

    return (
        <SettingsGroup title="Aparência">
            <ToggleItem 
                icon={<div className="bg-indigo-500 p-1.5 rounded-md text-white"><MoonIcon className="w-4 h-4"/></div>}
                label="Modo Escuro" 
                isEnabled={theme === 'dark'} 
                onToggle={toggleTheme} 
                isLast
            />
        </SettingsGroup>
    );
};


export const SettingsTab: React.FC = () => {
    const { userData, unlockPro } = useAppContext();
    const navigate = useNavigate();
    const [showSubPage, setShowSubPage] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };
    
    if (!userData) return null;

    return (
        <div className="px-5 pb-24 min-h-screen animate-fade-in">
            <header className="mb-8 mt-4">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Ajustes</h1>
            </header>

            <div className="mb-8 flex items-center gap-4 bg-ios-card dark:bg-ios-dark-card p-4 rounded-[20px] shadow-sm relative overflow-hidden">
                <div className="w-16 h-16 bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-300 shadow-inner z-10">
                    {userData.name.charAt(0).toUpperCase()}
                </div>
                <div className="z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userData.name}</h2>
                        {userData.isPro && <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PRO</span>}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{userData.medication.name} • {userData.medication.dose}</p>
                </div>
                {userData.isPro && <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>}
            </div>

            <SettingsGroup>
                 <SettingsItem 
                    icon={<div className="bg-blue-500 p-1.5 rounded-md text-white"><UserCircleIcon className="w-4 h-4"/></div>}
                    label="Minha Conta" 
                    onClick={() => navigate('/settings/account')} 
                    isLast={userData.isPro}
                />
                {!userData.isPro && (
                    <SettingsItem 
                        icon={<div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-md text-white"><StarIcon className="w-4 h-4"/></div>}
                        label="Assinar FitMind PRO" 
                        onClick={() => setShowSubPage(true)} 
                        isLast
                    />
                )}
            </SettingsGroup>

            <NotificationSettings />
            <ThemeSettings />

            <SettingsGroup title="Suporte & Privacidade">
                 <SettingsItem 
                    icon={<div className="bg-green-500 p-1.5 rounded-md text-white"><HelpCircleIcon className="w-4 h-4"/></div>}
                    label="Ajuda & Suporte" 
                    onClick={() => navigate('/settings/help')} 
                />
                 <SettingsItem 
                    icon={<div className="bg-gray-500 p-1.5 rounded-md text-white"><ShieldCheckIcon className="w-4 h-4"/></div>}
                    label="Privacidade e Dados" 
                    onClick={() => navigate('/settings/privacy')} 
                    isLast
                />
            </SettingsGroup>
            
            <div className="mt-8">
                <button 
                    onClick={handleLogout} 
                    className="w-full bg-ios-card dark:bg-ios-dark-card text-red-500 font-semibold text-[17px] py-3 rounded-[10px] shadow-sm active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                >
                    Sair da Conta
                </button>
            </div>
            
            <p className="text-center text-gray-400 text-xs mt-8 mb-10 font-medium">FitMind v1.0.2 • Feito com ❤️</p>

            {showSubPage && (
                <SubscriptionPage 
                    onClose={() => setShowSubPage(false)}
                    onSubscribe={() => {
                        unlockPro();
                        setShowSubPage(false);
                    }}
                />
            )}
        </div>
    );
};