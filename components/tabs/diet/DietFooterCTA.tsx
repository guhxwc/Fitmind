import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useUpsell } from '../../UpsellProvider';

export const DietFooterCTA: React.FC = () => {
  const { triggerUpsell } = useUpsell();

  const handleCTAClick = () => {
    triggerUpsell('diet_limit', true);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCTAClick}
      className="relative overflow-hidden mt-6 rounded-[2rem] bg-white dark:bg-[#1C1C1E] border border-gray-150/50 dark:border-white/10 p-6 cursor-pointer shadow-sm"
      id="diet_footer_cta_container"
    >
      {/* Soft gradient blue flare */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-3.5">
        {/* Badge & Star */}
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-100/50 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="text-[10px] font-bold text-blue-600 dark:text-white uppercase tracking-[0.14em]">
              Upgrade
            </span>
          </div>
        </div>

        {/* Core Description Copy */}
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight leading-tight">
            Consultoria Humana com Clínico
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-white/60 leading-relaxed font-normal">
            Receba planos 100% validados pelo Dr. Allan de 7 dias com ajustes mensais automáticos, exames acompanhados e suporte prioritário no WhatsApp.
          </p>
        </div>

        {/* Dynamic Interactive Button Row */}
        <div className="flex items-center justify-between pt-3.5 border-t border-gray-50 dark:border-white/5 mt-1" id="diet_footer_cta_action">
          <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 tracking-wider uppercase">
            Conhecer vagas disponíveis
          </span>
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-white/15 hover:bg-blue-100/80 dark:hover:bg-white/20 border border-blue-100/40 dark:border-white/10 flex items-center justify-center transition-colors">
            <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
