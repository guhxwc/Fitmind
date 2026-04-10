import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { ConfirmModal } from '../ConfirmModal';
import { EditAttributeModal } from '../core/EditAttributeModal';
import { 
    ChevronRightIcon, XMarkIcon, ScaleIcon, RulerIcon, 
    CakeIcon, GenderIcon, PersonStandingIcon, SettingsIcon 
} from '../core/Icons';
import { User, Mail, Lock, CreditCard, Trash2 } from 'lucide-react';
import Portal from '../core/Portal';

// --- UI Components ---

const ListGroup: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        {title && (
            <h3 className="px-4 mb-2 text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1">
                {title}
            </h3>
        )}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800/60">
            {children}
        </div>
    </div>
);

const ListItem: React.FC<{ 
    icon?: React.ReactNode;
    label: string; 
    value?: string; 
    onClick?: () => void; 
    isLast?: boolean;
    isDestructive?: boolean;
}> = ({ icon, label, value, onClick, isLast, isDestructive }) => (
    <button 
        onClick={onClick}
        disabled={!onClick}
        className={`w-full flex items-center pl-4 bg-white dark:bg-[#1C1C1E] transition-colors relative ${onClick ? 'active:bg-gray-50 dark:active:bg-gray-800/50 cursor-pointer' : 'cursor-default'}`}
    >
        {icon && <div className={`mr-3 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isDestructive ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{icon}</div>}
        <div className={`flex-grow flex items-center justify-between pr-4 py-3.5 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800/60' : ''} overflow-hidden`}>
            <span className={`text-[16px] font-medium whitespace-nowrap flex-shrink-0 ${isDestructive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{label}</span>
            <div className="flex items-center gap-2 overflow-hidden ml-4 justify-end">
                {value && <span className="text-[15px] text-gray-500 dark:text-gray-400 truncate">{value}</span>}
                {onClick && <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
            </div>
        </div>
    </button>
);

// --- Main Page ---

export const AccountSettings: React.FC = () => {
    const { userData, session, fetchData, calculateGoals } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();

    React.useEffect(() => {
        window.scrollTo(0, 0);
        const main = document.querySelector('main');
        if (main) main.scrollTo(0, 0);
    }, []);
    
    // Edit Modal State
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        title: string;
        type: 'text' | 'number' | 'date' | 'select' | 'password';
        key: string;
        value: any;
        options?: string[];
        unit?: string;
    }>({ isOpen: false, title: '', type: 'text', key: '', value: '' });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const [isCanceling, setIsCanceling] = useState(false);

    if (!userData || !session) return null;

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

    const handleResetPassword = async () => {
        if (!session?.user?.email) return;
        
        try {
            addToast("Enviando link...", "info");
            const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (error) {
                throw error;
            }
            
            addToast("Link de redefinição enviado para seu e-mail.", "success");
        } catch (error: any) {
            console.error("Error sending reset password link:", error);
            addToast(error.message || "Erro ao enviar link. Tente novamente.", "error");
        }
    };

    const handleDeleteAccount = async () => {
        if (!userData || !session) return;

        try {
            addToast("Excluindo conta...", "info");

            const { data, error } = await supabase.functions.invoke('delete-account-final');

            if (error || !data?.success) {
                throw new Error(data?.error || error?.message || 'Erro desconhecido.');
            }

            await supabase.auth.signOut();
            localStorage.clear();

            addToast("Conta excluída com sucesso.", "success");
            navigate('/auth');
        } catch (error: any) {
            console.error("Error deleting account:", error);
            addToast(error.message || "Erro ao excluir conta. Tente novamente.", "error");
        }
    };

    const handleCancelSubscription = async () => {
        setIsCanceling(true);
        try {
            const { data, error } = await supabase.functions.invoke('cancel-subscription');
            
            if (error || data?.error) {
                console.log("Erro na função cancel-subscription. Redirecionando para o portal do Stripe...", error || data?.error);
                
                // Fallback: Redirecionar para o portal de pagamentos do Stripe
                const { data: portalData, error: portalError } = await supabase.functions.invoke('create-portal-session', {
                    body: { returnUrl: window.location.origin + '/#/settings/account' }
                });

                if (portalError) throw new Error(portalError.message);
                if (portalData?.error) throw new Error(portalData.error);
                
                if (portalData?.url) {
                    window.location.href = portalData.url;
                    return;
                }
                
                throw new Error(error?.message || data?.error || "Erro desconhecido");
            }

            addToast("Assinatura cancelada com sucesso.", "success");
            setShowCancelConfirm(false);
            // Reload page or fetch data to reflect changes
            window.location.reload();
        } catch (error: any) {
            console.error("Erro ao cancelar assinatura:", error);
            addToast(error.message || "Erro ao cancelar assinatura.", "error");
        } finally {
            setIsCanceling(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Definir';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans pb-24 animate-fade-in">
            {/* Navbar Style Header */}
            <div className="sticky top-0 z-20 bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between max-w-md mx-auto relative">
                    <div className="flex-1 flex justify-start z-10">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500 hover:text-blue-600 font-medium text-[17px] flex items-center gap-1">
                            <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M11.67 1.86998L9.9 0.0999756L0 9.99998L9.9 19.9L11.67 18.13L3.54 9.99998L11.67 1.86998Z" fill="currentColor"/></svg>
                            Ajustes
                        </button>
                    </div>
                    <h1 className="absolute left-0 right-0 text-center font-semibold text-[17px] text-gray-900 dark:text-white pointer-events-none">Minha Conta</h1>
                    <div className="flex-1 flex justify-end z-10"></div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-6">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
                        <User className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.name || 'Usuário'}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{session.user.email}</p>
                </div>

                <ListGroup title="Informações Pessoais">
                    <ListItem 
                        icon={<User className="w-5 h-5" />}
                        label="Nome" 
                        value={userData.name} 
                        onClick={() => handleOpenEdit('Nome', 'name', userData.name || '', 'text')} 
                    />
                    <ListItem 
                        icon={<Mail className="w-5 h-5" />}
                        label="E-mail" 
                        value={session.user.email} 
                        // Email is usually read-only or requires a specific flow, so we don't make it editable here directly
                    />
                    <ListItem 
                        icon={<Lock className="w-5 h-5" />}
                        label="Senha" 
                        value="Redefinir" 
                        onClick={handleResetPassword} 
                        isLast
                    />
                </ListGroup>

                <ListGroup title="Dados Físicos">
                    <ListItem 
                        icon={<ScaleIcon className="w-5 h-5" />}
                        label="Peso" 
                        value={`${userData.weight} kg`} 
                        onClick={() => handleOpenEdit('Peso Atual', 'weight', userData.weight, 'number', undefined, 'kg')} 
                    />
                    <ListItem 
                        icon={<RulerIcon className="w-5 h-5" />}
                        label="Altura" 
                        value={`${userData.height} cm`} 
                        onClick={() => handleOpenEdit('Atualizar Altura', 'height', userData.height, 'number', undefined, 'cm')} 
                    />
                    <ListItem 
                        icon={<CakeIcon className="w-5 h-5" />}
                        label="Aniversário" 
                        value={formatDate(userData.birthDate)} 
                        onClick={() => handleOpenEdit('Data de Nascimento', 'birth_date', userData.birthDate || '', 'date')} 
                    />
                    <ListItem 
                        icon={<GenderIcon className="w-5 h-5" />}
                        label="Gênero" 
                        value={userData.gender} 
                        onClick={() => handleOpenEdit('Gênero', 'gender', userData.gender, 'select', ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'])} 
                    />
                    <ListItem 
                        icon={<PersonStandingIcon className="w-5 h-5" />}
                        label="Nível de Atividade" 
                        value={userData.activityLevel} 
                        onClick={() => handleOpenEdit('Nível de Atividade', 'activity_level', userData.activityLevel, 'select', ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Ativo', 'Muito ativo'])} 
                        isLast
                    />
                </ListGroup>

                <ListGroup title="Assinatura">
                    <ListItem 
                        icon={<SettingsIcon className="w-5 h-5" />}
                        label="Plano Atual" 
                        value={userData.isPro ? "PRO" : "Gratuito"} 
                    />
                    <ListItem 
                        icon={<CreditCard className="w-5 h-5" />}
                        label="Cancelar Assinatura" 
                        onClick={() => setShowCancelConfirm(true)} 
                        isLast
                    />
                </ListGroup>

                <ListGroup title="Zona de Perigo">
                    <ListItem 
                        icon={<Trash2 className="w-5 h-5" />}
                        label="Excluir Conta" 
                        isDestructive
                        onClick={() => setShowDeleteConfirm(true)} 
                        isLast
                    />
                </ListGroup>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 px-6 leading-relaxed">
                    Seus dados físicos são usados para calcular seu metabolismo basal, IMC e necessidades de água. Mantenha-os atualizados para melhores resultados.
                </p>

            </div>

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

            <ConfirmModal
                isOpen={showCancelConfirm}
                title="Cancelar Assinatura"
                message="Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso aos recursos PRO no final do seu ciclo de faturamento atual."
                confirmText={isCanceling ? "Cancelando..." : "Sim, quero cancelar"}
                cancelText="Voltar"
                onConfirm={handleCancelSubscription}
                onCancel={() => setShowCancelConfirm(false)}
                isDestructive={true}
            />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Excluir Conta"
                message="TEM CERTEZA? Esta ação é permanente e apagará todos os seus dados de progresso, fotos, histórico de peso e configurações. Não há como desfazer."
                confirmText="Excluir Permanentemente"
                cancelText="Cancelar"
                onConfirm={() => {
                    setShowDeleteConfirm(false);
                    handleDeleteAccount();
                }}
                onCancel={() => setShowDeleteConfirm(false)}
                isDestructive={true}
            />
        </div>
    );
};