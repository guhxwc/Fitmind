import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import Portal from '../core/Portal';

export type UpsellTrigger = 'engaged_user' | 'plateau' | 'side_effect' | 'diet_limit' | 'scheduled_day10';

interface ConsultationUpsellModalProps {
  trigger: UpsellTrigger;
  onClose: () => void;
}

const COPY_PER_TRIGGER: Record<UpsellTrigger, {
  title: string;
  subtitle: string;
  highlights: string[];
  primary: string;
  secondary: string;
}> = {
  engaged_user: {
    title: "Você já tem ritmo.",
    subtitle: "Quer acelerar com um plano feito sob medida pelo Dr. Allan?",
    highlights: ["Plano alimentar personalizado", "Ajustes mensais com nutricionista", "Suporte direto e prioritário"],
    primary: "Conhecer a consultoria",
    secondary: "Agora não"
  },
  plateau: {
    title: "Peso travou?",
    subtitle: "Acontece. O Dr. Allan ajusta sua estratégia para destravar a perda.",
    highlights: ["Análise do seu histórico", "Reajuste de plano alimentar", "Acompanhamento mensal direto"],
    primary: "Falar com o Dr. Allan",
    secondary: "Continuar sozinho"
  },
  side_effect: {
    title: "Sentindo desconforto?",
    subtitle: "Efeitos colaterais merecem orientação profissional. O Dr. Allan pode ajudar.",
    highlights: ["Avaliação dos sintomas", "Ajuste alimentar específico", "Suporte humano quando precisar"],
    primary: "Quero orientação",
    secondary: "Mais tarde"
  },
  diet_limit: {
    title: "Quer o plano completo?",
    subtitle: "A Dieta IA mostra 3 dias. Com o Dr. Allan, você recebe os 7 dias validados.",
    highlights: ["Plano de 7 dias completo", "Validado por nutricionista", "Ajustes ao longo do mês"],
    primary: "Ver consultoria",
    secondary: "Fico com a IA"
  },
  scheduled_day10: {
    title: "O Dr. Allan tem 2 vagas esta semana.",
    subtitle: "Acompanhamento humano para quem leva o tratamento a sério.",
    highlights: ["Especialista em GLP-1", "CRN 13901", "Atendimento 1 a 1"],
    primary: "Reservar minha vaga",
    secondary: "Não tenho interesse"
  }
};

export const ConsultationUpsellModal: React.FC<ConsultationUpsellModalProps> = ({ trigger, onClose }) => {
  const navigate = useNavigate();
  useScrollLock(true);

  const copy = COPY_PER_TRIGGER[trigger] || COPY_PER_TRIGGER.engaged_user;

  // Handle dismiss (backdrop click, Esc, secondary action)
  const handleDismiss = () => {
    localStorage.setItem('fitmind_upsell_dismissed_at', new Date().toISOString());
    const count = parseInt(localStorage.getItem('fitmind_upsell_shown_count') || '0', 10);
    localStorage.setItem('fitmind_upsell_shown_count', (count + 1).toString());
    onClose();
  };

  const handlePrimaryClick = () => {
    localStorage.setItem('fitmind_upsell_last_click', new Date().toISOString());
    onClose();
    // Use setTimeout so the modal and layout close gracefully before navigating
    setTimeout(() => {
      navigate(`/consultoria?ref=upsell_${trigger}`);
    }, 150);
  };

  // Esc key behavior
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop - Apple-inspired style with translucent dark layer and robust blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-black/45 backdrop-blur-[20px]"
          id="upsell_modal_backdrop"
        />

        {/* Modal Outer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="relative w-full max-w-sm rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 px-6 py-7 shadow-2xl flex flex-col pointer-events-auto overflow-hidden text-center justify-center"
          id="upsell_modal_container"
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/4 dark:hover:bg-white/8 text-gray-400 dark:text-white/55 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            aria-label="Dispensar"
            id="upsell_close_btn"
          >
            <X size={16} />
          </button>

          {/* Premium Header Accent */}
          <div className="flex justify-center mb-4">
            <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-white/4 border border-blue-100 dark:border-white/8">
              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 tracking-[0.12em] uppercase font-mono">
                Consultoria Premium
              </span>
            </div>
          </div>

          {/* Title and Subtitle */}
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white leading-tight mb-2">
            {copy.title}
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-white/70 tracking-[-0.015em] leading-relaxed mb-6 px-1">
            {copy.subtitle}
          </p>

          {/* Value Highlights */}
          <div className="space-y-3 mb-7 text-left w-full mx-auto" id="upsell_highlights">
            {copy.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100/50 dark:hover:bg-white/[0.05] rounded-xl px-4 py-3 border border-gray-100 dark:border-white/[0.04] transition-colors">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Check size={12} className="text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-[13px] text-gray-700 dark:text-white/85 font-medium tracking-normal">
                  {highlight}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5 w-full">
            <button
              onClick={handlePrimaryClick}
              className="w-full py-4 rounded-xl text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)'
              }}
              id="upsell_primary_btn"
            >
              {copy.primary}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-xl text-[14px] font-medium text-gray-400 dark:text-white/55 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-[0.98]"
              id="upsell_secondary_btn"
            >
              {copy.secondary}
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
};
