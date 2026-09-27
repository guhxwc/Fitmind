
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { useToast } from '../ToastProvider';
import { SyringeIcon, CalendarIcon, ClockIcon, MapPinIcon, ChevronRightIcon, ChevronLeftIcon } from '../core/Icons';
import { MEDICATIONS, WEEKDAYS } from '../../constants';
import type { MedicationName, Weekday } from '../../types';
import { TimePicker } from '../core/TimePicker';
import Portal from '../core/Portal';
import { getAllDosesForMedication, saveCustomDose, formatDoseInput, getCustomDoses } from '../../lib/doses';

const DoseSelectModal: React.FC<{
    medicationName: string;
    options: string[];
    selectedValue: string;
    onClose: () => void;
    onSelect: (val: string) => void;
}> = ({ medicationName, options, selectedValue, onClose, onSelect }) => {
    const [isCustom, setIsCustom] = useState(false);
    const [customVal, setCustomVal] = useState('');

    const handleSaveCustom = () => {
        const formatted = formatDoseInput(customVal);
        if (!formatted) return;
        saveCustomDose(medicationName, formatted);
        onSelect(formatted);
        onClose();
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/60 z-[90] flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] p-6 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dosagem</h3>
                        <button onClick={onClose} className="text-blue-500 font-semibold">Fechar</button>
                    </div>

                    {!isCustom ? (
                        <div className="space-y-2 pb-8">
                            {options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { onSelect(opt); onClose(); }}
                                    className={`w-full p-4 rounded-xl text-left font-semibold text-lg flex justify-between items-center ${
                                        selectedValue === opt
                                            ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800'
                                    }`}
                                >
                                    <span>{opt}</span>
                                    {selectedValue === opt && <span className="text-blue-500">✓</span>}
                                </button>
                            ))}

                            <button
                                onClick={() => setIsCustom(true)}
                                className="w-full p-4 rounded-xl text-left font-semibold text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between border border-dashed border-emerald-300 dark:border-emerald-800 mt-3"
                            >
                                <span className="flex items-center gap-2">
                                    <span>✨</span>
                                    <span>Outra dose (personalizada)</span>
                                </span>
                                <span className="text-sm font-bold">+ Digitar</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-8">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Digite a dose prescrita para você. Ela ficará salva nesta lista para as próximas aplicações.
                            </p>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Ex: 0,75 mg ou 3 mg"
                                className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none border-2 border-transparent focus:border-emerald-500"
                                value={customVal}
                                onChange={e => setCustomVal(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveCustom();
                                    }
                                }}
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCustom(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveCustom}
                                    disabled={!customVal.trim()}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-emerald-600 text-white disabled:opacity-40"
                                >
                                    Salvar dose
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Portal>
    );
};

const SelectModal: React.FC<{ 
    title: string; 
    options: string[]; 
    onSelect: (val: string) => void; 
    onClose: () => void; 
    selectedValue: string;
    description?: string;
}> = ({ title, options, onSelect, onClose, selectedValue, description }) => (
    <Portal>
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] p-6 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-blue-500 font-semibold">Fechar</button>
                </div>
                {description && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-6 flex gap-3 items-start">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">💡</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>
                )}
                <div className="space-y-2 pb-8">
                    {options.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { onSelect(opt); onClose(); }}
                            className={`w-full p-4 rounded-xl text-left font-semibold text-lg flex justify-between items-center ${
                                selectedValue === opt 
                                ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800'
                            }`}
                        >
                            {opt}
                            {selectedValue === opt && <span className="text-blue-500">✓</span>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </Portal>
);

const SettingRow: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    onClick: () => void;
}> = ({ icon, label, value, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full bg-white dark:bg-gray-900 p-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
        <div className="flex items-center gap-4">
            <div className="text-gray-400 dark:text-gray-500">
                {icon}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">{value}</span>
            <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        </div>
    </button>
);

export const TreatmentSettings: React.FC = () => {
    const { userData, setUserData, fetchData } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    // State for modals
    const [activeModal, setActiveModal] = useState<'medication' | 'frequency' | 'dose' | 'site' | 'time' | 'day' | null>(null);

    if (!userData) return null;

    const availableDoses = getAllDosesForMedication(userData.medication.name, userData.medication.customDoses);
    
    // Handlers
    const handleUpdateDose = async (val: string) => {
        saveCustomDose(userData.medication.name, val);
        const customDoses = getCustomDoses(userData.medication.name);
        const newMedication = { 
            ...userData.medication, 
            dose: val,
            customDoses: customDoses.length > 0 ? customDoses : undefined
        };
        
        // Optimistic Update
        setUserData(prev => prev ? { ...prev, medication: newMedication } : null);

        const { error } = await supabase
            .from('profiles')
            .update({ medication: newMedication })
            .eq('id', userData.id);

        if (error) {
            addToast('Erro ao atualizar dose.', 'error');
            fetchData();
        } else {
            addToast('Dose atualizada com sucesso!', 'success');
        }
    };

    const updateMedication = async (key: string, value: any) => {
        const newMedication = { ...userData.medication, [key]: value };
        
        // Optimistic Update
        setUserData(prev => prev ? { ...prev, medication: newMedication } : null);

        const { error } = await supabase
            .from('profiles')
            .update({ medication: newMedication })
            .eq('id', userData.id);

        if (error) {
            addToast('Erro ao atualizar.', 'error');
            fetchData(); // Revert
        }
    };

    const updateReminderTime = async (newTime: string) => {
        const newReminder = { ...userData.medicationReminder, time: newTime };
        
        // Optimistic Update
        setUserData(prev => prev ? { ...prev, medicationReminder: newReminder as any } : null);

        const { error } = await supabase
            .from('profiles')
            .update({ medication_reminder: newReminder })
            .eq('id', userData.id);

        if (error) {
            addToast('Erro ao atualizar horário.', 'error');
            fetchData();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">Tratamento</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="mt-6 px-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                    <SettingRow 
                        icon={<SyringeIcon className="w-5 h-5" />}
                        label="Medicação"
                        value={userData.medication.name}
                        onClick={() => setActiveModal('medication')}
                    />
                    <SettingRow 
                        icon={<CalendarIcon className="w-5 h-5" />}
                        label="Frequência"
                        value={userData.applicationFrequency}
                        onClick={() => setActiveModal('frequency')}
                    />
                    <SettingRow 
                        icon={<SyringeIcon className="w-5 h-5 rotate-90" />}
                        label="Dosagem"
                        value={userData.medication.dose}
                        onClick={() => setActiveModal('dose')}
                    />
                    <SettingRow 
                        icon={<MapPinIcon className="w-5 h-5" />}
                        label="Local de Aplicação"
                        value={userData.medication.defaultSite || 'Não definido'}
                        onClick={() => setActiveModal('site')}
                    />
                    <SettingRow 
                        icon={<CalendarIcon className="w-5 h-5" />}
                        label="Dia da Aplicação"
                        value={userData.medication.nextApplication || 'Não definido'}
                        onClick={() => setActiveModal('day')}
                    />
                    <SettingRow 
                        icon={<ClockIcon className="w-5 h-5" />}
                        label="Horário"
                        value={userData.medicationReminder?.time || '09:00'}
                        onClick={() => setActiveModal('time')}
                    />
                </div>
            </div>

            {/* Modals */}
            {activeModal === 'medication' && (
                <SelectModal 
                    title="Selecione a Medicação"
                    options={MEDICATIONS.map(m => m.name)}
                    selectedValue={userData.medication.name}
                    onClose={() => setActiveModal(null)}
                    onSelect={(val) => updateMedication('name', val)}
                />
            )}
            {activeModal === 'frequency' && (
                <SelectModal 
                    title="Frequência de Aplicação"
                    options={['Diariamente', 'Semanalmente', 'A cada duas semanas', 'Mensalmente']}
                    selectedValue={userData.applicationFrequency}
                    onClose={() => setActiveModal(null)}
                    onSelect={async (val) => {
                        // This field is on root userData, separate logic
                        setUserData(prev => prev ? {...prev, applicationFrequency: val} : null);
                        await supabase.from('profiles').update({ application_frequency: val }).eq('id', userData.id);
                    }}
                />
            )}
            {activeModal === 'dose' && (
                <DoseSelectModal
                    medicationName={userData.medication.name}
                    options={availableDoses}
                    selectedValue={userData.medication.dose}
                    onClose={() => setActiveModal(null)}
                    onSelect={handleUpdateDose}
                />
            )}
            {activeModal === 'site' && (
                <SelectModal 
                    title="Local Padrão"
                    options={['Abdômen', 'Coxa', 'Braço', 'Rodízio']}
                    selectedValue={userData.medication.defaultSite || ''}
                    onClose={() => setActiveModal(null)}
                    onSelect={(val) => updateMedication('defaultSite', val)}
                />
            )}
            {activeModal === 'day' && (
                <SelectModal 
                    title="Dia da Aplicação"
                    description="O melhor dia para tomar o medicamento é no dia que você mais sente fome."
                    options={WEEKDAYS}
                    selectedValue={userData.medication.nextApplication}
                    onClose={() => setActiveModal(null)}
                    onSelect={(val) => updateMedication('nextApplication', val)}
                />
            )}
            {activeModal === 'time' && (
                <Portal>
                    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
                        <div onClick={e => e.stopPropagation()}>
                            <TimePicker 
                                value={userData.medicationReminder?.time || '09:00'} 
                                onChange={(newTime) => updateReminderTime(newTime)} 
                                onClose={() => setActiveModal(null)} 
                            />
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};