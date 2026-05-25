import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import Portal from '../core/Portal';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleWhatsApp = () => {
    const phoneNumber = "55449911354417";
    const message = encodeURIComponent("Olá! Vim pelo Fitmind e gostaria de conversar com o suporte.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    const email = "contato@fitmindhealth.com.br";
    const subject = encodeURIComponent("Suporte Fitmind");
    const body = encodeURIComponent("Olá! Vim pelo Fitmind e gostaria de conversar com o suporte.");
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pb-8 sm:pb-6 pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[340px] rounded-[32px] bg-white dark:bg-[#1C1C1E] shadow-xl p-6 pointer-events-auto overflow-hidden text-center"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-400 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Dispensar"
              >
                <X size={20} />
              </button>

              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-5">
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>

              <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                Fale com o Suporte
              </h2>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-8 max-w-[280px] mx-auto leading-relaxed font-medium">
                Escolha o canal de sua preferência para falar com nossa equipe.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-4 bg-white dark:bg-[#2C2C2E] border border-gray-150/50 dark:border-white/5 rounded-[22px] p-4 transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-full bg-[#25D366]/10 dark:bg-[#25D366]/20 flex flex-shrink-0 items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5 pt-0.5 flex-1">
                    <span className="font-bold text-gray-900 dark:text-white text-[16px]">
                      WhatsApp
                    </span>
                    <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                      Resposta rápida em instantes
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400/70 dark:text-gray-600/70" />
                </button>

                <button
                  onClick={handleEmail}
                  className="w-full flex items-center gap-4 bg-white dark:bg-[#2C2C2E] border border-gray-150/50 dark:border-white/5 rounded-[22px] p-4 transition-all group active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-500/10 flex flex-shrink-0 items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5 pt-0.5 flex-1">
                    <span className="font-bold text-gray-900 dark:text-white text-[16px]">
                      E-mail
                    </span>
                    <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate w-full text-left">
                      contato@fitmindhealth.com.br
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400/70 dark:text-gray-600/70" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Portal>
  );
};
