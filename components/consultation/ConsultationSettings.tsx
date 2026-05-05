import { ChevronLeft, ChevronRight, Eye, RefreshCw, X, User, Calendar, Ruler, Activity, Mail, Phone, Heart, Crosshair, FileText, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { useToast } from '../ToastProvider';
import { EditAttributeModal } from '../core/EditAttributeModal';
import { useNavigate } from 'react-router-dom';
import Portal from '../core/Portal';

interface ConsultationSettingsProps {
    onClose: () => void;
    consultationData?: any;
    onReload?: () => void;
}

export const ConsultationSettings: React.FC<ConsultationSettingsProps> = ({ onClose, consultationData, onReload }) => {
    const { userData, fetchData, consultationStatus, session } = useAppContext();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [editModal, setEditModal] = useState<{ isOpen: boolean; key: string; title: string; initialValue: any; type: any; unit?: string } | null>(null);

    if (!userData) return null;

    const handleSaveAttribute = async (newValue: any) => {
        if (!editModal || !userData?.id) return;
        const key = editModal.key;

        let updateData: any = {};
        let finalValue = newValue;

        if (editModal.type === 'number') {
            finalValue = parseFloat(newValue as string);
        }
        updateData[key] = finalValue;

        // If birth_date updates, calculate age server-side or here
        if (key === 'birth_date' && typeof finalValue === 'string' && finalValue.includes('-')) {
            const birthYear = parseInt(finalValue.split('-')[0], 10);
            if (!isNaN(birthYear)) {
                updateData.age = new Date().getFullYear() - birthYear;
            }
        }

        const { error } = await supabase.from('profiles').update(updateData).eq('id', userData.id);
        
        if (error) {
            console.error("Erro no update perfil:", error);
            addToast('Erro ao atualizar.', 'error');
        } else {
            await fetchData();
            addToast('Atualizado com sucesso.', 'success');
        }
        setEditModal(null);
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '--';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('pt-BR');
    };

    const createdDate = new Date(session?.user?.created_at || new Date()).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute inset-0 z-[50] bg-white dark:bg-[#0B0C10] flex flex-col font-sans h-full overflow-y-auto scrollbar-hide pb-20"
        >
            {/* Header */}
            <div className="px-6 pt-10 pb-6 bg-white dark:bg-[#0B0C10] sticky top-0 z-10 flex flex-col items-center justify-center relative">
                <button onClick={onClose} className="absolute left-6 top-10 w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-full flex flex-col items-center justify-center text-center mt-2">
                   <h1 className="text-[32px] font-bold text-gray-900 dark:text-white leading-[1.1] mb-2 tracking-tight">Configurações</h1>
                   <p className="text-[14px] text-gray-500 font-medium">Gerencie seus dados e preferências</p>
                </div>
            </div>

            <div className="px-6 pb-20 space-y-8">
                {/* Profile Card */}
                <div className="bg-gray-50 dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-800 rounded-[28px] p-5 shadow-sm flex items-center gap-5 relative overflow-hidden">
                    <div className="w-[72px] h-[72px] rounded-full bg-gray-200 shrink-0 overflow-hidden ring-4 ring-white dark:ring-[#2C2C2E] shadow-sm">
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400">
                            {userData.name?.charAt(0)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[20px] font-bold text-gray-900 dark:text-white leading-tight truncate mb-1.5">{userData.name || 'Paciente'}</h2>
                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full w-fit mb-2">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                           <span className="text-[11px] font-bold uppercase tracking-wider">{consultationStatus === 'active' ? 'Consulta ativa' : 'Aguardando'}</span>
                        </div>
                        <p className="text-[12px] font-medium text-gray-500">Paciente desde {createdDate}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 absolute right-5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Section 1: Dados pessoais */}
                <div>
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4">Dados pessoais</h3>
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800/50">
                        <SettingItem 
                            icon={<User className="w-[18px] h-[18px] text-[#007AFF]" />}
                            label="Nome completo"
                            value={userData.name}
                            onClick={() => setEditModal({ isOpen: true, key: 'name', title: 'Editar Nome', initialValue: userData.name, type: 'text' })}
                        />
                        <SettingItem 
                            icon={<Calendar className="w-[18px] h-[18px] text-[#007AFF]" />}
                            label="Data de nascimento"
                            value={formatDate(userData.birthDate)}
                            onClick={() => setEditModal({ isOpen: true, key: 'birth_date', title: 'Data de Nascimento', initialValue: userData.birthDate || '', type: 'date' })}
                        />
                        <SettingItem 
                            icon={<Ruler className="w-[18px] h-[18px] text-[#007AFF]" />}
                            label="Altura"
                            value={userData.height ? `${userData.height.toString().replace('.', ',')} m` : '--'}
                            onClick={() => setEditModal({ isOpen: true, key: 'height', title: 'Altura (m)', initialValue: userData.height || '', type: 'number', unit: 'm' })}
                        />
                        <SettingItem 
                            icon={<Activity className="w-[18px] h-[18px] text-[#007AFF]" />}
                            label="Peso atual"
                            value={userData.weight ? `${userData.weight.toString().replace('.', ',')} kg` : '--'}
                            onClick={() => setEditModal({ isOpen: true, key: 'weight', title: 'Peso (kg)', initialValue: userData.weight || '', type: 'number', unit: 'kg' })}
                        />
                        <SettingItem 
                            icon={<Mail className="w-[18px] h-[18px] text-[#007AFF]" />}
                            label="E-mail"
                            value={session?.user?.email || '--'}
                            onClick={() => {}} // Usually can't edit email easily without auth workflow
                        />
                        <SettingItem 
                            icon={<Phone className="w-[18px] h-[18px] text-[#007AFF]" />}
                            label="Telefone"
                            value={userData.whatsapp || '--'}
                            onClick={() => setEditModal({ isOpen: true, key: 'whatsapp', title: 'Telefone', initialValue: userData.whatsapp || '', type: 'text' })}
                        />
                    </div>
                </div>

                {/* Section 2: Seu perfil e preferências */}
                <div>
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4">Seu perfil e preferências</h3>
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800/50">
                        <ActionItem 
                            icon={<div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600"><FileText className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>}
                            title="Anamnese"
                            subtitle="Refaça sua anamnese para atualizar suas informações"
                            actionLabel="Refazer"
                            onClick={() => navigate('/anamnese')}
                        />
                        <ActionItem 
                            icon={<div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl text-green-600"><Heart className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>}
                            title="Preferências alimentares"
                            subtitle="Atualize suas preferências e aversões alimentares"
                            actionLabel="Editar"
                            onClick={() => navigate('/anamnese')} // Can hook this later
                        />
                        <ActionItem 
                            icon={<div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600"><Crosshair className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>}
                            title="Objetivos"
                            subtitle="Revise e atualize seus objetivos atuais"
                            actionLabel="Editar"
                            onClick={() => navigate('/anamnese')}
                        />
                        <ActionItem 
                            icon={<div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600"><Activity className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>}
                            title="Nível de atividade"
                            subtitle="Atualize seu nível de atividade física"
                            actionLabel="Editar"
                            onClick={() => navigate('/anamnese')}
                        />
                    </div>
                </div>
                
                {/* Security footer banner */}
                <div className="bg-[#F8FAFC] dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-[20px] p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="bg-white dark:bg-[#1C1C1E] p-2.5 rounded-full shadow-sm text-blue-600">
                        <Shield className="w-5 h-5" strokeWidth={2.5}/>
                    </div>
                    <div className="flex-1 pt-1">
                        <h4 className="text-[14px] font-bold text-blue-600 dark:text-blue-400 mb-1 leading-tight">Seus dados estão protegidos</h4>
                        <p className="text-[12px] font-medium text-gray-500 leading-tight">Suas informações são confidenciais e compartilhadas apenas com seu nutricionista.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 self-center" />
                </div>
            </div>

            {/* Editor Modal via Portal */}
            {editModal && (
                <Portal>
                    <EditAttributeModal
                        title={editModal.title}
                        initialValue={editModal.initialValue}
                        type={editModal.type}
                        unit={editModal.unit}
                        onClose={() => setEditModal(null)}
                        onSave={handleSaveAttribute}
                    />
                </Portal>
            )}
        </motion.div>
    );
};

const SettingItem: React.FC<{ icon: React.ReactNode; label: string; value: string; onClick: () => void }> = ({ icon, label, value, onClick }) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <span className="text-[15px] font-bold text-gray-900 dark:text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">{value}</span>
            <ChevronRight className="w-[18px] h-[18px] text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>
    </div>
);

const ActionItem: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; actionLabel: string; onClick: () => void }> = ({ icon, title, subtitle, actionLabel, onClick }) => (
    <div onClick={onClick} className="flex items-center p-4 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
        <div className="flex-1 flex gap-4 min-w-0">
            <div className="shrink-0 pt-0.5">
                {icon}
            </div>
            <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{title}</span>
                <span className="text-[12px] text-gray-500 leading-tight mt-0.5 line-clamp-2 pr-2">{subtitle}</span>
            </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 bg-transparent py-1.5 pl-2 rounded-full font-bold text-[14px]">
            <span className="text-blue-500">{actionLabel}</span>
            <ChevronRight className="w-[18px] h-[18px] text-blue-500 opacity-70" />
        </div>
    </div>
);
