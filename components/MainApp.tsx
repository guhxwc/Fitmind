
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './AppContext';
import { SummaryTab } from './tabs/SummaryTab';
import { MealsTab } from './tabs/MealsTab';
import { WorkoutsTab } from './tabs/WorkoutsTab';
import { ProgressTab } from './tabs/ProgressTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AccountSettings } from './tabs/AccountSettings';
import { TreatmentSettings } from './tabs/TreatmentSettings'; 
import { LifestyleGoals } from './tabs/LifestyleGoals'; 
import { ApplicationTab } from './tabs/ApplicationTab';
import { BottomNav } from './core/BottomNav';
import { WEEKDAYS } from '../constants';
import { HelpTab } from './tabs/HelpTab';
import { PrivacySettings } from './tabs/PrivacySettings';
import { FloatingActionMenu } from './core/FloatingActionMenu';
import { ManualMealModal } from './tabs/ManualMealModal';
import { RegisterWeightModal } from './RegisterWeightModal';
import { SideEffectModal } from './tabs/SideEffectModal';
import { supabase } from '../supabaseClient';
import type { Meal } from '../types';
import { useToast } from './ToastProvider';
import { NotificationManager } from './NotificationManager'; // Imported

const AppContent: React.FC = () => {
  const { userData, session, loading, setMeals, updateStreak, setWeightHistory, setSideEffects, setProgressPhotos, sideEffects } = useAppContext();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Global Modals State
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSideEffectModalOpen, setIsSideEffectModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFabAction = (action: 'application' | 'photo' | 'weight' | 'activity' | 'side_effect' | 'meal') => {
      switch (action) {
          case 'meal':
              setIsMealModalOpen(true);
              break;
          case 'weight':
              setIsWeightModalOpen(true);
              break;
          case 'side_effect':
              setIsSideEffectModalOpen(true);
              break;
          case 'photo':
              fileInputRef.current?.click();
              break;
          case 'activity':
              navigate('/workouts');
              break;
          case 'application':
              navigate('/applications');
              break;
      }
  };

  const handleAddMeal = (newMealData: Omit<Meal, 'id' | 'time'>) => {
    const newMeal: Meal = {
        ...newMealData,
        id: new Date().toISOString(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMeals(prevMeals => [...prevMeals, newMeal]);
    updateStreak();
    setIsMealModalOpen(false);
    addToast("Refeição registrada!", "success");
  };

  const handleAddWeight = async (newWeight: number) => {
      if(!userData) return;
      const { data } = await supabase.from('weight_history').insert({ user_id: userData.id, date: new Date().toISOString(), weight: newWeight }).select();
      if(data) {
          setWeightHistory(prev => [...prev, data[0]].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          // Update profile weight as well
          await supabase.from('profiles').update({ weight: newWeight }).eq('id', userData.id);
          setIsWeightModalOpen(false);
          updateStreak();
          addToast("Peso atualizado!", "success");
      }
  };

  const handleSaveSideEffects = async (entry: { effects: any[]; notes?: string; }) => {
    if (!userData) return;
    const dateToUse = new Date().toISOString().split('T')[0];
    const existingEntry = sideEffects.find(se => se.date === dateToUse);
    const payload = { id: existingEntry?.id, user_id: userData.id, date: dateToUse, effects: entry.effects, notes: entry.notes };
    
    const { data, error } = await supabase.from('side_effects').upsert(payload).select().single();
    if (data) {
        setSideEffects(prev => {
            const idx = prev.findIndex(item => item.id === data.id);
            if (idx >= 0) { const newArr = [...prev]; newArr[idx] = data; return newArr; }
            return [data, ...prev];
        });
        setIsSideEffectModalOpen(false);
        addToast("Sintomas registrados.", "success");
    }
    if (error) console.error("Error saving side effects:", error);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0] || !userData) return;
      const file = e.target.files[0];
      const path = `${userData.id}/${Date.now()}_${file.name}`;
      
      addToast("Enviando foto...", "info");
      
      const { error: uploadError } = await supabase.storage.from('progress_photos').upload(path, file);
      if (uploadError) {
          addToast("Erro ao enviar foto.", "error");
          return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('progress_photos').getPublicUrl(path);
      const { data, error } = await supabase.from('progress_photos').insert({ user_id: userData.id, date: new Date().toISOString(), photo_url: publicUrl }).select();
      
      if(data) {
          setProgressPhotos(prev => [data[0], ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          addToast("Foto adicionada!", "success");
          navigate('/progress'); // Redirect to progress to see the photo
      } else if (error) {
          console.error(error);
          addToast("Erro ao salvar registro.", "error");
      }
  };

  if (loading || !userData || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-ios-bg dark:bg-ios-dark-bg">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-ios-bg dark:bg-ios-dark-bg max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <NotificationManager /> {/* Added Manager */}
      <main className="flex-grow overflow-y-auto hide-scrollbar pb-28 pt-safe-top">
        <Routes>
          <Route path="/" element={<SummaryTab />} />
          <Route path="/applications" element={<ApplicationTab />} />
          <Route path="/meals" element={<MealsTab />} />
          <Route path="/workouts" element={<WorkoutsTab />} />
          <Route path="/progress" element={<ProgressTab />} />
          <Route path="/settings" element={<SettingsTab />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/treatment" element={<TreatmentSettings />} /> 
          <Route path="/settings/lifestyle" element={<LifestyleGoals />} /> 
          <Route path="/settings/help" element={<HelpTab />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <FloatingActionMenu onAction={handleFabAction} />
      <BottomNav />

      {/* Global Modals */}
      {isMealModalOpen && (
          <ManualMealModal 
            onClose={() => setIsMealModalOpen(false)} 
            onAddMeal={handleAddMeal} 
          />
      )}
      {isWeightModalOpen && (
          <RegisterWeightModal 
            onClose={() => setIsWeightModalOpen(false)} 
            onSave={handleAddWeight} 
          />
      )}
      {isSideEffectModalOpen && (
          <SideEffectModal 
            date={new Date()} 
            initialEntry={sideEffects.find(se => se.date === new Date().toISOString().split('T')[0])}
            onClose={() => setIsSideEffectModalOpen(false)} 
            onSave={handleSaveSideEffects} 
          />
      )}
      
      {/* Hidden Input for Photo Upload */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
        className="hidden" 
      />
    </div>
  );
};


export const MainApp: React.FC = () => (
  <AppContextProvider>
    <AppContent />
  </AppContextProvider>
);
