
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import type { Weekday, ApplicationEntry, MedicationName } from '../../types';
import { SyringeIcon, CheckCircleIcon, EditIcon, TrashIcon, PersonStandingIcon } from '../core/Icons';
import { WEEKDAYS, MEDICATIONS } from '../../constants';
import { useAppContext } from '../AppContext';

// --- Sub-componente: Mapa Visual de Aplicação Compacto ---
const InjectionSiteSelector: React.FC<{
    selectedSite: string;
    onSelect: (site: string) => void;
}> = ({ selectedSite, onSelect }) => {
    
    // Configuração visual dos botões de local
    const renderButton = (id: string, label: string, position: string) => {
        const isSelected = selectedSite === label;
        
        return (
            <button
                key={id}
                onClick={() => onSelect(label)}
                className={`relative h-14 w-full rounded-xl border font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95
                    ${isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
            >
                <span>{position}</span>
                {isSelected && <CheckCircleIcon className="w-4 h-4" />}
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Linha Superior: Braços */}
            <div className="flex gap-2">
                <div className="w-1/2">{renderButton('braco_esq', 'Braço Esquerdo', 'Braço Esq.')}</div>
                <div className="w-1/2">{renderButton('braco_dir', 'Braço Direito', 'Braço Dir.')}</div>
            </div>
            
            {/* Linha do Meio: Abdômen */}
            <div className="flex gap-2">
                <div className="w-1/2">{renderButton('abdomen_esq', 'Abdômen Esq.', 'Abdômen Esq.')}</div>
                <div className="w-1/2">{renderButton('abdomen_dir', 'Abdômen Dir.', 'Abdômen Dir.')}</div>
            </div>

            {/* Linha Inferior: Coxas */}
            <div className="flex gap-2">
                <div className="w-1/2">{renderButton('coxa_esq', 'Coxa Esquerda', 'Coxa Esq.')}</div>
                <div className="w-1/2">{renderButton('coxa_dir', 'Coxa Direita', 'Coxa Dir.')}</div>
            </div>
        </div>
    );
};

const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const getNextApplicationDate = (weekday: Weekday): Date => {
    const today = new Date();
    const todayDayIndex = today.getDay();
    const targetDayIndex = WEEKDAYS.indexOf(weekday);
    let dayDifference = targetDayIndex - todayDayIndex;
    
    // Se o dia já passou nesta semana, vai para a próxima.
    // Se for hoje (0), mantém hoje.
    if (dayDifference < 0) {
        dayDifference += 7;
    }
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + dayDifference);
    return nextDate;
}

const EditApplicationModal: React.FC<{
  entry: ApplicationEntry;
  onClose: () => void;
  onSave: (updatedEntry: ApplicationEntry) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = ({ entry, onClose, onSave, onDelete }) => {
    const [med, setMed] = useState<MedicationName>(entry.medication);
    const [dose, setDose] = useState<string>(entry.dose);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const availableDoses = MEDICATIONS.find(m => m.name === med)?.doses || [];

    const handleSaveClick = async () => {
        setIsSaving(true);
        await onSave({ ...entry, medication: med, dose: dose });
        setIsSaving(false);
    };

    const handleDeleteClick = async () => {
        if(window.confirm("Tem certeza que deseja remover este registro?")) {
            setIsDeleting(true);
            await onDelete(entry.id);
            setIsDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Editar Registro</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Medicamento</label>
                        <div className="flex flex-wrap gap-2">
                            {MEDICATIONS.map(medItem => (
                                <button 
                                    key={medItem.name} 
                                    onClick={() => setMed(medItem.name)} 
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${med === medItem.name ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {medItem.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Dose</label>
                        <select 
                            value={dose} 
                            onChange={(e) => setDose(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {availableDoses.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <button onClick={handleSaveClick} disabled={isSaving} className="w-full bg-white dark:bg-white text-black py-3.5 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button onClick={handleDeleteClick} className="w-full text-red-500 font-semibold py-2">
                        Excluir Registro
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ApplicationTab: React.FC = () => {
  const { userData, applicationHistory, setApplicationHistory, updateStreak } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ApplicationEntry | null>(null);
  
  if (!userData) return null;

  const [selectedMed, setSelectedMed] = useState<MedicationName>(userData.medication.name);
  const [selectedDose, setSelectedDose] = useState<string>(userData.medication.dose);
  const [selectedSite, setSelectedSite] = useState<string>('Abdômen Dir.');

  const handleMedicationSelect = (medName: MedicationName) => {
    setSelectedMed(medName);
    const newMedDoses = MEDICATIONS.find(m => m.name === medName)?.doses || [];
    setSelectedDose(newMedDoses[0] || '');
  };

  const handleLogApplication = async () => {
    setLoading(true);
    
    const newEntry: Omit<ApplicationEntry, 'id' | 'user_id'> = {
      date: new Date().toISOString(),
      medication: selectedMed,
      dose: selectedDose,
      // site: selectedSite // Futuramente adicionar isso ao banco
    };

    const { data, error } = await supabase.from('applications').insert({ ...newEntry, user_id: userData.id }).select();

    if (data) {
      setApplicationHistory(prev => [data[0], ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsSuccess(true);
      updateStreak();
      setTimeout(() => setIsSuccess(false), 2000);
    } else if (error) {
      console.error("Error logging application:", error);
    }
    setLoading(false);
  };

  const handleUpdateApplication = async (updatedEntry: ApplicationEntry) => {
    const { data, error } = await supabase
        .from('applications')
        .update({ medication: updatedEntry.medication, dose: updatedEntry.dose })
        .eq('id', updatedEntry.id)
        .select();

    if (data) {
        setApplicationHistory(prev => 
            prev.map(item => (item.id === updatedEntry.id ? data[0] : item))
        );
        setEditingEntry(null);
    }
    if (error) console.error("Error updating application:", error);
  };

  const handleDeleteApplication = async (id: number) => {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      
      if (!error) {
          setApplicationHistory(prev => prev.filter(item => item.id !== id));
          setEditingEntry(null);
      } else {
          console.error("Error deleting application:", error);
      }
  };
  
  const nextApplicationDate = getNextApplicationDate(userData.medication.nextApplication);
  const availableDoses = MEDICATIONS.find(m => m.name === selectedMed)?.doses || [];

  // Calculate days remaining
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(nextApplicationDate);
  target.setHours(0,0,0,0);
  const diffTime = target.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="p-5 space-y-8 animate-fade-in pb-24">
      <header>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Aplicação</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Registre sua dose e local.</p>
      </header>
      
      <div className="space-y-8">
        
        {/* Modern iOS Style Card */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-soft border border-gray-100 dark:border-white/5">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`flex h-2 w-2 rounded-full ${daysRemaining === 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></span>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Próxima Dose</p>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            {userData.medication.nextApplication}
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-1">
                            {nextApplicationDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    
                    {/* Days Pill */}
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${daysRemaining === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {daysRemaining === 0 ? 'É Hoje!' : daysRemaining === 1 ? 'Amanhã' : `Faltam ${daysRemaining} dias`}
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-blue-500 dark:text-blue-400">
                        <SyringeIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">{userData.medication.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{userData.medication.dose}</p>
                    </div>
                </div>
            </div>
        </div>

        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">O que você vai aplicar?</h2>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {MEDICATIONS.map(med => (
                    <button 
                        key={med.name} 
                        onClick={() => handleMedicationSelect(med.name)} 
                        className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold transition-all ${selectedMed === med.name ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                    >
                        {med.name}
                    </button>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {availableDoses.map(dose => (
                    <button 
                        key={dose} 
                        onClick={() => setSelectedDose(dose)} 
                        className={`py-2 rounded-lg text-sm font-semibold transition-all border ${selectedDose === dose ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-400'}`}
                    >
                        {dose}
                    </button>
                    ))}
                </div>
            </div>
        </section>

        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Onde foi a aplicação?</h2>
            </div>
            
            {/* Seletor de Local Melhorado e Compacto */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
                <InjectionSiteSelector selectedSite={selectedSite} onSelect={setSelectedSite} />
            </div>
            <p className="text-xs text-center text-gray-400 px-4">Fazer rodízio dos locais ajuda na absorção e evita marcas na pele.</p>
        </section>
        
        <button 
            onClick={handleLogApplication}
            disabled={loading || isSuccess}
            className={`w-full py-4 rounded-[20px] font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] ${isSuccess ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-black dark:bg-white text-white dark:text-black shadow-black/20 dark:shadow-white/10'}`}
            >
            {loading ? (
               <span>Salvando...</span>
            ) : isSuccess ? (
                <>
                <CheckCircleIcon className="w-6 h-6" />
                <span>Registrado com Sucesso!</span>
                </>
            ) : (
                <>
                <SyringeIcon className="w-6 h-6" />
                <span>Confirmar Aplicação</span>
                </>
            )}
        </button>
      </div>

      {applicationHistory.length > 0 && (
        <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Histórico Recente</h2>
            <div className="space-y-3">
            {applicationHistory.slice(0, 3).map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <SyringeIcon className="w-5 h-5"/>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{entry.medication}</p>
                            <p className="text-xs text-gray-500">{formatDate(entry.date)} • {entry.dose}</p>
                        </div>
                    </div>
                    <button onClick={() => setEditingEntry(entry)} className="text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <EditIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
            </div>
        </section>
      )}

      {editingEntry && (
        <EditApplicationModal
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSave={handleUpdateApplication}
            onDelete={handleDeleteApplication}
        />
      )}
    </div>
  );
};
