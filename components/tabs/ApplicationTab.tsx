import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import type { Weekday, ApplicationEntry, MedicationName } from '../../types';
import { SyringeIcon, CheckCircleIcon, EditIcon, TrashIcon } from '../core/Icons';
import { WEEKDAYS, MEDICATIONS } from '../../constants';
import { useAppContext } from '../AppContext';

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
    if (dayDifference <= 0) {
        dayDifference += 7;
    }
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + dayDifference);
    return nextDate;
}

const SelectionButton: React.FC<{
  onClick: () => void;
  isSelected: boolean;
  children: React.ReactNode;
}> = ({ onClick, isSelected, children }) => (
  <button
    onClick={onClick}
    className={`w-full text-center py-3 px-2 rounded-xl border-2 transition-all duration-200 font-semibold active:scale-[0.98] ${
      isSelected ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-gray-100/60 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-100/60 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
    }`}
  >
    {children}
  </button>
);

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

    const handleMedicationSelect = (medName: MedicationName) => {
        setMed(medName);
        const newMedDoses = MEDICATIONS.find(m => m.name === medName)?.doses || [];
        // If the old dose doesn't exist for the new med, select the first one
        if (!newMedDoses.includes(dose)) {
            setDose(newMedDoses[0] || '');
        }
    };
    
    const handleSaveClick = async () => {
        setIsSaving(true);
        await onSave({ ...entry, medication: med, dose: dose });
        setIsSaving(false);
    };

    const handleDeleteClick = async () => {
        if(window.confirm("Tem certeza que deseja remover este registro? Esta ação não pode ser desfeita.")) {
            setIsDeleting(true);
            await onDelete(entry.id);
            setIsDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Editar Registro</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Modifique ou exclua esta aplicação.</p>
                
                <div className="space-y-4">
                    <section>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300">Medicamento</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {MEDICATIONS.map(medItem => (
                                <SelectionButton key={medItem.name} onClick={() => handleMedicationSelect(medItem.name)} isSelected={med === medItem.name}>
                                    {medItem.name}
                                </SelectionButton>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300">Dose</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             {availableDoses.map(doseItem => (
                                <SelectionButton key={doseItem} onClick={() => setDose(doseItem)} isSelected={dose === doseItem}>
                                    {doseItem}
                                </SelectionButton>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="mt-6 space-y-3">
                    <button onClick={handleSaveClick} disabled={isSaving || isDeleting} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold disabled:bg-gray-400 dark:disabled:bg-gray-600">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button onClick={handleDeleteClick} disabled={isSaving || isDeleting} className="w-full bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                       <TrashIcon className="w-5 h-5"/> {isDeleting ? 'Excluindo...' : 'Excluir Registro'}
                    </button>
                    <button onClick={onClose} className="w-full text-gray-600 dark:text-gray-300 py-2 rounded-xl font-semibold">
                       Cancelar
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

  const handleMedicationSelect = (medName: MedicationName) => {
    setSelectedMed(medName);
    const newMedDoses = MEDICATIONS.find(m => m.name === medName)?.doses || [];
    setSelectedDose(newMedDoses[0] || ''); // Select the first dose of the new med
  };

  const handleLogApplication = async () => {
    setLoading(true);
    const newEntry: Omit<ApplicationEntry, 'id' | 'user_id'> = {
      date: new Date().toISOString(),
      medication: selectedMed,
      dose: selectedDose,
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

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-white dark:bg-black min-h-screen animate-fade-in">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Aplicação</h1>
        <p className="text-gray-500 dark:text-gray-400">Registre sua dose semanal</p>
      </header>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">1. Selecione o medicamento</h2>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {MEDICATIONS.map(med => (
              <SelectionButton key={med.name} onClick={() => handleMedicationSelect(med.name)} isSelected={selectedMed === med.name}>
                {med.name}
              </SelectionButton>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">2. Selecione a dose</h2>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {availableDoses.map(dose => (
              <SelectionButton key={dose} onClick={() => setSelectedDose(dose)} isSelected={selectedDose === dose}>
                {dose}
              </SelectionButton>
            ))}
          </div>
        </section>
        
        <button 
            onClick={handleLogApplication}
            disabled={loading || isSuccess}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:cursor-not-allowed active:scale-[0.98] ${isSuccess ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}
            >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : isSuccess ? (
                <>
                <CheckCircleIcon />
                <span>Registrado!</span>
                </>
            ) : (
                <>
                <SyringeIcon />
                <span>Apliquei Agora</span>
                </>
            )}
        </button>

         <div className="bg-gray-100/60 dark:bg-gray-800/50 p-5 rounded-2xl">
            <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300">Próxima Aplicação</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{userData.medication.nextApplication}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {nextApplicationDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </p>
        </div>
      </div>


      <section>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">Histórico de Aplicações</h2>
        <div className="space-y-3">
          {applicationHistory.length > 0 ? (
            applicationHistory.map((entry) => (
              <div key={entry.id} className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(entry.date)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{entry.medication} - {entry.dose}</p>
                </div>
                <button onClick={() => setEditingEntry(entry)} className="p-2 rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-transform active:scale-95">
                    <EditIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-100/60 dark:bg-gray-800/50 rounded-xl">
              <p className="font-medium text-gray-600 dark:text-gray-300">Nenhuma aplicação registrada.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Seu histórico aparecerá aqui.</p>
            </div>
          )}
        </div>
      </section>

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