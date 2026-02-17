
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { UserCircleIcon, MoonIcon, BellIcon, ShieldCheckIcon, HelpCircleIcon, ChevronRightIcon, StarIcon, SyringeIcon, FlameIcon, TargetIcon, SettingsIcon, LockIcon, PlayCircleIcon, ChatBubbleIcon, LightBulbIcon, DocumentIcon, ShieldIcon, LogOutIcon, CoffeeIcon, AppleIcon, WavesIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { SubscriptionPage } from '../SubscriptionPage';
import { DEFAULT_USER_DATA } from '../../constants';

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
    
    // Ensure notifications object exists
    const settings = userData?.notifications || DEFAULT_USER_DATA.notifications;
    const [isEnabled, setIsEnabled] = useState(settings.enabled);
    const [localSettings, setLocalSettings] = useState(settings);

    const updateSettings = async (key: string, value: any) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        
        if (userData) {
            setUserData({ ...userData, notifications: newSettings });
            await supabase.from('profiles').update({ notifications: newSettings }).eq('id', userData.id);
        }
    };

    const handleToggle = async () => {
        if (!('Notification' in window)) {
            addToast('Este navegador não suporta notificações.', 'error');
            return;
        }

        if (!isEnabled) {
            // iOS Specific Check
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            // Check if installed (standalone)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

            if (isIOS && !isStandalone) {
                // Use native alert for maximum visibility
                window.alert("No iPhone, as notificações só funcionam se você instalar o App.\n\n1. Toque no botão Compartilhar (embaixo)\n2. Selecione 'Adicionar à Tela de Início'");
                return;
            }

            if (Notification.permission === 'denied') {
                // Browser blocks prompt if denied previously. Guide user.
                window.alert('As notificações estão bloqueadas no navegador.\n\nPara ativar: Toque no cadeado 🔒 na barra de endereço ou vá em Configurações do Site e permita Notificações.');
                return;
            }

            try {
                // Request Permission
                const result = await Notification.requestPermission();
                if (result === 'granted') {
                    setIsEnabled(true);
                    updateSettings('enabled', true);
                    addToast('Notificações ativadas!', 'success');
                } else {
                    // User dismissed or denied
                    addToast('Permissão negada.', 'error');
                }
            } catch (error) {
                console.error("Erro ao solicitar notificação:", error);
                addToast('Erro ao ativar. Tente novamente.', 'error');
            }
        } else {
            setIsEnabled(false);
            updateSettings('enabled', false);
        }
    };

    const handleTimeChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        updateSettings(key, e.target.value);
    };

    return (
        <SettingsGroup title="Notificações">
             <ToggleItem 
                icon={<div className="bg-red-500 p-1.5 rounded-md text-white"><BellIcon className="w-4 h-4"/></div>}
                label="Permitir Notificações" 
                isEnabled={isEnabled} 
                onToggle={handleToggle} 
                isLast={!isEnabled}
            />
            {isEnabled && (
                <div className="pl-4 bg-ios-card dark:bg-ios-dark-card space-y-1">
                    {/* Medication */}
                    <div className="flex items-center justify-between py-2 pr-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <SyringeIcon className="w-4 h-4 text-purple-500"/>
                            <span className="text-gray-900 dark:text-white text-sm">Medicação</span>
                        </div>
                        <input type="time" value={localSettings.medicationTime} onChange={(e) => handleTimeChange('medicationTime', e)} className="bg-transparent text-gray-500 dark:text-gray-400 font-medium outline-none text-right" />
                    </div>
                    {/* Breakfast */}
                    <div className="flex items-center justify-between py-2 pr-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <CoffeeIcon className="w-4 h-4 text-orange-500"/>
                            <span className="text-gray-900 dark:text-white text-sm">Café da Manhã</span>
                        </div>
                        <input type="time" value={localSettings.breakfastTime} onChange={(e) => handleTimeChange('breakfastTime', e)} className="bg-transparent text-gray-500 dark:text-gray-400 font-medium outline-none text-right" />
                    </div>
                    {/* Lunch */}
                    <div className="flex items-center justify-between py-2 pr-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <span className="text-base">🥗</span>
                            <span className="text-gray-900 dark:text-white text-sm">Almoço</span>
                        </div>
                        <input type="time" value={localSettings.lunchTime} onChange={(e) => handleTimeChange('lunchTime', e)} className="bg-transparent text-gray-500 dark:text-gray-400 font-medium outline-none text-right" />
                    </div>
                    {/* Snack */}
                    <div className="flex items-center justify-between py-2 pr-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <AppleIcon className="w-4 h-4 text-green-500"/>
                            <span className="text-gray-900 dark:text-white text-sm">Lanche</span>
                        </div>
                        <input type="time" value={localSettings.snackTime} onChange={(e) => handleTimeChange('snackTime', e)} className="bg-transparent text-gray-500 dark:text-gray-400 font-medium outline-none text-right" />
                    </div>
                    {/* Dinner */}
                    <div className="flex items-center justify-between py-2 pr-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <span className="text-base">🍽️</span>
                            <span className="text-gray-900 dark:text-white text-sm">Jantar</span>
                        </div>
                        <input type="time" value={localSettings.dinnerTime} onChange={(e) => handleTimeChange('dinnerTime', e)} className="bg-transparent text-gray-500 dark:text-gray-400 font-medium outline-none text-right" />
                    </div>
                    {/* Checkin */}
                    <div className="flex items-center justify-between py-2 pr-4">
                        <div className="flex items-center gap-3">
                            <WavesIcon className="w-4 h-4 text-blue-500"/>
                            <span className="text-gray-900 dark:text-white text-sm">Check-in Bem-estar</span>
                        </div>
                        <input type="time" value={localSettings.checkinTime} onChange={(e) => handleTimeChange('checkinTime', e)} className="bg-transparent text-gray-500 dark:text-gray-400 font-medium outline-none text-right" />
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
    
    if (!userData) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handleRestartTour = () => {
        // Limpa o indicador de que o tour já foi visto
        localStorage.removeItem('has_seen_onboarding');
        // Redireciona para a home, onde o TourGuide verificará o localStorage e iniciará o tour
        navigate('/');
    };

    return (
        <div className="px-5 pb-24 min-h-screen animate-fade-in">
            <header className="mb-8 mt-4 flex justify-between items-start">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Ajustes</h1>
                <StreakBadge />
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

            <SettingsGroup title="Conta">
                 <SettingsItem 
                    icon={<div className="bg-blue-500 p-1.5 rounded-md text-white"><UserCircleIcon className="w-4 h-4"/></div>}
                    label="Minha Conta" 
                    onClick={() => navigate('/settings/account')} 
                />
                <SettingsItem 
                    icon={<div className="bg-gray-500 p-1.5 rounded-md text-white"><LockIcon className="w-4 h-4"/></div>}
                    label="Privacidade e Segurança" 
                    onClick={() => navigate('/settings/privacy')} 
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

            <SettingsGroup title="Configurações">
                <SettingsItem 
                    icon={<div className="bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 p-1.5 rounded-md text-black dark:text-white"><SyringeIcon className="w-4 h-4"/></div>}
                    label="Tratamento" 
                    onClick={() => navigate('/settings/treatment')} 
                />
                <SettingsItem 
                    icon={<div className="bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 p-1.5 rounded-md text-black dark:text-white"><FlameIcon className="w-4 h-4"/></div>}
                    label="Metas de estilo de vida" 
                    onClick={() => navigate('/settings/lifestyle')} 
                />
                <SettingsItem 
                    icon={<div className="bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 p-1.5 rounded-md text-black dark:text-white"><TargetIcon className="w-4 h-4"/></div>}
                    label="Metas de peso" 
                    onClick={() => navigate('/settings/account')} 
                />
                <SettingsItem 
                    icon={<div className="bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 p-1.5 rounded-md text-black dark:text-white"><SettingsIcon className="w-4 h-4"/></div>}
                    label="Configurações iniciais" 
                    onClick={() => navigate('/settings/initial-setup')} 
                    isLast
                />
            </SettingsGroup>

            <NotificationSettings />
            <ThemeSettings />

            <SettingsGroup title="OUTROS">
                <SettingsItem 
                    icon={<div className="text-black dark:text-white"><PlayCircleIcon className="w-5 h-5"/></div>}
                    label="Ver tutorial" 
                    onClick={handleRestartTour} 
                />
                <SettingsItem 
                    icon={<div className="text-black dark:text-white"><ChatBubbleIcon className="w-5 h-5"/></div>}
                    label="Suporte" 
                    onClick={() => navigate('/settings/help')} 
                />
                <SettingsItem 
                    icon={<div className="text-black dark:text-white"><LightBulbIcon className="w-5 h-5"/></div>}
                    label="Enviar Sugestão" 
                    onClick={() => {}} 
                />
                <SettingsItem 
                    icon={<div className="text-black dark:text-white"><DocumentIcon className="w-5 h-5"/></div>}
                    label="Termos e Condições" 
                    onClick={() => {}} 
                />
                <SettingsItem 
                    icon={<div className="text-black dark:text-white"><ShieldIcon className="w-5 h-5"/></div>}
                    label="Política de Privacidade" 
                    onClick={() => {}} 
                />
                <SettingsItem 
                    icon={<div className="text-black dark:text-white"><LogOutIcon className="w-5 h-5"/></div>}
                    label="Sair" 
                    onClick={handleLogout} 
                    isLast
                />
            </SettingsGroup>
            
            <p className="text-center text-gray-400 text-xs mt-8 mb-10 font-medium">FitMind v1.0.3 • Feito com ❤️</p>

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
