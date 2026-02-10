
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import type { Weekday, ApplicationEntry, MedicationName, SideEffect, SideEffectEntry } from '../../types';
import { SyringeIcon, CheckCircleIcon, EditIcon, TrashIcon, PersonStandingIcon, LockIcon, WavesIcon, ChevronRightIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import { WEEKDAYS, MEDICATIONS } from '../../constants';
import { useAppContext } from '../AppContext';
import { ProFeatureModal } from '../ProFeatureModal';
import { SubscriptionPage } from '../SubscriptionPage';
import { SideEffectModal } from './SideEffectModal';
import { MedicationLevelChart } from './MedicationLevelChart';

// --- Sub-componente: Seletor de Local por Texto (Simples) ---
const INJECTION_SITES = [
    'Abdômen Esq.', 'Abdômen Dir.',
    'Coxa Esq.', 'Coxa Dir.',
    'Braço Esq.', 'Braço Dir.'
];

const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'short',
});

const getNextApplicationDate = (weekday: Weekday): Date => {
    const today = new Date();
    const todayDayIndex = today.getDay();
    const targetDayIndex = WEEKDAYS.indexOf(weekday);
    let dayDifference = targetDayIndex - todayDayIndex;
    if (dayDifference < 0) dayDifference += 7;
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

    const availableDoses = MEDICATIONS.find(m => m.name === med)?.doses || [];

    const handleSaveClick = async () => {
        setIsSaving(true);
        await onSave({ ...entry, medication: med, dose: dose });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Editar Registro</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Dose Administrada</label>
                        <select 
                            value={dose} 
                            onChange={(e) => setDose(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            {availableDoses.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <button onClick={handleSaveClick} disabled={isSaving} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button onClick={() => { if(window.confirm('Excluir?')) onDelete(entry.id); }} className="w-full text-red-500 font-semibold py-2 text-sm">
                        Excluir Registro
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ApplicationTab: React.FC = () => {
  const { userData, applicationHistory, setApplicationHistory, updateStreak, unlockPro, sideEffects, setSideEffects } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ApplicationEntry | null>(null);
  const [isSideEffectModalOpen, setIsSideEffectModalOpen] = useState(false);
  const [selectedSideEffectEntry, setSelectedSideEffectEntry] = useState<SideEffectEntry | null>(null);
  
  // Pro Features Logic
  const [showProModal, setShowProModal] = useState(false);
  const [showSubPage, setShowSubPage] = useState(false);
  
  // Local state for the "Control Panel"
  const [selectedMed, setSelectedMed] = useState<MedicationName>(userData?.medication.name || 'Mounjaro');
  const [selectedDose, setSelectedDose] = useState<string>(userData?.medication.dose || '');
  const [selectedSite, setSelectedSite] = useState<string>('');

  if (!userData) return null;

  const handleLogClick = () => {
      if (!selectedSite) {
          alert("Por favor, selecione onde você aplicou.");
          return;
      }
      if (userData.isPro) {
          handleLogApplication();
      } else {
          setShowProModal(true);
      }
  };

  const handleUnlock = () => { setShowProModal(false); setShowSubPage(true); };
  const handleSubscribe = () => { unlockPro(); setShowSubPage(false); handleLogApplication(); };

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
      setTimeout(() => { setIsSuccess(false); setSelectedSite(''); }, 2000);
    } else if (error) {
      console.error("Error logging application:", error);
    }
    setLoading(false);
  };

  const handleUpdateApplication = async (updatedEntry: ApplicationEntry) => {
    const { data, error } = await supabase.from('applications').update({ medication: updatedEntry.medication, dose: updatedEntry.dose }).eq('id', updatedEntry.id).select();
    if (data) {
        setApplicationHistory(prev => prev.map(item => (item.id === updatedEntry.id ? data[0] : item)));
        setEditingEntry(null);
    }
    if (error) console.error("Error updating application:", error);
  };

  const handleDeleteApplication = async (id: number) => {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (!error) {
          setApplicationHistory(prev => prev.filter(item => item.id !== id));
          setEditingEntry(null);
      }
  };

  const handleSaveSideEffects = async (entry: { effects: SideEffect[]; notes?: string; }) => {
    if (!userData) return;
    const dateToUse = selectedSideEffectEntry ? selectedSideEffectEntry.date : new Date().toISOString().split('T')[0];
    const existingEntry = sideEffects.find(se => se.date === dateToUse);
    const payload = { id: existingEntry?.id, user_id: userData.id, date: dateToUse, effects: entry.effects, notes: entry.notes };
    const { data, error } = await supabase.from('side_effects').upsert(payload).select().single();
    if (data) {
        setSideEffects(prev => {
            const idx = prev.findIndex(item => item.id === data.id);
            if (idx >= 0) { const newArr = [...prev]; newArr[idx] = data; return newArr; }
            return [data, ...prev];
        });
    }
    if (error) console.error("Error saving side effects:", error);
  };
  
  const nextApplicationDate = getNextApplicationDate(userData.medication.nextApplication);
  const availableDoses = MEDICATIONS.find(m => m.name === selectedMed)?.doses || [];

  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(nextApplicationDate); target.setHours(0,0,0,0);
  const diffTime = target.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const openSideEffectModal = (entry?: SideEffectEntry) => {
      setSelectedSideEffectEntry(entry || null);
      setIsSideEffectModalOpen(true);
  }

  return (
    <div className="p-5 space-y-6 animate-fade-in pb-32">
      
      {/* 1. Header Minimalista */}
      <header className="flex justify-between items-center py-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Protocolo</h1>
        <StreakBadge />
      </header>

      {/* 2. Health Status Bar (Floating Pill) */}
      <button 
        onClick={() => openSideEffectModal()}
        className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-800 rounded-full p-2 pr-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <WavesIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Como você se sente hoje?</span>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
      </button>

      {/* 3. Hero Dashboard (Chart + Next Dose) */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-soft border border-gray-100 dark:border-white/5 relative overflow-hidden group">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500"></div>
          
          {/* Integrated Chart */}
          <MedicationLevelChart history={applicationHistory} medicationName={userData.medication.name} className="mb-4" />
          
          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Próxima Dose</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                      {nextApplicationDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                  </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${daysRemaining === 0 ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400' : 'bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}>
                  {daysRemaining === 0 ? 'É Hoje!' : daysRemaining === 1 ? 'Amanhã' : `Faltam ${daysRemaining} dias`}
              </div>
          </div>
      </div>

      {/* 4. Action Control Panel (Log Dose) - UNIFIED CARD VERTICAL STACK */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-soft border border-gray-100 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Registrar Aplicação</h2>
          </div>

          {/* Section 1: Medication Switcher */}
          <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Medicamento</p>
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
                  {MEDICATIONS.map(m => (
                      <button 
                        key={m.name} 
                        onClick={() => setSelectedMed(m.name)} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedMed === m.name ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border border-transparent'}`}
                      >
                          {m.name}
                      </button>
                  ))}
              </div>
          </div>

          {/* Section 2: Dose Selector */}
          <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Dose</p>
              <div className="grid grid-cols-3 gap-2">
                  {availableDoses.map(d => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedDose(d)} 
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${selectedDose === d ? 'border-black dark:border-white text-black dark:text-white bg-transparent shadow-sm' : 'border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-400'}`}
                      >
                          {d}
                      </button>
                  ))}
              </div>
          </div>

          {/* Section 3: Injection Site (Text Based) */}
          <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Local</p>
              <div className="grid grid-cols-2 gap-2">
                  {INJECTION_SITES.map(site => (
                      <button 
                        key={site} 
                        onClick={() => setSelectedSite(site)} 
                        className={`py-3 px-3 rounded-xl text-xs font-bold text-left transition-all flex justify-between items-center ${
                            selectedSite === site 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                          <span>{site}</span>
                          {selectedSite === site && <CheckCircleIcon className="w-3.5 h-3.5" />}
                      </button>
                  ))}
              </div>
          </div>

          <button 
            onClick={handleLogClick}
            disabled={loading || isSuccess}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] relative overflow-hidden group mt-4 ${isSuccess ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-black dark:bg-white text-white dark:text-black shadow-black/20 dark:shadow-white/10'}`}
            >
            {!userData.isPro && !isSuccess && (
                <div className="absolute top-3 right-3 bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                    PRO
                </div>
            )}
            
            {loading ? (
               <span className="opacity-80">Registrando...</span>
            ) : isSuccess ? (
                <>
                <CheckCircleIcon className="w-6 h-6" />
                <span>Sucesso!</span>
                </>
            ) : (
                <>
                {userData.isPro ? <SyringeIcon className="w-5 h-5" /> : <LockIcon className="w-5 h-5"/>}
                <span>Confirmar Aplicação</span>
                </>
            )}
        </button>
      </div>

      {/* 5. History List - Compact & Minimalist */}
      {applicationHistory.length > 0 && (
        <section className="pt-2">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Histórico Recente</h2>
            </div>
            
            <div className="space-y-2">
            {applicationHistory.slice(0, 5).map((entry) => {
                const dateObj = new Date(entry.date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
                
                return (
                    <div key={entry.id} className="bg-white dark:bg-[#1C1C1E] p-2.5 rounded-[18px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            {/* Date Badge - Smaller */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl w-11 h-11 flex flex-col items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-700/50">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{month}</span>
                                <span className="text-lg font-extrabold text-gray-900 dark:text-white leading-none mt-0.5">{day}</span>
                            </div>
                            
                            {/* Info */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{entry.medication}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                                        {entry.dose}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions - Smaller Icon */}
                        <button 
                            onClick={() => setEditingEntry(entry)} 
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
            </div>
        </section>
      )}

      {/* Modals */}
      {editingEntry && (
        <EditApplicationModal
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSave={handleUpdateApplication}
            onDelete={handleDeleteApplication}
        />
      )}
      
      {isSideEffectModalOpen && (
        <SideEffectModal
            date={selectedSideEffectEntry ? new Date(selectedSideEffectEntry.date + 'T12:00:00') : new Date()}
            initialEntry={selectedSideEffectEntry || sideEffects.find(se => se.date.startsWith(new Date().toISOString().split('T')[0]))}
            onClose={() => setIsSideEffectModalOpen(false)}
            onSave={handleSaveSideEffects}
        />
      )}

      {showProModal && (
          <ProFeatureModal 
              title="Registro de Doses"
              onClose={() => setShowProModal(false)}
              onUnlock={handleUnlock}
          />
      )}
      {showSubPage && (
          <SubscriptionPage 
              onClose={() => setShowSubPage(false)}
              onSubscribe={handleSubscribe}
          />
      )}
    </div>
  );
};
