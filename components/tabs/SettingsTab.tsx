import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { DEFAULT_USER_DATA } from '../../constants';
import { ConfirmModal } from '../ConfirmModal';
import { TimePicker } from '../core/TimePicker';
import { EditAttributeModal } from '../core/EditAttributeModal';
import Portal from '../core/Portal';
import { 
  Pill, Target, Utensils, Activity, FileText, 
  Scale, Ruler, Cake, User, Wallet, Gift, Bell, 
  Globe, Star, Lightbulb, Mail, CreditCard, 
  Shield, FileSignature, LogOut, Trash2, 
  ChevronRight, Moon, Share2, Copy, X
} from 'lucide-react';

const SettingsGroup: React.FC<{ title?: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        {title && <h3 className="px-4 mb-2 text-[13px] font-medium text-gray-500 dark:text-gray-400">{title}</h3>}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            {children}
        </div>
    </div>
);

const SettingsItem: React.FC<{
    icon?: React.ReactNode, 
    label: string, 
    value?: string | React.ReactNode, 
    onClick?: () => void, 
    isDestructive?: boolean, 
    isLast?: boolean,
    hideArrow?: boolean
}> = ({ icon, label, value, onClick, isDestructive, isLast, hideArrow }) => (
    <div className="pl-4 bg-white dark:bg-[#1C1C1E]">
        <button 
            onClick={onClick} 
            disabled={!onClick}
            className={`flex items-center w-full py-3.5 pr-4 transition-colors ${onClick ? 'active:bg-gray-50 dark:active:bg-gray-800/50' : 'cursor-default'} ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
        >
            {icon && (
                <div className="mr-3 flex-shrink-0 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <span className={`flex-grow text-left text-[16px] ${isDestructive ? 'text-red-500 font-medium' : 'text-gray-900 dark:text-white'}`}>{label}</span>
            {value && <div className="text-gray-400 dark:text-gray-500 mr-2 text-[16px]">{value}</div>}
            {!isDestructive && !hideArrow && onClick && <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />}
        </button>
    </div>
);

const ToggleItem: React.FC<{ icon: React.ReactNode, label: string, isEnabled: boolean, onToggle: () => void, isLast?: boolean }> = ({ icon, label, isEnabled, onToggle, isLast }) => (
    <div className="pl-4 bg-white dark:bg-[#1C1C1E]">
        <div className={`flex items-center justify-between py-3.5 pr-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
            <div className="flex items-center">
                {icon && <div className="mr-3 flex items-center justify-center">{icon}</div>}
                <span className="text-[16px] text-gray-900 dark:text-white">{label}</span>
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

const CustomTimeInput: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    return (
        <>
            <button 
                onClick={() => setShowPicker(true)}
                className="bg-transparent text-gray-500 dark:text-gray-400 font-medium outline-none text-right min-w-[60px]"
            >
                {value}
            </button>
            {showPicker && (
                <Portal>
                    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowPicker(false)}>
                        <div onClick={e => e.stopPropagation()}>
                            <TimePicker 
                                value={value} 
                                onChange={onChange} 
                                onClose={() => setShowPicker(false)} 
                            />
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
};

const NotificationSettingsModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { userData, setUserData } = useAppContext();
    const { addToast } = useToast();
    
    const settings = userData?.notifications || DEFAULT_USER_DATA.notifications;
    const [isEnabled, setIsEnabled] = useState(settings.enabled);
    const [localSettings, setLocalSettings] = useState(settings);
    const [showIosAlert, setShowIosAlert] = useState(false);
    const [showBlockedAlert, setShowBlockedAlert] = useState(false);

    if (!isOpen) return null;

    const updateSettings = async (key: string, value: any) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        
        if (userData) {
            setUserData(prev => prev ? { ...prev, notifications: newSettings } : null);
            await supabase.from('profiles').update({ notifications: newSettings }).eq('id', userData.id);
        }
    };

    const handleToggle = async () => {
        if (!('Notification' in window)) {
            addToast('Este navegador não suporta notificações.', 'error');
            return;
        }

        if (!isEnabled) {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

            if (isIOS && !isStandalone) {
                setShowIosAlert(true);
                return;
            }

            if (Notification.permission === 'denied') {
                setShowBlockedAlert(true);
                return;
            }

            try {
                const result = await Notification.requestPermission();
                if (result === 'granted') {
                    setIsEnabled(true);
                    updateSettings('enabled', true);
                    addToast('Notificações ativadas!', 'success');
                } else {
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

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-[#F5F5F7] dark:bg-black w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificações</h2>
                        <button onClick={onClose} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                    
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                        <ToggleItem 
                            icon={<Bell className="w-5 h-5 text-yellow-500" />}
                            label="Ativar Notificações" 
                            isEnabled={isEnabled} 
                            onToggle={handleToggle} 
                            isLast={!isEnabled}
                        />
                        {isEnabled && (
                            <div className="pl-4">
                                <div className="flex items-center justify-between py-3.5 pr-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-900 dark:text-white text-[16px]">Lembrete de Remédio</span>
                                    <CustomTimeInput value={localSettings.medicationTime} onChange={(val) => updateSettings('medicationTime', val)} />
                                </div>
                                <div className="flex items-center justify-between py-3.5 pr-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-900 dark:text-white text-[16px]">Café da Manhã</span>
                                    <CustomTimeInput value={localSettings.breakfastTime} onChange={(val) => updateSettings('breakfastTime', val)} />
                                </div>
                                <div className="flex items-center justify-between py-3.5 pr-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-900 dark:text-white text-[16px]">Almoço</span>
                                    <CustomTimeInput value={localSettings.lunchTime} onChange={(val) => updateSettings('lunchTime', val)} />
                                </div>
                                <div className="flex items-center justify-between py-3.5 pr-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-900 dark:text-white text-[16px]">Jantar</span>
                                    <CustomTimeInput value={localSettings.dinnerTime} onChange={(val) => updateSettings('dinnerTime', val)} />
                                </div>
                                <div className="flex items-center justify-between py-3.5 pr-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-900 dark:text-white text-[16px]">Check-in Bem-estar</span>
                                    <CustomTimeInput value={localSettings.checkinTime} onChange={(val) => updateSettings('checkinTime', val)} />
                                </div>
                            </div>
                        )}
                    </div>

                    <ConfirmModal
                        isOpen={showIosAlert}
                        title="Instalar App"
                        message="No iPhone, as notificações só funcionam se você instalar o App.&#10;&#10;1. Toque no botão Compartilhar (embaixo)&#10;2. Selecione 'Adicionar à Tela de Início'"
                        confirmText="Entendi"
                        onConfirm={() => setShowIosAlert(false)}
                    />
                    
                    <ConfirmModal
                        isOpen={showBlockedAlert}
                        title="Notificações Bloqueadas"
                        message="As notificações estão bloqueadas no navegador.&#10;&#10;Para ativar: Toque no cadeado 🔒 na barra de endereço ou vá em Configurações do Site e permita Notificações."
                        confirmText="Entendi"
                        onConfirm={() => setShowBlockedAlert(false)}
                    />
                </div>
            </div>
        </Portal>
    );
};

import { TrialResultsScreen } from '../TrialResultsScreen';
import { TrialTestModal } from '../TrialTestModal';

export const SettingsTab: React.FC = () => {
    const { userData, theme, toggleTheme, unlockPro, fetchData } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showTrialResults, setShowTrialResults] = useState(false);
    const [showTrialTest, setShowTrialTest] = useState(false);
    const [copied, setCopied] = useState(false);
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

    React.useEffect(() => {
        window.scrollTo(0, 0);
        const main = document.querySelector('main');
        if (main) main.scrollTo(0, 0);
    }, []);
    
    // Modals state
    const [showReportModal, setShowReportModal] = useState(false);
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        title: string;
        type: 'text' | 'number' | 'date' | 'select' | 'password';
        key: string;
        value: any;
        options?: string[];
        unit?: string;
    }>({ isOpen: false, title: '', type: 'text', key: '', value: '' });
    
    if (!userData) return null;

    const handleOpenEdit = (title: string, key: string, value: any, type: 'text' | 'number' | 'date' | 'select' | 'password', options?: string[], unit?: string) => {
        setEditModal({ isOpen: true, title, key, value, type, options, unit });
    };

    const handleSaveAttribute = async (newValue: any) => {
        const key = editModal.key;
        
        if (key === 'password') {
            const { error } = await supabase.auth.updateUser({ password: newValue });
            if (error) {
                addToast(error.message || 'Erro ao atualizar senha.', 'error');
            } else {
                addToast('Senha atualizada com sucesso.', 'success');
            }
            return;
        }

        let updateData: any = {};
        let finalValue = newValue;

        // Parse numbers if needed
        if (editModal.type === 'number') {
            finalValue = parseFloat(newValue);
        }
        updateData[key] = finalValue;

        // If physical data changes, recalculate goals
        const physicalKeys = ['weight', 'height', 'birth_date', 'gender', 'activity_level'];
        if (physicalKeys.includes(key)) {
            const currentWeight = key === 'weight' ? finalValue : userData.weight;
            const currentHeight = key === 'height' ? finalValue : userData.height;
            const currentGender = key === 'gender' ? finalValue : userData.gender;
            const currentActivity = key === 'activity_level' ? finalValue : userData.activityLevel;
            
            let currentAge = userData.age;
            if (key === 'birth_date' && typeof finalValue === 'string' && finalValue.includes('-')) {
                const birthYear = new Date(finalValue).getFullYear();
                if (!isNaN(birthYear)) {
                    currentAge = new Date().getFullYear() - birthYear;
                    updateData.age = currentAge; // Update age in DB too
                }
            }

            const { calculateGoals } = useAppContext();
            const newGoals = calculateGoals(currentWeight, currentActivity, currentHeight, currentAge, currentGender);
            updateData.goals = newGoals;
        }

        const { error } = await supabase.from('profiles').update(updateData).eq('id', userData.id);
        
        if (error) {
            addToast('Erro ao atualizar.', 'error');
        } else {
            await fetchData();
            addToast('Perfil atualizado.', 'success');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handleGenerateReport = () => {
        setShowReportModal(false);
        addToast("Gerando relatório...", "info");
        setTimeout(() => {
            addToast("Relatório enviado para o seu e-mail com sucesso!", "success");
        }, 2000);
    };

    const handleLanguage = () => {
        addToast("No momento, apenas o idioma Português (BR) está disponível.", "info");
    };

    const handleRateApp = () => {
        addToast("Obrigado! Redirecionando para a loja de aplicativos...", "success");
    };

    const toggleUnit = (newUnit: 'metric' | 'imperial') => {
        setUnit(newUnit);
        addToast(`Unidades alteradas para o sistema ${newUnit === 'metric' ? 'Métrico' : 'Imperial'}.`, "success");
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    const referralCode = userData.id.substring(0, 8).toUpperCase();
    const referralLink = `https://fitmindhealth.com.br/invite/${referralCode}`;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Convite Exclusivo - FitMind',
                    text: 'Estou testando o FitMind e você ganhou um convite exclusivo!',
                    url: referralLink,
                });
            } catch (err) {
                console.log('Erro ao compartilhar', err);
            }
        } else {
            handleCopy(e);
        }
    };

    return (
        <div className="bg-[#F5F5F7] dark:bg-black min-h-screen pb-24 animate-fade-in">
            <header className="pt-12 pb-6 px-5 flex justify-center items-center sticky top-0 bg-[#F5F5F7]/80 dark:bg-black/80 backdrop-blur-md z-10">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Configurações</h1>
            </header>

            <div className="px-5">
                {/* Test Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                    <button 
                        onClick={() => setShowTrialResults(true)}
                        className="w-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        <Star className="w-5 h-5" />
                        <span className="text-sm">Testar Tela Fim do Teste</span>
                    </button>
                    <button 
                        onClick={() => setShowTrialTest(true)}
                        className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="text-sm">Testar Copy de Retenção</span>
                    </button>
                </div>

                <SettingsGroup>
                    <div 
                        className="bg-white dark:bg-[#1C1C1E] p-4 flex items-center cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors" 
                        onClick={() => navigate('/settings/account')}
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mr-4 shadow-sm flex-shrink-0">
                            <User className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{userData.name || 'Usuário'}</h2>
                            <p className="text-[15px] text-gray-500 dark:text-gray-400">Minha conta</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    </div>
                </SettingsGroup>

                <SettingsGroup title="Tratamento e metas">
                    <SettingsItem 
                        icon={<Pill className="w-5 h-5 text-red-500" />}
                        label="Tratamento" 
                        onClick={() => navigate('/settings/treatment')} 
                    />
                    <SettingsItem 
                        icon={<Target className="w-5 h-5 text-teal-500" />}
                        label="Metas de peso" 
                        onClick={() => navigate('/settings/weight-goals')} 
                    />
                    <SettingsItem 
                        icon={<Utensils className="w-5 h-5 text-orange-500" />}
                        label="Metas de alimentação" 
                        onClick={() => navigate('/settings/lifestyle')} 
                    />
                    <SettingsItem 
                        icon={<Activity className="w-5 h-5 text-green-500" />}
                        label="Metas de atividade" 
                        onClick={() => navigate('/settings/lifestyle')} 
                    />
                    <SettingsItem 
                        icon={<FileText className="w-5 h-5 text-blue-500" />}
                        label="Gerar Relatório do Tratamento" 
                        onClick={() => setShowReportModal(true)} 
                        isLast
                    />
                </SettingsGroup>

                <SettingsGroup title="Dados gerais">
                    <SettingsItem 
                        icon={<Scale className="w-5 h-5 text-orange-500" />}
                        label="Peso" 
                        value={`${userData.weight || 0} kg`}
                        onClick={() => handleOpenEdit('Peso Atual', 'weight', userData.weight, 'number', undefined, 'kg')} 
                    />
                    <SettingsItem 
                        icon={<Ruler className="w-5 h-5 text-blue-500" />}
                        label="Altura" 
                        value={`${userData.height || 0} cm`}
                        onClick={() => handleOpenEdit('Atualizar Altura', 'height', userData.height, 'number', undefined, 'cm')} 
                    />
                    <SettingsItem 
                        icon={<Cake className="w-5 h-5 text-red-500" />}
                        label="Aniversário" 
                        value={formatDate(userData.birthDate)}
                        onClick={() => handleOpenEdit('Data de Nascimento', 'birth_date', userData.birthDate || '', 'date')} 
                    />
                    <SettingsItem 
                        icon={<User className="w-5 h-5 text-purple-500" />}
                        label="Gênero" 
                        value={userData.gender}
                        onClick={() => handleOpenEdit('Gênero', 'gender', userData.gender, 'select', ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'])} 
                    />
                    <SettingsItem 
                        icon={<Ruler className="w-5 h-5 text-orange-500" />}
                        label="Medidas Corporais" 
                        onClick={() => navigate('/settings/account')} 
                        isLast
                    />
                </SettingsGroup>

                <SettingsGroup title="Indique e Ganhe">
                    <div className="p-4 bg-white dark:bg-[#1C1C1E]">
                        <div 
                            onClick={() => navigate('/referrals')}
                            className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/20 cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <Gift className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Indique e Ganhe</h3>
                                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Ganhe até 1 mês grátis</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-purple-400" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Convide amigos para o FitMind e desbloqueie meses de acesso PRO gratuitamente.
                            </p>
                        </div>
                    </div>
                    
                    <div className="pl-4 bg-white dark:bg-[#1C1C1E]">
                        <div className="flex items-center w-full py-3 pr-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-grow text-left">
                                <div className="text-[12px] text-gray-500 dark:text-gray-400">Saldo disponível</div>
                                <div className="text-[16px] font-bold text-gray-900 dark:text-white">R$ 0,00</div>
                            </div>
                        </div>
                    </div>
                </SettingsGroup>

                <SettingsGroup title="Preferências">
                    <SettingsItem 
                        icon={<Bell className="w-5 h-5 text-yellow-500" />}
                        label="Notificações" 
                        onClick={() => setShowNotifications(true)} 
                    />
                    <div className="pl-4 bg-white dark:bg-[#1C1C1E]">
                        <div className="flex items-center justify-between py-3.5 pr-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center">
                                <Scale className="w-5 h-5 text-blue-500 mr-3" />
                                <span className="text-[16px] text-gray-900 dark:text-white">Unidades</span>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                                <button 
                                    onClick={() => toggleUnit('metric')}
                                    className={`px-3 py-1 text-[13px] font-medium rounded-md shadow-sm transition-colors ${unit === 'metric' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 bg-transparent shadow-none'}`}
                                >
                                    Métrico
                                </button>
                                <button 
                                    onClick={() => toggleUnit('imperial')}
                                    className={`px-3 py-1 text-[13px] font-medium rounded-md shadow-sm transition-colors ${unit === 'imperial' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 bg-transparent shadow-none'}`}
                                >
                                    Imperial
                                </button>
                            </div>
                        </div>
                    </div>
                    <SettingsItem 
                        icon={<Globe className="w-5 h-5 text-blue-500" />}
                        label="Idioma" 
                        value="🇧🇷 PT"
                        onClick={handleLanguage} 
                    />
                    <ToggleItem 
                        icon={<Moon className="w-5 h-5 text-indigo-500" />}
                        label="Modo Escuro" 
                        isEnabled={theme === 'dark'} 
                        onToggle={toggleTheme} 
                        isLast
                    />
                </SettingsGroup>

                <SettingsGroup title="Suporte">
                    <SettingsItem 
                        icon={<Star className="w-5 h-5 text-yellow-500" />}
                        label="Avalie o App" 
                        onClick={handleRateApp} 
                    />
                    <SettingsItem 
                        icon={<Lightbulb className="w-5 h-5 text-yellow-500" />}
                        label="Enviar Sugestão" 
                        onClick={() => window.location.href = "mailto:support@fitmind.app?subject=Sugestão"} 
                    />
                    <SettingsItem 
                        icon={<Mail className="w-5 h-5 text-red-500" />}
                        label="Fale com o Suporte" 
                        onClick={() => window.location.href = "mailto:support@fitmind.app"} 
                        isLast
                    />
                </SettingsGroup>

                <SettingsGroup title="Legal">
                    <SettingsItem 
                        icon={<Shield className="w-5 h-5 text-blue-900 dark:text-blue-400" />}
                        label="Política de Privacidade" 
                        onClick={() => navigate('/privacy')} 
                    />
                    <SettingsItem 
                        icon={<FileSignature className="w-5 h-5 text-gray-500" />}
                        label="Termos e Condições" 
                        onClick={() => navigate('/terms')} 
                        isLast
                    />
                </SettingsGroup>

                <SettingsGroup>
                    <SettingsItem 
                        icon={<LogOut className="w-5 h-5 text-red-500" />}
                        label="Sair" 
                        isDestructive
                        onClick={handleLogout} 
                        isLast
                    />
                </SettingsGroup>
            </div>
            
            <p className="text-center text-gray-400 text-xs mt-8 mb-10 font-medium">FitMind Health Technologies</p>
            
            <NotificationSettingsModal 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
            />

            <ConfirmModal
                isOpen={showReportModal}
                title="Gerar Relatório"
                message="Deseja gerar um relatório completo do seu tratamento e enviar para o seu e-mail cadastrado?"
                confirmText="Gerar Relatório"
                cancelText="Cancelar"
                onConfirm={handleGenerateReport}
                onCancel={() => setShowReportModal(false)}
            />

            {showTrialResults && (
                <TrialResultsScreen onClose={() => setShowTrialResults(false)} />
            )}

            <TrialTestModal 
                isOpen={showTrialTest} 
                onClose={() => setShowTrialTest(false)} 
            />

            {editModal.isOpen && (
                <EditAttributeModal
                    title={editModal.title}
                    initialValue={editModal.value}
                    type={editModal.type}
                    options={editModal.options}
                    unit={editModal.unit}
                    onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                    onSave={handleSaveAttribute}
                />
            )}
        </div>
    );
};
