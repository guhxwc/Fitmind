import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from './AppContext';
import { SummaryTab } from './tabs/SummaryTab';
import { MealsTab } from './tabs/MealsTab';
import { WorkoutsTab } from './tabs/WorkoutsTab';
import { ProgressTab } from './tabs/ProgressTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AccountSettings } from './tabs/AccountSettings';
import { TreatmentSettings } from './tabs/TreatmentSettings'; 
import { LifestyleGoals } from './tabs/LifestyleGoals'; 
import { WeightGoals } from './tabs/WeightGoals';
import { PersonalData } from './tabs/PersonalData';
import { ApplicationTab } from './tabs/ApplicationTab';
import { ConsultationTab } from './tabs/ConsultationTab';
import { BottomNav } from './core/BottomNav';
import { HelpTab } from './tabs/HelpTab';
import { PrivacySettings } from './tabs/PrivacySettings';
import { FloatingActionMenu } from './core/FloatingActionMenu';
import { SmartLogModal } from './SmartLogModal';
import { RegisterWeightModal } from './RegisterWeightModal';
import { SideEffectModal } from './tabs/SideEffectModal';
import { supabase } from '../supabaseClient';
import type { Meal } from '../types';
import { useToast } from './ToastProvider';
import { NotificationManager } from './NotificationManager';
import { CelebrationManager } from './CelebrationManager';
import { WeightMilestoneModal } from './WeightMilestoneModal';
import { DietView } from './consultation/DietView';
import { NutriPanel } from './nutri/NutriPanel';

export const MainApp: React.FC = () => {
  const { isNutritionist, userData, session, loading, setMeals, updateStreak, setWeightHistory, setSideEffects, setProgressPhotos, sideEffects, fetchData, isMealModalOpen, setIsMealModalOpen, isWeightModalOpen, setIsWeightModalOpen, isSideEffectModalOpen, setIsSideEffectModalOpen, isNutriPanelOpen, setIsNutriPanelOpen, initialMealType, setInitialMealType, initialMode, setInitialMode, setUserData, calculateGoals, setWeightMilestoneData } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  // Global Modals State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escutar parâmetros da Stripe na URL principal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
        const paymentType = params.get('type');
        
        // Limpar parâmetros da URL
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
        
        fetchData();

        if (paymentType === 'consultation') {
            addToast("Consultoria ativada! Preencha sua anamnese.", "success");
            // Navegar para aba de consultoria
            setTimeout(() => navigate('/consultation'), 500);
        } else {
            localStorage.setItem('trigger_pro_tour', 'true');
            localStorage.setItem('has_seen_onboarding', 'true');
            addToast("Sua assinatura PRO está ativa!", "success");
        }
    }
  }, [fetchData, addToast]);

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scrollToTop = () => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
        mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Target the #root element which is the scroll container in index.html
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.scrollTop = 0;
        rootElement.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    // Executa imediatamente e em vários frames para garantir
    scrollToTop();
    
    const timeoutId = setTimeout(scrollToTop, 0);
    const timeoutId2 = setTimeout(scrollToTop, 100);
    const rafId = requestAnimationFrame(scrollToTop);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

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
      if (isNaN(newWeight)) {
          addToast("Por favor, insira um peso válido.", "error");
          return;
      }

      const prevWeight = userData.weight;
      
      try {
          // 1. Update Profile first (usually has simpler RLS)
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ weight: newWeight })
            .eq('id', userData.id);
          
          if (profileError) throw profileError;

          // 2. Insert or Update Weight History (one entry per day)
          const todayStr = new Date().toISOString().split('T')[0];
          
          const { data: existingEntry } = await supabase
            .from('weight_history')
            .select('id')
            .eq('user_id', userData.id)
            .gte('date', `${todayStr}T00:00:00`)
            .lte('date', `${todayStr}T23:59:59`)
            .maybeSingle();

          let historyResult;
          if (existingEntry) {
              historyResult = await supabase
                .from('weight_history')
                .update({ weight: newWeight, date: new Date().toISOString() })
                .eq('id', existingEntry.id)
                .select();
          } else {
              historyResult = await supabase
                .from('weight_history')
                .insert({ 
                    user_id: userData.id, 
                    date: new Date().toISOString(), 
                    weight: newWeight 
                })
                .select();
          }

          const { data, error: historyError } = historyResult;

          // Even if select() fails or returns empty due to RLS, 
          // if there's no error, the insert likely succeeded.
          if (historyError) throw historyError;

          // Update local state immediately for UX
          setUserData(prev => {
              if (!prev) return null;
              
              let newGoals = prev.goals;
              let newLastWeightGoalUpdate = prev.lastWeightGoalUpdate || prev.weight;

              // Check if we should recalculate goals (every 5kg)
              if (Math.abs(newWeight - (prev.lastWeightGoalUpdate || prev.weight)) >= 5) {
                  newGoals = calculateGoals(newWeight, prev.activityLevel, prev.height, prev.age, prev.gender);
                  newLastWeightGoalUpdate = newWeight;
              }

              return { 
                  ...prev, 
                  weight: newWeight, 
                  goals: newGoals, 
                  lastWeightGoalUpdate: newLastWeightGoalUpdate 
              };
          });

          if (data && data.length > 0) {
              const updatedEntry = data[0];
              setWeightHistory(prev => {
                  const filtered = prev.filter(item => item.id !== updatedEntry.id);
                  return [updatedEntry, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              });
          } else {
              // Fallback if select() returned nothing but no error
              setWeightHistory(prev => {
                  const today = new Date().toISOString().split('T')[0];
                  const filtered = prev.filter(item => !item.date.startsWith(today));
                  return [{ id: Date.now(), user_id: userData.id, date: new Date().toISOString(), weight: newWeight }, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              });
          }

          setIsWeightModalOpen(false);
          updateStreak();
          addToast("Peso registrado com sucesso!", "success");
          
          if (userData.isPro && newWeight !== prevWeight) {
              setWeightMilestoneData({ oldWeight: prevWeight, newWeight });
          }
      } catch (error: any) {
          console.error("Error saving weight:", error);
          addToast("Erro ao salvar peso: " + (error.message || "Erro desconhecido"), "error");
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
          navigate('/progress'); 
      } else if (error) {
          console.error(error);
          addToast("Erro ao salvar registro.", "error");
      }
  };

  if (loading || !userData || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-ios-bg dark:bg-ios-dark-bg">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-ios-bg dark:bg-ios-dark-bg max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <NotificationManager />
      <CelebrationManager />
      <WeightMilestoneModal />
      <main 
        key={location.pathname}
        ref={mainRef} 
        className="flex-grow overflow-y-auto hide-scrollbar pb-24 pt-safe-top flex flex-col"
      >
        <Routes>
          <Route path="/" element={<SummaryTab />} />
          <Route path="/applications" element={<ApplicationTab />} />
          <Route path="/meals" element={<MealsTab />} />
          <Route path="/consultation" element={<ConsultationTab />} />
          <Route path="/dieta" element={<DietView />} />
          <Route path="/workouts" element={<WorkoutsTab />} />
          <Route path="/progress" element={<ProgressTab />} />
          <Route path="/settings" element={<SettingsTab />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/personal-data" element={<PersonalData />} />
          <Route path="/settings/treatment" element={<TreatmentSettings />} /> 
          <Route path="/settings/lifestyle" element={<LifestyleGoals />} /> 
          <Route path="/settings/weight-goals" element={<WeightGoals />} />
          <Route path="/settings/help" element={<HelpTab />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <FloatingActionMenu onAction={handleFabAction} />
      <BottomNav />

      {isMealModalOpen && (
          <SmartLogModal 
            initialMealType={initialMealType}
            initialMode={initialMode as any}
            onClose={() => {
                setIsMealModalOpen(false);
                setInitialMealType('');
                setInitialMode('');
            }} 
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
      
      {isNutriPanelOpen && <NutriPanel onClose={() => setIsNutriPanelOpen(false)} />}
      
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