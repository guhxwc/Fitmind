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
      className="relative overflow-hidden mt-6 rounded-[2rem] bg-gradient-to-br from-gray-900 via-gray-950 to-black dark:from-gray-950 dark:via-black dark:to-[#111] border-[0.5px] border-white/10 p-6 cursor-pointer shadow-xl"
      id="diet_footer_cta_container"
    >
      {/* Soft gradient blue flare */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-4">
        {/* Badge & Star */}
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.14em]">
              Upgrade
            </span>
          </div>
        </div>

        {/* Core Description Copy */}
        <div className="space-y-1">
          <h3 className="font-bold text-white text-[19px] tracking-tight leading-tight">
            Consultoria Humana com Clínico
          </h3>
          <p className="text-[13px] text-white/60 leading-relaxed font-normal">
            Receba planos 100% validados pelo Dr. Allan de 7 dias com ajustes mensais automáticos, exames acompanhados e suporte prioritário no WhatsApp.
          </p>
        </div>

        {/* Dynamic Interactive Button Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1" id="diet_footer_cta_action">
          <span className="text-[11px] font-semibold text-blue-400 tracking-wider uppercase">
            Conhecer vagas disponíveis
          </span>
          <div className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors">
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
