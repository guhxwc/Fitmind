import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { 
  ChevronLeft, Utensils, Target, CalendarClock, 
  Flame, Droplet, Beef, Play, Sparkles, Activity, Lightbulb, MessageCircle, ChevronRight, FileText, Smartphone, HeartHandshake,
  Clock, Lock, Check, TrendingDown
} from 'lucide-react';

import { WeightChart } from './WeightChart';

import { QuickCheckInCard } from './QuickCheckInCard';
import { ConsultationWaitingScreen } from './ConsultationWaitingScreen';
import { PostAnamnesisModal } from './PostAnamnesisModal';
import {
  materialsService, MATERIAL_TYPE_META, PatientMaterial, formatBytes,
} from '../../services/materialsExamsService';

const DR_ALLAN_PHOTO = "https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png";

interface ConsultationDashboardProps {
    status?: string | null;
    onReload?: () => void;
}

export const ConsultationDashboard: React.FC<ConsultationDashboardProps> = ({ status, onReload }) => {
  const navigate = useNavigate();
  const { session, userData, targetMacros } = useAppContext();
  const [isWaitingForPlan, setIsWaitingForPlan] = useState(status === 'anamnese_done');
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const [consultationData, setConsultationData] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);
  const [materials, setMaterials] = useState<PatientMaterial[]>([]);

  // Carrega materiais do paciente + realtime
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const loadMaterials = async () => {
      try {
        const list = await materialsService.listForPatient(userId);
        setMaterials(list);
      } catch (err) {
        console.error('[ConsultationDashboard] erro ao carregar materiais:', err);
      }
    };
    loadMaterials();

    const channel = supabase
      .channel(`materials_patient_${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'patient_materials', filter: `user_id=eq.${userId}` },
        () => loadMaterials())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const handleOpenMaterial = async (m: PatientMaterial) => {
    try {
      const url = await materialsService.getOpenUrl(m);
      window.open(url, '_blank', 'noopener,noreferrer');
      // Marca como lido se ainda não estiver
      if (!m.read_at) {
        await materialsService.markAsRead(m.id);
        setMaterials((prev) => prev.map((x) => x.id === m.id ? { ...x, read_at: new Date().toISOString() } : x));
      }
    } catch (err: any) {
      console.error('Erro ao abrir material:', err);
      alert('Não foi possível abrir o material. Tente novamente.');
    }
  }; // No materials available yet

  // Verifica se há um plano enviado pelo nutri pra liberar a consultoria
  useEffect(() => {
    if (!session?.user?.id) {
      setIsWaitingForPlan(status === 'anamnese_done');
      return;
    }
    let cancelled = false;

    const checkPlan = async () => {
      const { data } = await supabase
        .from('patient_plans')
        .select('id, status, sent_at, goal_calories, protein_g, carbs_g, fats_g, water_l, appointment_at')
        .eq('user_id', session.user.id)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        // Plano enviado → libera a consultoria
        setActivePlan(data);
        setIsWaitingForPlan(false);
      } else {
        // Sem plano → respeita status original (anamnese_done = aguardando)
        setActivePlan(null);
        setIsWaitingForPlan(status === 'anamnese_done');
      }
    };

    checkPlan();

    // Realtime: quando o nutri enviar um plano, libera automaticamente
    const channel = supabase
      .channel(`consultation-plan-${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patient_plans', filter: `user_id=eq.${session.user.id}` },
        () => checkPlan()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [status, session?.user?.id]);

  useEffect(() => {
     if (!session?.user?.id) return;
     const fetchData = async () => {
         const { data: msgs } = await supabase.from('nutritionist_messages').select('*').eq('user_id', session.user.id).eq('is_read', false).order('created_at', { ascending: false });
         if (msgs) setUnreadMessages(msgs);

         try {
             // 1) First ensure the modal table row exists or get its state
             const { data: scheduleModal } = await supabase.from('consultation_schedule_modal').select('*').eq('user_id', session.user.id).single();
             if (scheduleModal) {
                 if (scheduleModal.user_confirmed_scheduled === false) {
                     setShowAnamnesisModal(true);
                 }
             } else {
                 setShowAnamnesisModal(true);
             }

             // 2) Get consultation next_review_at
             const { data: cData } = await supabase.from('consultations').select('next_review_at').eq('user_id', session.user.id).single();
             if (cData) {
                 setConsultationData(cData);
             }
         } catch (e) {
             console.error('Failed to load consultation data', e);
         }
     };
     fetchData();
  }, [session?.user?.id]);

  const handleConfirmScheduled = async () => {
      try {
          // Upsert the schedule modal state
          await supabase.from('consultation_schedule_modal').upsert({ 
              user_id: session?.user?.id, 
              user_confirmed_scheduled: true,
              user_confirmed_scheduled_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch (e) {
          console.error('Failed to update user_confirmed_scheduled', e);
      }
      setShowAnamnesisModal(false);
  };

  const handleWhatsAppClick = async () => {
      try {
          await supabase.from('consultation_schedule_modal').upsert({ 
              user_id: session?.user?.id, 
              whatsapp_clicked: true,
              whatsapp_clicked_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch (e) {
          console.error('Failed to update whatsapp_clicked', e);
      }
  };

  const handleReadMessages = async () => {
      if (unreadMessages.length > 0 && session?.user?.id) {
          await supabase.from('nutritionist_messages').update({ is_read: true }).eq('user_id', session.user.id);
          setUnreadMessages([]);
      }
  };

  if (isWaitingForPlan) {
    return (
      <>
        <PostAnamnesisModal isOpen={showAnamnesisModal} onConfirmScheduled={handleConfirmScheduled} onWhatsAppClick={handleWhatsAppClick} />
        <ConsultationWaitingScreen onBack={() => navigate('/')} onChatClick={handleReadMessages} />
      </>
    );
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.scrollTop = 0;
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 200 } }
  };

  return (
    <div className="flex-1 w-full bg-transparent font-sans flex justify-center">
      <PostAnamnesisModal isOpen={showAnamnesisModal} onConfirmScheduled={handleConfirmScheduled} onWhatsAppClick={handleWhatsAppClick} />
      <div className="flex-1 w-full max-w-[480px] bg-transparent relative flex flex-col sm:shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:sm:shadow-[0_0_40px_rgba(0,0,0,0.2)] sm:border-x sm:border-gray-200 dark:sm:border-gray-900 pb-6">
        
        {/* Glass Header */}
        <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl z-50">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 flex flex-col items-center justify-center -ml-2 rounded-full active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7 text-[#007AFF]" strokeWidth={2.5} />
          </button>
          <span className="font-semibold text-[17px] tracking-tight text-gray-900 dark:text-white">Dashboard Premium</span>
          <div className="w-10" />
        </div>

        <motion.div 
          className="px-5 pt-4 pb-0 space-y-7"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Section 1: Welcome Header */}
          <motion.div variants={itemVariants} className="px-1">
            <h1 className="text-[32px] leading-[1.15] font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              {isWaitingForPlan ? 'Quase tudo pronto' : 'Bem-vindo à sua consultoria'}
            </h1>
            <p className="text-[17px] leading-[1.3] font-medium text-gray-500 dark:text-[#8E8E93]">
              {isWaitingForPlan ? 'Seu projeto está sendo desenvolvido sob medida.' : 'Seu acompanhamento premium com Dr. Allan Stachuk começou.'}
            </p>
          </motion.div>

          {/* Section 2: Main Premium Card */}
          <motion.div variants={itemVariants}>
            {isWaitingForPlan ? (
                <div 
                  className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-[#2C2C2E] dark:to-[#1C1C1E] rounded-[28px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)] relative overflow-hidden flex items-center justify-between group cursor-pointer"
                  onClick={() => {
                     // For testing: allow exiting waiting state by clicking the card
                     localStorage.removeItem('fitmind_consultation_waiting');
                     setIsWaitingForPlan(false);
                  }}
                >
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 blur-3xl rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
                  
                  <div className="z-10 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF9500] animate-pulse" />
                      <span className="text-white/70 text-[12px] font-extrabold uppercase tracking-widest">
                        Aguardando
                      </span>
                    </div>
                    <h2 className="text-white text-[22px] font-bold leading-tight mb-5 tracking-tight">
                      Seu plano está<br/>sendo montado
                    </h2>
                    <div className="bg-white/10 backdrop-blur-md text-white/60 font-bold text-[15px] px-5 py-3 rounded-[16px] flex items-center gap-2 w-fit">
                      <Clock className="w-[18px] h-[18px]"/>
                      <span>Em análise clínica</span>
                    </div>
                  </div>

                  <div className="z-10 shrink-0 relative translate-x-2 translate-y-1 opacity-60 grayscale filter">
                     <div className="relative w-[100px] h-[100px] rounded-[32px] sm:rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-[3px] border-white/20 overflow-hidden flex items-end">
                        <img 
                          src={DR_ALLAN_PHOTO} 
                          alt="Dr. Allan" 
                          className="absolute inset-0 w-full h-full object-cover object-top z-0 scale-[1.2] translate-y-[16px] translate-x-[6px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/90 via-[#1C1C1E]/20 to-transparent z-10" />
                     </div>
                  </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-[#1A5ED8] to-[#0A3D9E] rounded-[28px] p-6 shadow-[0_12px_40px_rgba(26,94,216,0.25)] relative overflow-hidden flex items-center justify-between group">
                  {/* Decorative Blur */}
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/10 blur-3xl rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
                  
                  <div className="z-10 flex-1 pr-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span className="text-white/90 text-[12px] font-extrabold uppercase tracking-widest">
                        Acesso Liberado
                      </span>
                    </div>
                    <h2 className="text-white text-[22px] font-bold leading-tight mb-5 tracking-tight">
                      Sua estratégia<br/>está pronta
                    </h2>
                    <button 
                      onClick={() => navigate('/dieta')}
                      className="bg-gradient-to-b from-[#34C759] to-[#2EAF4E] hover:from-[#32C056] hover:to-[#289B44] text-white font-bold text-[16px] px-5 py-3.5 rounded-[16px] shadow-[0_4px_16px_rgba(52,199,89,0.35)] flex items-center gap-2.5 active:scale-95 transition-all"
                    >
                      <Utensils className="w-5 h-5 fill-white/20"/>
                      <span>Sua dieta personalizada</span>
                    </button>
                  </div>

                  <div className="z-10 shrink-0 relative translate-x-2 translate-y-1">
                     <div className="relative w-[100px] h-[100px] rounded-[32px] sm:rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-[3px] border-white/20 overflow-hidden flex items-end">
                        <img 
                          src={DR_ALLAN_PHOTO} 
                          alt="Dr. Allan" 
                          className="absolute inset-0 w-full h-full object-cover object-top z-0 scale-[1.2] translate-y-[16px] translate-x-[6px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent z-10" />
                     </div>
                  </div>
                </div>
            )}
          </motion.div>

          {/* Section 2.2: Messages */}
          {!isWaitingForPlan && unreadMessages.length > 0 && (
              <motion.div variants={itemVariants}>
                  <div 
                      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      onClick={handleReadMessages}
                  >
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                              <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Mensagens Recebidas</h4>
                              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-0.5">Clique para marcar como lida e ver detalhes.</p>
                          </div>
                      </div>
                      <div className="space-y-2 mt-2">
                          {unreadMessages.map((m: any) => (
                             <div key={m.id} className="bg-white dark:bg-[#1C1C1E] p-3 rounded-xl shadow-sm text-sm text-gray-900 dark:text-white border border-blue-100 dark:border-blue-800/50">
                                 {m.message}
                             </div>
                          ))}
                      </div>
                  </div>
              </motion.div>
          )}

          {/* Section 2.5: WhatsApp Scheduling */}
          <motion.div variants={itemVariants}>
            <button 
              onClick={() => {
                localStorage.setItem('fitmind_consultation_waiting', 'true');
                setIsWaitingForPlan(true);
                window.location.href = 'https://wa.me/5543999142672?text=Ol%C3%A1%2C%20adquiri%20a%20consultoria%20premium%20pelo%20FitMind%20e%20gostaria%20de%20marcar%20meu%20hor%C3%A1rio%20para%20iniciar.';
              }}
              className="w-full bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 dark:border-[#25D366]/10 rounded-[24px] p-4 flex items-center justify-between active:scale-[0.98] transition-all group"
            >
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-b from-[#25D366] to-[#1DA851] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(37,211,102,0.3)]">
                     <MessageCircle className="w-[26px] h-[26px] text-white" fill="currentColor" />
                  </div>
                  <div className="text-left">
                     <h3 className="text-[#128C7E] dark:text-[#25D366] font-bold text-[16px] leading-tight mb-0.5 tracking-tight">Agendar Início</h3>
                     <p className="text-gray-600 dark:text-gray-400 text-[13px] font-medium leading-tight">Falar com Allan no WhatsApp</p>
                  </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                 <ChevronRight className="w-5 h-5 text-[#128C7E] dark:text-[#25D366]" />
               </div>
            </button>
          </motion.div>

          {/* Section 3: Performance Summary */}
          {isWaitingForPlan ? (
              <motion.div variants={itemVariants} className="opacity-50 pointer-events-none">
                 <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mb-3 flex items-center gap-2">
                   Resumo Atual <Lock className="w-4 h-4 text-gray-400" />
                 </h3>
                 <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-[#2C2C2E]">
                   <div className="animate-pulse flex flex-col space-y-5">
                      <div className="h-3 bg-gray-200 dark:bg-[#2C2C2E] rounded-full w-1/3"></div>
                      <div className="space-y-4">
                        <div className="h-3 bg-gray-200 dark:bg-[#2C2C2E] rounded-full w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#2C2C2E] rounded-full w-5/6"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#2C2C2E] rounded-full w-full"></div>
                      </div>
                   </div>
                 </div>
              </motion.div>
          ) : (
              <motion.div variants={itemVariants}>
            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mb-3">
              Resumo Atual
            </h3>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-[#2C2C2E]">
              <div className="flex">
                {/* Metas */}
                <div className="flex-1 pr-5 border-r border-gray-100 dark:border-[#2C2C2E]">
                  <h4 className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-widest mb-4">Metas Atuais</h4>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#FF9500]" />
                        <span className="text-[15px] font-medium text-gray-600 dark:text-gray-300">Calorias</span>
                      </div>
                      <span className="font-bold text-[15px] text-gray-900 dark:text-white">{targetMacros?.calories || userData?.goals?.calories || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-[#007AFF] fill-[#007AFF]/20" />
                        <span className="text-[15px] font-medium text-gray-600 dark:text-gray-300">Água</span>
                      </div>
                      <span className="font-bold text-[15px] text-gray-900 dark:text-white">{targetMacros?.water || userData?.goals?.water || 0}L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Beef className="w-4 h-4 text-[#FF2D55]" />
                        <span className="text-[15px] font-medium text-gray-600 dark:text-gray-300">Proteína</span>
                      </div>
                      <span className="font-bold text-[15px] text-gray-900 dark:text-white">{targetMacros?.protein || userData?.goals?.protein || 0}g</span>
                    </div>
                  </div>
                </div>

                {/* Pesos */}
                <div className="w-[124px] pl-5 flex flex-col justify-center space-y-4">
                  <div>
                    <h4 className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">Peso Inicial</h4>
                    <p className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">
                      {userData?.startWeight?.toFixed(1).replace('.', ',')} <span className="text-[13px] font-semibold text-gray-400">kg</span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#007AFF] uppercase tracking-widest mb-1">Peso Atual</h4>
                    <p className="text-[22px] font-bold text-[#007AFF] tracking-tight">
                      {userData?.weight?.toFixed(1).replace('.', ',')} <span className="text-[13px] font-semibold text-[#007AFF]/60">kg</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Info */}
              {consultationData?.next_review_at && (
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-[#2C2C2E] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CalendarClock className="w-4 h-4" />
                      <span className="text-[14px] font-medium">Próxima Revisão</span>
                    </div>
                    <span className="text-[14px] font-bold text-gray-900 dark:text-white">
                        {new Date(consultationData.next_review_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
              )}
            </div>
          </motion.div>
          )}

          {/* Section 4: Plans Grid */}
          {isWaitingForPlan ? (
              <motion.div variants={itemVariants} className="opacity-50 pointer-events-none">
                <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mb-3 flex items-center gap-2">
                  Planos <Lock className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-[#2C2C2E] flex flex-col justify-between aspect-square">
                     <div className="w-11 h-11 rounded-[14px] bg-gray-200 dark:bg-[#2C2C2E] animate-pulse mb-4"></div>
                     <div className="space-y-2">
                       <div className="w-1/2 h-3 bg-gray-200 dark:bg-[#2C2C2E] rounded-full animate-pulse"></div>
                       <div className="w-full h-4 bg-gray-200 dark:bg-[#2C2C2E] rounded-full animate-pulse"></div>
                     </div>
                  </div>
                  <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-[#2C2C2E] flex flex-col justify-between aspect-square">
                     <div className="w-11 h-11 rounded-[14px] bg-gray-200 dark:bg-[#2C2C2E] animate-pulse mb-4"></div>
                     <div className="space-y-2">
                       <div className="w-1/2 h-3 bg-gray-200 dark:bg-[#2C2C2E] rounded-full animate-pulse"></div>
                       <div className="w-full h-4 bg-gray-200 dark:bg-[#2C2C2E] rounded-full animate-pulse"></div>
                     </div>
                  </div>
                </div>
              </motion.div>
          ) : (
              <motion.div variants={itemVariants}>
                <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mb-3">
                  Planos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-[#2C2C2E] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer">
                    <div className="w-11 h-11 rounded-[14px] bg-[#007AFF]/10 flex items-center justify-center mb-4">
                      <Target className="w-[22px] h-[22px] text-[#007AFF] stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">Plano Atual</h4>
                      <p className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Fase 1:<br/>Adaptação</p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-[#2C2C2E] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer">
                    <div className="w-11 h-11 rounded-[14px] bg-[#34C759]/10 flex items-center justify-center mb-4">
                      <CalendarClock className="w-[22px] h-[22px] text-[#34C759] stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">Próximo Ajuste</h4>
                      {(() => {
                         if (!consultationData?.next_review_at) {
                           return <p className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Não definido</p>;
                         }
                         const todayDate = new Date();
                         todayDate.setHours(0, 0, 0, 0);
                         
                         const reviewDate = new Date(consultationData.next_review_at);
                         reviewDate.setHours(0, 0, 0, 0);

                         const diffTime = reviewDate.getTime() - todayDate.getTime();
                         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                         if (diffDays > 1) {
                           return <p className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Em {diffDays} dias</p>;
                         } else if (diffDays === 1) {
                           return <p className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Amanhã</p>;
                         } else if (diffDays === 0) {
                           return <p className="text-[15px] font-bold text-[#FF9500] leading-tight">Retorno hoje</p>;
                         } else if (diffDays === -1 || diffDays === -2) {
                           return <p className="text-[15px] font-bold text-[#FF3B30] leading-tight">Retorno pendente</p>;
                         } else {
                           return <p className="text-[15px] font-bold text-[#FF3B30] leading-tight">Atrasado há {Math.abs(diffDays)} dias</p>;
                         }
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
          )}

          {/* Section 4.5: Daily Diet, Weight, Materials */}
          {!isWaitingForPlan && (
            <motion.div variants={itemVariants} className="space-y-6">
              
              {/* Daily Diet Card */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-[22px] h-[22px] text-blue-500" />
                    <h3 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">Plano alimentar - Hoje</h3>
                  </div>
                  <button onClick={() => navigate('/dieta')} className="text-[13px] font-bold text-blue-600 bg-white border border-blue-100 hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-full active:scale-95 transition-all w-fit">
                    Abrir dieta completa
                  </button>
                </div>

                <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory -mx-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {/* Breakfast */}
                  <div className="min-w-[240px] flex-1 bg-[#F0FDF4] dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-[24px] p-5 snap-center shrink-0">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Café da manhã</h4>
                        <span className="text-[13px] text-gray-500 font-medium">07:00</span>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-green-400 text-green-500 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[24px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                        785 <span className="text-[13px] font-bold text-gray-500 tracking-normal">kcal</span>
                      </div>
                      <span className="text-[13px] font-medium text-gray-500">3/3 alimentos</span>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="min-w-[240px] flex-1 bg-[#FFF7ED] dark:bg-orange-900/10 border border-orange-200/60 dark:border-orange-900/30 rounded-[24px] p-5 snap-center shrink-0">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Almoço</h4>
                        <span className="text-[13px] text-gray-500 font-medium">12:30</span>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-orange-300 text-orange-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[24px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                        592 <span className="text-[13px] font-bold text-gray-500 tracking-normal">kcal</span>
                      </div>
                      <span className="text-[13px] font-medium text-gray-500">0/4 alimentos</span>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="min-w-[240px] flex-1 bg-[#F8FAFC] dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50 rounded-[24px] p-5 snap-center shrink-0">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Jantar</h4>
                        <span className="text-[13px] text-gray-500 font-medium">19:00</span>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[24px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                        960 <span className="text-[13px] font-bold text-gray-500 tracking-normal">kcal</span>
                      </div>
                      <span className="text-[13px] font-medium text-gray-500">0/4 alimentos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid for Weight */}
              <div className="grid grid-cols-1 gap-6">
                
                {/* Weight Evolution */}
                <WeightChart />
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mb-3 mt-6">
              Acompanhamento Diário
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <QuickCheckInCard />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6">
            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mb-3">
              Materiais Enviados
            </h3>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5 flex flex-col h-full">
              {materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-300 dark:text-blue-500/50" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2">Nenhum material ainda</h4>
                  <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">
                    Seu nutricionista pode enviar PDFs, guias e receitas por aqui. Quando recebê-los, aparecerão nesta seção.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {materials.slice(0, 4).map((m) => {
                    const meta = MATERIAL_TYPE_META[m.type];
                    const isNew = !m.read_at;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleOpenMaterial(m)}
                        className="w-full flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50 transition-all text-left active:scale-[0.99]"
                      >
                        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                          <FileText className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight truncate">{m.title}</h4>
                            {isNew && <span className="bg-blue-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">Novo</span>}
                          </div>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                            {meta.label} • {new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            {m.file_size && ` • ${formatBytes(m.file_size)}`}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </button>
                    );
                  })}
                  {materials.length > 4 && (
                    <button className="w-full text-[14px] font-bold text-blue-600 border border-blue-50 hover:border-blue-100 bg-white dark:bg-transparent dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 py-3.5 rounded-full transition-colors mt-2 active:scale-95">
                      Ver todos ({materials.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};
