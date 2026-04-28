import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageCircle, X } from 'lucide-react';

interface PostAnamnesisModalProps {
  isOpen: boolean;
  onConfirmScheduled: () => void;
  onWhatsAppClick?: () => void;
}

export const PostAnamnesisModal: React.FC<PostAnamnesisModalProps> = ({ isOpen, onConfirmScheduled, onWhatsAppClick }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleWhatsAppClick = () => {
    if (onWhatsAppClick) onWhatsAppClick();
    window.open('https://wa.me/5543999142672?text=Ol%C3%A1%2C%20adquiri%20a%20consultoria%20premium%20pelo%20FitMind%2C%20acabei%20de%20enviar%20minha%20anamnese%20e%20gostaria%20de%20marcar%20meu%20hor%C3%A1rio%20para%20iniciar.', '_blank');
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-[420px] bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {!showConfirmation ? (
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 250, delay: 0.1 }}
                  className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-5"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </motion.div>
                
                <h2 className="text-[22px] font-bold text-gray-900 dark:text-white leading-tight mb-3">
                  Anamnese enviada com sucesso
                </h2>
                <p className="text-[15px] font-medium text-gray-500 dark:text-[#8E8E93] leading-relaxed mb-8">
                  Agora falta agendar sua primeira conversa com o Dr. Allan para iniciar sua estratégia personalizada.
                </p>

                <div className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-gray-100 dark:border-white/5 rounded-[24px] p-5 mb-8">
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                    Próximo passo: agendar consulta
                  </h3>
                  <p className="text-[14px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    Fale com o Dr. Allan pelo WhatsApp para combinar o melhor horário da sua primeira conversa.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-[16px] py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_16px_rgba(37,211,102,0.2)] hover:shadow-[0_8px_20px_rgba(37,211,102,0.3)]"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    Chamar Allan no WhatsApp
                  </button>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="w-full bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 font-bold text-[15px] py-4 rounded-xl active:scale-[0.98] transition-all"
                  >
                    Já agendei minha consulta
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center text-center py-2"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-5">
                  <MessageCircle className="w-8 h-8 text-[#007AFF] fill-[#007AFF]/20" />
                </div>
                
                <h2 className="text-[22px] font-bold text-gray-900 dark:text-white leading-tight mb-3">
                  Você realmente já agendou sua consulta?
                </h2>
                <p className="text-[15px] font-medium text-gray-500 dark:text-[#8E8E93] leading-relaxed mb-8">
                  Essa etapa é importante para montarmos seu plano personalizado corretamente.
                </p>

                <div className="w-full flex flex-col gap-3">
                   <button
                    onClick={onConfirmScheduled}
                    className="w-full bg-[#007AFF] hover:bg-[#0056b3] text-white font-bold text-[16px] py-4 rounded-xl active:scale-[0.98] transition-all shadow-[0_8px_16px_rgba(0,122,255,0.2)] hover:shadow-[0_8px_20px_rgba(0,122,255,0.3)]"
                  >
                    Sim, já agendei
                  </button>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="w-full bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200 dark:hover:bg-[#3C3C3E] text-gray-900 dark:text-white font-bold text-[16px] py-4 rounded-xl active:scale-[0.98] transition-all"
                  >
                    Ainda não, falar com Allan
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return modalContent;

  return createPortal(modalContent, document.body);
};
