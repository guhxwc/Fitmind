import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Gift, Star, Clock, AlertCircle } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import Portal from './core/Portal';
import { useNavigate } from 'react-router-dom';

interface TrialTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialTestModal: React.FC<TrialTestModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const notification = {
    title: 'Seu teste grátis termina hoje! ⏳',
    body: 'Não perca o acesso à sua evolução. Sabia que você pode ganhar 1 mês de FitMind PRO inteiramente grátis? Basta indicar um amigo que também usa medicação GLP-1.',
    primary: 'Ganhar 1 Mês Grátis',
    secondary: 'Agora não, obrigado',
    icon: <Clock className="w-8 h-8 text-blue-500" />
  };

  const handlePrimaryAction = () => {
    navigate('/referrals');
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 300
            }
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.9, 
            y: 20,
            transition: { duration: 0.2 }
          }}
          className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl overflow-hidden"
        >
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
              {notification.icon}
            </div>
            
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
              {notification.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-[16px] leading-relaxed mb-8">
              {notification.body}
            </p>

            <div className="w-full space-y-3">
              <button 
                onClick={handlePrimaryAction}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                {notification.primary}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg active:scale-95 transition-transform"
              >
                {notification.secondary}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 w-full">
              <p className="text-[11px] text-gray-400 font-medium text-center uppercase tracking-widest">
                Simulação de Retenção
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
};
