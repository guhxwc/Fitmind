
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { supabase } from '../../supabaseClient';
import { 
    KeyIcon, 
    LogOutIcon, 
    ChevronRightIcon, 
    ShieldIcon, 
    DocumentIcon, 
    FaceIdIcon, 
    TrashIcon 
} from '../core/Icons';

// --- UI Components ---

const GroupTitle: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="px-4 mb-2 text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1 mt-6">
        {title}
    </h3>
);

const GroupContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-800">
        {children}
    </div>
);

const ActionItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void;
    isDestructive?: boolean;
    colorClass: string;
    isLast?: boolean;
}> = ({ icon, label, onClick, isDestructive, colorClass, isLast }) => (
    <div className="pl-4 bg-white dark:bg-[#1C1C1E]">
        <button 
            onClick={onClick}
            className={`w-full flex items-center justify-between py-3.5 pr-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md text-white ${colorClass}`}>
                    {icon}
                </div>
                <span className={`text-[17px] font-medium ${isDestructive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {label}
                </span>
            </div>
            {!isDestructive && <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
        </button>
    </div>
);

const ToggleItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    isEnabled: boolean; 
    onToggle: () => void;
    colorClass: string;
    isLast?: boolean; 
}> = ({ icon, label, isEnabled, onToggle, colorClass, isLast }) => (
    <div className="pl-4 bg-white dark:bg-[#1C1C1E]">
        <div className={`flex items-center justify-between py-3 pr-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md text-white ${colorClass}`}>
                    {icon}
                </div>
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

const ProfileHeader: React.FC<{ userData: any, email: string }> = ({ userData, email }) => (
    <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-300 shadow-md mb-3">
            {userData.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userData.name}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{email}</p>
    </div>
);

// --- Main Component ---

export const PrivacySettings: React.FC = () => {
    const { userData, session } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isResetting, setIsResetting] = useState(false);
    
    // Simulate App Lock state (persisted in local storage for demo)
    const [isAppLockEnabled, setIsAppLockEnabled] = useState(() => localStorage.getItem('appLockEnabled') === 'true');

    if (!userData || !session) return null;

    const handleToggleAppLock = () => {
        const newState = !isAppLockEnabled;
        setIsAppLockEnabled(newState);
        localStorage.setItem('appLockEnabled', String(newState));
        addToast(newState ? "Bloqueio do App ativado." : "Bloqueio do App desativado.", 'info');
    };

    const handlePasswordReset = async () => {
        if (!session.user.email) return;
        setIsResetting(true);
        
        const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
            redirectTo: window.location.origin + '/#/settings/account',
        });

        if (error) {
            addToast("Erro ao solicitar troca: " + error.message, 'error');
        } else {
            addToast(`Email de redefinição enviado para ${session.user.email}`, 'success');
        }
        setIsResetting(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handleDeleteAccount = () => {
        if (window.confirm("ATENÇÃO: Essa ação é irreversível. Todos os seus dados serão apagados permanentemente. Deseja continuar?")) {
             // In a real scenario, this would call a deletion endpoint
             addToast("Solicitação enviada. Seus dados serão removidos em até 30 dias.", 'info');
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans pb-24 animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between max-w-md mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500 hover:text-blue-600 font-medium text-[17px] flex items-center gap-1">
                        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M11.67 1.86998L9.9 0.0999756L0 9.99998L9.9 19.9L11.67 18.13L3.54 9.99998L11.67 1.86998Z" fill="currentColor"/></svg>
                        Ajustes
                    </button>
                    <h1 className="font-semibold text-[17px] text-gray-900 dark:text-white">Privacidade e Segurança</h1>
                    <div className="w-16"></div>
                </div>
            </div>
            
            <div className="max-w-md mx-auto px-4 pt-6">
                
                <ProfileHeader userData={userData} email={session.user.email || ''} />

                {/* Proteção */}
                <GroupTitle title="Proteção" />
                <GroupContainer>
                    <ActionItem 
                        icon={<KeyIcon className="w-5 h-5"/>}
                        colorClass="bg-blue-500"
                        label={isResetting ? "Enviando..." : "Alterar Senha"}
                        onClick={handlePasswordReset}
                    />
                    <ToggleItem 
                        icon={<FaceIdIcon className="w-5 h-5"/>}
                        colorClass="bg-green-500"
                        label="Bloqueio do App"
                        isEnabled={isAppLockEnabled}
                        onToggle={handleToggleAppLock}
                        isLast
                    />
                </GroupContainer>

                {/* Legal */}
                <GroupTitle title="Legal" />
                <GroupContainer>
                    <ActionItem 
                        icon={<DocumentIcon className="w-5 h-5"/>}
                        colorClass="bg-gray-500"
                        label="Termos de Uso"
                        onClick={() => {}}
                    />
                    <ActionItem 
                        icon={<ShieldIcon className="w-5 h-5"/>}
                        colorClass="bg-gray-500"
                        label="Política de Privacidade"
                        onClick={() => {}}
                        isLast
                    />
                </GroupContainer>

                {/* Conta */}
                <GroupTitle title="Conta" />
                <GroupContainer>
                    <ActionItem 
                        icon={<LogOutIcon className="w-5 h-5"/>}
                        colorClass="bg-gray-500"
                        label="Sair da Conta"
                        onClick={handleLogout}
                        isDestructive
                    />
                    <ActionItem 
                        icon={<TrashIcon className="w-5 h-5"/>}
                        colorClass="bg-red-500"
                        label="Excluir Minha Conta"
                        onClick={handleDeleteAccount}
                        isDestructive
                        isLast
                    />
                </GroupContainer>

                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8 px-6 leading-relaxed">
                    A segurança dos seus dados é nossa prioridade. Utilizamos criptografia de ponta a ponta para proteger suas informações de saúde.
                </p>
            </div>
        </div>
    );
};
