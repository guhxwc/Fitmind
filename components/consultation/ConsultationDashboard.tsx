import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { 
  ChevronLeft, Utensils, Target, CalendarClock, 
  Flame, Droplet, Beef, Play, Sparkles, Activity, Lightbulb, MessageCircle, ChevronRight, FileText, Smartphone, HeartHandshake,
  Clock, Lock
} from 'lucide-react';

const DR_ALLAN_PHOTO = "https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png";

interface ConsultationDashboardProps {
    status?: string | null;
    onReload?: () => void;
}

export const ConsultationDashboard: React.FC<ConsultationDashboardProps> = ({ status, onReload }) => {
  const navigate = useNavigate();
  const { session, userData } = useAppContext();
  const [isWaitingForPlan, setIsWaitingForPlan] = useState(status === 'anamnese_done');
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const [consultationData, setConsultationData] = useState<any>(null);

  useEffect(() => {
    setIsWaitingForPlan(status === 'anamnese_done');
  }, [status]);

  useEffect(() => {
     if (!session?.user?.id) return;
     const fetchData = async () => {
         const { data: msgs } = await supabase.from('nutritionist_messages').select('*').eq('user_id', session.user.id).eq('is_read', false).order('created_at', { ascending: false });
         if (msgs) setUnreadMessages(msgs);

         const { data: cData } = await supabase.from('consultations').select('next_review_at').eq('user_id', session.user.id).single();
         if (cData) setConsultationData(cData);
     };
     fetchData();
  }, [session?.user?.id]);

  const handleReadMessages = async () => {
      if (unreadMessages.length > 0 && session?.user?.id) {
          await supabase.from('nutritionist_messages').update({ is_read: true }).eq('user_id', session.user.id);
          setUnreadMessages([]);
      }
  };

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

  // Image assets for Dr. Allan

  return (
    <div className="w-full min-h-[100dvh] bg-[#F2F2F7] dark:bg-black font-sans flex justify-center">
      <div className="w-full max-w-[480px] min-h-[100dvh] bg-[#F2F2F7] dark:bg-black relative flex flex-col shadow-2xl sm:border-x sm:border-gray-200 dark:sm:border-gray-900 overflow-hidden">
        
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
          className="px-5 pt-4 pb-40 space-y-7"
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
                window.open('https://wa.me/5543999142672?text=Ol%C3%A1%2C%20adquiri%20a%20consultoria%20premium%20pelo%20FitMind%20e%20gostaria%20de%20marcar%20meu%20hor%C3%A1rio%20para%20iniciar.', '_blank');
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
                      <span className="font-bold text-[15px] text-gray-900 dark:text-white">{userData?.goals?.calories || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-[#007AFF] fill-[#007AFF]/20" />
                        <span className="text-[15px] font-medium text-gray-600 dark:text-gray-300">Água</span>
                      </div>
                      <span className="font-bold text-[15px] text-gray-900 dark:text-white">{userData?.goals?.water || 0}L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Beef className="w-4 h-4 text-[#FF2D55]" />
                        <span className="text-[15px] font-medium text-gray-600 dark:text-gray-300">Proteína</span>
                      </div>
                      <span className="font-bold text-[15px] text-gray-900 dark:text-white">{userData?.goals?.protein || 0}g</span>
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
                      <p className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Em 14 dias</p>
                    </div>
                  </div>
                </div>
              </motion.div>
          )}

          {/* Section 5: Allan's Tips */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mb-3">
              Dica do Especialista
            </h3>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-[#2C2C2E] flex flex-col gap-4">
              {/* Header: Avatar + Title */}
              <div className="flex items-center gap-4 w-full">
                 <div className="w-[56px] h-[56px] rounded-full overflow-hidden shrink-0 border-[2px] border-gray-100/80 dark:border-[#2C2C2E] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] relative flex items-end">
                    <img 
                      src={DR_ALLAN_PHOTO} 
                      alt="Allan" 
                      className="w-full h-full object-cover object-top absolute inset-0 z-0 scale-[1.3] translate-y-[10px] translate-x-[4px]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent z-10" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex items-center gap-1.5 bg-[#FF2D55]/10 text-[#FF2D55] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
                        Novo Alerta
                      </span>
                      <span className="text-[12px] font-semibold text-[#8E8E93]">Hoje</span>
                    </div>
                    <h4 className="text-[18px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                      Cuidado com a restrição
                    </h4>
                 </div>
              </div>
              
              {/* Message */}
              <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Não caia no erro de cortar os carboidratos na sexta para compensar os furos durante a semana. Mantenha os 160g de proteína diários.
              </p>
              
              {/* Action / Play */}
              <div className="mt-2">
                 <button className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-[#2C2C2E] dark:hover:bg-[#3B3B3D] rounded-[20px] p-3 flex items-center justify-between transition-colors group active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-[14px] bg-white dark:bg-[#1C1C1E] shadow-sm flex items-center justify-center border border-gray-200 dark:border-gray-800">
                           <Play className="w-4 h-4 text-[#007AFF] fill-[#007AFF] translate-x-[1px]" />
                        </div>
                        <span className="text-[15px] font-bold text-gray-900 dark:text-white">Ouvir orientação</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#8E8E93] mr-3">01:45</span>
                 </button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};
