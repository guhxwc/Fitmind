
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { ChevronRightIcon, CameraIcon, XMarkIcon, ScaleIcon, RulerIcon, CakeIcon, GenderIcon, MailIcon, PersonStandingIcon, SettingsIcon } from '../core/Icons';
import Portal from '../core/Portal';

// --- UI Components ---

const ListGroup: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        {title && (
            <h3 className="px-4 mb-2 text-[15px] font-semibold text-gray-400 dark:text-gray-500 ml-1">
                {title}
            </h3>
        )}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] overflow-hidden shadow-sm">
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
}> = ({ icon, label, value, onClick, isLast }) => (
    <button 
        onClick={onClick}
        disabled={!onClick}
        className="w-full flex items-center pl-4 bg-white dark:bg-[#1C1C1E] active:bg-gray-50 dark:active:bg-gray-800 transition-colors relative"
    >
        {icon && <div className="mr-4 flex-shrink-0 w-6 flex items-center justify-center">{icon}</div>}
        <div className={`flex-grow flex items-center justify-between pr-4 py-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''} overflow-hidden`}>
            <span className="text-[17px] text-gray-900 dark:text-white font-medium whitespace-nowrap flex-shrink-0">{label}</span>
            <div className="flex items-center gap-2 overflow-hidden ml-4 justify-end">
                {value && <span className="text-[17px] text-gray-400 dark:text-gray-500 truncate">{value}</span>}
                {onClick && <ChevronRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
            </div>
        </div>
    </button>
);

// --- Modal Component ---

interface EditAttributeModalProps {
    title: string;
    initialValue: string | number;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[];
    onClose: () => void;
    onSave: (value: any) => Promise<void>;
    unit?: string;
}

const EditAttributeModal: React.FC<EditAttributeModalProps> = ({ title, initialValue, type, options, onClose, onSave, unit }) => {
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await onSave(value);
        setLoading(false);
        onClose();
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/30 z-[90] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-sm rounded-[24px] p-6 shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        <button onClick={onClose} className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                            <XMarkIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    
                    <div className="mb-8">
                        {type === 'select' ? (
                            <div className="space-y-2">
                                {options?.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setValue(opt)}
                                        className={`w-full p-3.5 rounded-xl font-medium text-left transition-all text-[17px] flex justify-between items-center ${
                                            value === opt 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        {opt}
                                        {value === opt && <span className="text-blue-500">✓</span>}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type={type}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-4 text-2xl font-bold text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    autoFocus
                                />
                                {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{unit}</span>}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSave} 
                        disabled={loading} 
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-bold text-[17px] active:scale-[0.98] transition-transform disabled:opacity-70"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </Portal>
    );
};

// --- Main Page ---

export const AccountSettings: React.FC = () => {
    const { userData, session, fetchData } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    // Edit Modal State
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        title: string;
        type: 'text' | 'number' | 'date' | 'select';
        key: string;
        value: any;
        options?: string[];
        unit?: string;
    }>({ isOpen: false, title: '', type: 'text', key: '', value: '' });

    if (!userData || !session) return null;

    const handleOpenEdit = (title: string, key: string, value: any, type: 'text' | 'number' | 'date' | 'select', options?: string[], unit?: string) => {
        setEditModal({ isOpen: true, title, key, value, type, options, unit });
    };

    const handleSaveAttribute = async (newValue: any) => {
        const key = editModal.key;
        let updateData: any = {};

        // Parse numbers if needed
        if (editModal.type === 'number') {
            updateData[key] = parseFloat(newValue);
        } else {
            updateData[key] = newValue;
        }

        const { error } = await supabase.from('profiles').update(updateData).eq('id', userData.id);
        
        if (error) {
            addToast('Erro ao atualizar.', 'error');
        } else {
            await fetchData();
            addToast('Perfil atualizado.', 'success');
        }
    };

    const handleDeleteAccount = async () => {
        if (!userData || !session) return;

        const confirmed = window.confirm(
            "TEM CERTEZA? Esta ação é permanente e apagará todos os seus dados de progresso, fotos, histórico de peso e configurações. Não há como desfazer."
        );

        if (!confirmed) return;

        try {
            addToast("Excluindo conta...", "info");
            
            // 1. Delete all user data from all tables
            const userId = userData.id;
            const tables = [
                'weight_history', 
                'progress_photos', 
                'workout_plans', 
                'workout_history', 
                'applications', 
                'daily_records', 
                'daily_notes', 
                'side_effects'
            ];

            for (const table of tables) {
                await supabase.from(table).delete().eq('user_id', userId);
            }
            
            // Delete profile last
            await supabase.from('profiles').delete().eq('id', userId);

            // 2. Sign out
            await supabase.auth.signOut();
            
            // 3. Clear local storage
            localStorage.clear();
            
            addToast("Conta excluída com sucesso.", "success");
            navigate('/auth');
        } catch (error) {
            console.error("Error deleting account:", error);
            addToast("Erro ao excluir conta. Tente novamente.", "error");
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

            <div className="max-w-md mx-auto px-4 pt-8">
                
                {/* Personal Info Group */}
                <ListGroup title="Dados gerais">
                    <ListItem 
                        icon={<ScaleIcon className="w-6 h-6 text-orange-400" />}
                        label="Peso" 
                        value={`${userData.weight} kg`} 
                        onClick={() => handleOpenEdit('Peso Atual', 'weight', userData.weight, 'number', undefined, 'kg')} 
                    />
                    <ListItem 
                        icon={<RulerIcon className="w-6 h-6 text-blue-500" />}
                        label="Altura" 
                        value={`${userData.height} cm`} 
                        onClick={() => handleOpenEdit('Atualizar Altura', 'height', userData.height, 'number', undefined, 'cm')} 
                    />
                    <ListItem 
                        icon={<CakeIcon className="w-6 h-6 text-red-400" />}
                        label="Aniversário" 
                        value={formatDate(userData.birthDate)} 
                        onClick={() => handleOpenEdit('Data de Nascimento', 'birth_date', userData.birthDate || '', 'date')} 
                    />
                    <ListItem 
                        icon={<GenderIcon className="w-6 h-6 text-purple-600" />}
                        label="Gênero" 
                        value={userData.gender} 
                        onClick={() => handleOpenEdit('Gênero', 'gender', userData.gender, 'select', ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'])} 
                    />
                    <ListItem 
                        icon={<MailIcon className="w-6 h-6 text-blue-400" />}
                        label="Dados pessoais" 
                        value={session.user.email} 
                        onClick={() => navigate('/settings/personal-data')} 
                    />
                    <ListItem 
                        icon={<PersonStandingIcon className="w-6 h-6 text-green-500" />}
                        label="Nível de Atividade" 
                        value={userData.activityLevel} 
                        onClick={() => handleOpenEdit('Nível de Atividade', 'activityLevel', userData.activityLevel, 'select', ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Ativo', 'Muito ativo'])} 
                    />
                    <ListItem 
                        icon={<SettingsIcon className="w-6 h-6 text-blue-500" />}
                        label="Configurações iniciais" 
                        onClick={() => navigate('/settings/initial-setup')} 
                        isLast
                    />
                </ListGroup>
                
                <div className="mt-12 mb-8">
                    <button 
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-[#1C1C1E] text-red-500 font-bold rounded-2xl border border-red-100 dark:border-red-900/30 active:scale-[0.98] transition-all shadow-sm"
                    >
                        Excluir Minha Conta
                    </button>
                    <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-4 px-8 leading-relaxed">
                        Ao excluir sua conta, todos os seus dados serão removidos permanentemente de nossos servidores em conformidade com a LGPD.
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 px-6 leading-relaxed">
                    Esses dados são usados para calcular seu metabolismo basal, IMC e necessidades de água. Mantenha-os atualizados para melhores resultados.
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
        </div>
    );
};
