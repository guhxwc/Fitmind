import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Utensils, MessageCircle, Clock, Sparkles, Check, Target, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ConsultationUpsellProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsultationUpsell: React.FC<ConsultationUpsellProps> = ({ onAccept, onDecline }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Força a rolagem para o topo imediatamente na montagem
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleAccept = () => {
    setIsLoading(true);
    setIsExpanding(true);
    // Removemos a lentidão, só o tempo da animação brutal e fluida disparar (450ms)
    setTimeout(() => {
        onAccept();
    }, 450); 
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full min-h-screen flex justify-center bg-white dark:bg-[#1C1C1E] sm:bg-[#e5e5e5] sm:dark:bg-[#111111] font-sans"
    >
       {/* Mobile Container wrapper (scrolls naturally) */}
       <div className="w-full max-w-[480px] min-h-[100dvh] bg-white dark:bg-[#1C1C1E] relative flex flex-col shadow-2xl sm:border-x sm:border-gray-200 dark:sm:border-gray-800">
          
          {/* Blue Banner Header */}
          <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#2972F5] relative w-full overflow-hidden h-[44vh] min-h-[360px] shrink-0"
          >
              
              {/* Close Button Minimalist */}
              <button 
                 onClick={onDecline}
                 className="absolute top-5 right-5 z-[60] p-2 bg-black/10 backdrop-blur-md text-white/90 hover:text-white rounded-full hover:bg-black/20 transition-all"
              >
                  <X className="w-5 h-5" strokeWidth={2.5} />
              </button>

              {/* Heartbeat Background Pattern */}
              <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                <svg width="400" height="150" viewBox="0 0 400 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[150%] h-full object-cover">
                   <path d="M-50 75 H80 L95 40 L125 130 L145 20 L165 100 L180 75 H450" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Photo MASSIVELY enlarged by using absolute positioning out of flex bounds */}
              <div className="absolute bottom-[-32px] left-[55%] -translate-x-1/2 w-[190%] min-w-[660px] max-w-none h-auto z-10 pointer-events-none">
                  <motion.img 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                     src="https://allanstachuk.my.canva.site/c-pia-de-presencial/_assets/media/a363b4bf95e991cec48ec623905cfc44.png"
                     alt="Dr. Allan Stachuk"
                     className="w-full h-auto object-contain object-bottom drop-shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
                  />
              </div>
          </motion.div>

          {/* White Bottom Card */}
          <motion.div 
             initial={{ y: 40, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.15, type: "spring", damping: 22, stiffness: 250 }}
             className="bg-white dark:bg-[#1C1C1E] rounded-t-[32px] -mt-24 relative z-20 flex-grow px-6 pt-6 pb-10 flex flex-col shadow-[0_-16px_40px_rgba(0,0,0,0.08)]"
          >
             
             {/* Drag Handle purely visual */}
             <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5"></div>

             <motion.div 
                 initial="hidden"
                 animate="visible"
                 variants={{
                     visible: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } }
                 }}
             >
                 {/* Header Info */}
                 <motion.div variants={itemVariants} className="pb-4">
                     <h1 className="text-[28px] font-bold text-gray-900 dark:text-white flex items-center gap-1.5 tracking-tight mb-0.5">
                         Dr. Allan Stachuk
                         <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                     </h1>
                     <p className="text-[#8E8E93] text-[14px] font-bold tracking-wide uppercase mt-1">Especialista Clínico GLP-1 • CRN 13901</p>
                     
                     <div className="flex items-center gap-1.5 mt-3 text-gray-600 dark:text-gray-300 text-[13px] font-semibold bg-gray-100 dark:bg-gray-800 w-fit px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                         <Clock className="w-4 h-4 text-[#2972F5]" /> Responde em dias úteis
                     </div>
                 </motion.div>

                 <motion.div variants={itemVariants} className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 my-4"></motion.div>

                 {/* Stats Row */}
                 <motion.div variants={itemVariants} className="flex justify-between items-center px-0">
                    <div className="text-center flex-1">
                        <p className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-none mb-1">Especialista</p>
                        <p className="text-[12px] text-gray-500 font-medium">Foco GLP-1</p>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-100 dark:bg-gray-800 shrink-0 mx-1"></div>
                    <div className="text-center flex-1">
                        <p className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-none mb-1">Sob Medida</p>
                        <p className="text-[12px] text-gray-500 font-medium">Feito para você</p>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-100 dark:bg-gray-800 shrink-0 mx-1"></div>
                    <div className="text-center flex-1">
                        <p className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-none mb-1">Resultado</p>
                        <p className="text-[12px] text-gray-500 font-medium">Otimizado</p>
                    </div>
                 </motion.div>

                 <motion.div variants={itemVariants} className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 my-6"></motion.div>

                 {/* New Value Proposition Section */}
                 <motion.div variants={itemVariants} className="mb-8">
                 <h2 className="text-[22px] font-bold text-gray-900 dark:text-white leading-[1.25] tracking-tight mb-3">
                     Quer um especialista com você todos os dias?
                 </h2>
                 <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                     Adicione o acompanhamento premium com Allan Stachuk e tenha estratégia humana para acelerar seus resultados.
                 </p>

                 <h3 className="text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">O que você recebe:</h3>
                 
                 <ul className="space-y-3.5">
                     {[
                         "Avaliação física completa",
                         "Análise de exames e histórico de saúde",
                         "Plano alimentar 100% personalizado",
                         "Ajustado à sua rotina, sono e atividade fisica",
                         "Estratégia para emagrecimento e performance",
                         "Ajustes contínuos conforme evolução",
                         "Suporte direto especializado"
                     ].map((item, i) => (
                         <li key={i} className="flex items-start gap-3">
                             <div className="mt-[3px] bg-[#EEF4FF] dark:bg-blue-900/30 p-1 rounded-full text-[#2972F5] shrink-0">
                                 <Check className="w-3.5 h-3.5 stroke-[3]" />
                             </div>
                             <span className="text-[15px] text-gray-800 dark:text-gray-200 font-medium leading-snug">{item}</span>
                         </li>
                     ))}
                 </ul>
             </motion.div>

             <motion.div variants={itemVariants} className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 mb-8"></motion.div>

             {/* Benefits Section */}
             <motion.div variants={itemVariants} className="space-y-5">
                 <h3 className="text-[19px] font-bold text-gray-900 dark:text-white mb-2">Por que a consultoria é diferente?</h3>

                 <div className="flex items-start gap-4">
                     <div className="bg-[#EEF4FF] dark:bg-blue-900/30 p-3 rounded-[14px] shrink-0 mt-0.5">
                        <Stethoscope className="w-6 h-6 text-[#2972F5]" strokeWidth={2.5} />
                     </div>
                     <div className="pt-0.5">
                        <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-0.5">Olhar Especialista</h4>
                        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.4] pr-2">Decisões humanas com experiência clínica real.</p>
                     </div>
                 </div>

                 <div className="flex items-start gap-4">
                     <div className="bg-[#EEF4FF] dark:bg-blue-900/30 p-3 rounded-[14px] shrink-0 mt-0.5">
                        <Utensils className="w-6 h-6 text-[#2972F5]" strokeWidth={2.5} />
                     </div>
                     <div className="pt-0.5">
                        <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-0.5">Acelera o que já funciona</h4>
                        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.4] pr-2">Extrai o seu maximo com ajustes estratégicos alem do fitmind.</p>
                     </div>
                 </div>

                 <div className="flex items-start gap-4">
                     <div className="bg-[#EEF4FF] dark:bg-blue-900/30 p-3 rounded-[14px] shrink-0 mt-0.5">
                        <MessageCircle className="w-6 h-6 text-[#2972F5]" strokeWidth={2.5} />
                     </div>
                     <div className="pt-0.5">
                        <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-0.5">Suporte Direto no Dia a Dia</h4>
                        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.4] pr-2">Dúvidas reais da rotina respondidas por especialista quando precisar.</p>
                     </div>
                 </div>

                 <div className="flex items-start gap-4">
                     <div className="bg-[#EEF4FF] dark:bg-blue-900/30 p-3 rounded-[14px] shrink-0 mt-0.5">
                        <Target className="w-6 h-6 text-[#2972F5]" strokeWidth={2.5} />
                     </div>
                     <div className="pt-0.5">
                        <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-0.5">Responsabilidade Extra</h4>
                        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.4] pr-2">Ter acompanhamento aumenta constância e execução.</p>
                     </div>
                 </div>
             </motion.div>

             {/* Inline Checkout Area */}
             <motion.div variants={itemVariants} className="pt-8 mt-6 border-t border-gray-100 dark:border-gray-800">
                 <div className="flex justify-between items-end mb-4 px-1">
                     <div className="font-semibold text-[17px] text-gray-900 dark:text-white">Assinatura Mensal</div>
                     <div className="text-right flex items-baseline gap-1 text-[#2972F5] font-extrabold">
                         <span className="text-[18px]">R$</span>
                         <span className="text-[34px] leading-none tracking-tight">197</span>
                         <span className="text-[15px] font-semibold text-gray-500 tracking-normal">/mês</span>
                     </div>
                 </div>

                 <div className="relative w-full z-50">
                    <button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className={`w-full bg-[#2972F5] hover:bg-[#205DD1] transition-all text-white font-bold text-[18px] h-[64px] rounded-[18px] flex items-center justify-center gap-2 overflow-hidden ${isLoading ? 'scale-110 shadow-none text-transparent' : 'active:scale-[0.98] shadow-[0_8px_20px_rgba(41,114,245,0.25)]'}`}
                    >
                        <span className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>Assinar Consultoria</span>
                    </button>
                    {/* Expansion Circle rendered from button origin */}
                    {isExpanding && (
                        <motion.div
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 100, opacity: 1 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[64px] h-[64px] bg-[#2972F5] rounded-full pointer-events-none z-[100]"
                        />
                    )}
                 </div>

                 <button
                    onClick={onDecline}
                    disabled={isLoading}
                    className="w-full text-center mt-5 mb-4 sm:mb-2 text-[15px] font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent border-none"
                 >
                    Pular, prefiro seguir sem suporte
                 </button>
             </motion.div>

             </motion.div>
          </motion.div>
       </div>
    </motion.div>
  );
};