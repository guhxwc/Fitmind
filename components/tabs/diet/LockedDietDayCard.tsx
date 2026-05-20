import React from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles, ChevronRight } from 'lucide-react';
import { useUpsell } from '../../UpsellProvider';

interface LockedDietDayCardProps {
  dayName: string;
  dayIndex: number;
}

export const LockedDietDayCard: React.FC<LockedDietDayCardProps> = ({ dayName, dayIndex }) => {
  const { triggerUpsell } = useUpsell();

  const handleCardClick = () => {
    triggerUpsell('diet_limit', true);
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="relative overflow-hidden rounded-[2rem] border border-gray-100 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 cursor-pointer shadow-sm transition-all duration-300"
      id={`locked_diet_day_${dayIndex}`}
    >
      {/* Background radial soft gradient for premium glow */}
      <div className="absolute -right-20 -bottom-20 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Glass locked circle representation */}
          <div className="w-14 h-14 rounded-[20px] bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30 flex items-center justify-center shadow-sm">
            <Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">
              Dia {dayIndex + 1} • Bloqueado
            </span>
            <h3 className="font-extrabold text-gray-800 dark:text-white text-lg tracking-tight mt-0.5">
              {dayName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100/50 dark:border-emerald-500/25 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Premium
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100/60 dark:border-gray-800/30 flex items-center justify-between text-gray-500 dark:text-gray-400">
        <p className="text-[12px] font-medium leading-relaxed max-w-[85%]">
          A Dieta IA oficial é limitada a 3 dias. Clique para liberar os 7 dias completos com validação humana.
        </p>
        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
      </div>
    </motion.div>
  );
};
