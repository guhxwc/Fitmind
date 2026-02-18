
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { ChevronRightIcon, CameraIcon, XMarkIcon } from '../core/Icons';
import Portal from '../core/Portal';

// --- UI Components ---

const ListGroup: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        {title && (
            <h3 className="px-4 mb-2 text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                {title}
            </h3>
        )}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[18px] overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-800">
            {children}
        </div>
    </div>
);

const ListItem: React.FC<{ 
    label: string; 
    value: string; 
    onClick?: () => void; 
    isLast?: boolean;
}> = ({ label, value, onClick, isLast }) => (
    <button 
        onClick={onClick}
        disabled={!onClick}
        className={`w-full flex items-center justify-between pl-4 pr-4 py-3.5 bg-white dark:bg-[#1C1C1E] active:bg-gray-50 dark:active:bg-gray-800 transition-colors ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
    >
        <span className="text-[17px] text-gray-900 dark:text-white font-medium">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-[17px] text-gray-500 dark:text-gray-400">{value}</span>
            {onClick && <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-70" />}
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

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Definir';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans pb-24 animate-fade-in">
            {/* Navbar Style Header */}
            <div className="sticky top-0 z-20 bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between max-w-md mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500 hover:text-blue-600 font-medium text-[17px] flex items-center gap-1">
                        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M11.67 1.86998L9.9 0.0999756L0 9.99998L9.9 19.9L11.67 18.13L3.54 9.99998L11.67 1.86998Z" fill="currentColor"/></svg>
                        Ajustes
                    </button>
                    <h1 className="font-semibold text-[17px] text-gray-900 dark:text-white">Minha Conta</h1>
                    <div className="w-16"></div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-8">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => handleOpenEdit('Editar Nome', 'name', userData.name, 'text')}>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-300 shadow-md">
                            {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-[#F2F2F7] dark:border-black text-white shadow-sm">
                            <CameraIcon className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 tracking-tight">{userData.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{session.user.email}</p>
                </div>

                {/* Personal Info Group */}
                <ListGroup title="Informações Pessoais">
                    <ListItem 
                        label="Nome" 
                        value={userData.name} 
                        onClick={() => handleOpenEdit('Editar Nome', 'name', userData.name, 'text')} 
                    />
                    <ListItem 
                        label="Gênero" 
                        value={userData.gender} 
                        onClick={() => handleOpenEdit('Gênero', 'gender', userData.gender, 'select', ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'])} 
                    />
                    <ListItem 
                        label="Data de Nascimento" 
                        value={formatDate(userData.birthDate)} 
                        onClick={() => handleOpenEdit('Data de Nascimento', 'birth_date', userData.birthDate || '', 'date')} 
                        isLast
                    />
                </ListGroup>

                {/* Body Metrics Group */}
                <ListGroup title="Medidas Corporais">
                    <ListItem 
                        label="Altura" 
                        value={`${userData.height} cm`} 
                        onClick={() => handleOpenEdit('Atualizar Altura', 'height', userData.height, 'number', undefined, 'cm')} 
                    />
                    <ListItem 
                        label="Peso Inicial" 
                        value={`${userData.startWeight} kg`} 
                        onClick={() => handleOpenEdit('Peso Inicial', 'start_weight', userData.startWeight, 'number', undefined, 'kg')} 
                    />
                    <ListItem 
                        label="Meta de Peso" 
                        value={`${userData.targetWeight} kg`} 
                        onClick={() => handleOpenEdit('Meta de Peso', 'target_weight', userData.targetWeight, 'number', undefined, 'kg')} 
                        isLast
                    />
                </ListGroup>

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
