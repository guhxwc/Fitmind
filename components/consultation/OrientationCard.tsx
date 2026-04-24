import React from 'react';
import { MessageCircle } from 'lucide-react';

const DR_ALLAN_PHOTO = "https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png";

export const OrientationCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Última orientação do Allan</h3>
            <div className="text-[13px] font-medium text-gray-500 mt-0.5">Ontem, 21:15</div>
          </div>
        </div>
      </div>

      <div className="bg-[#eef3ff] dark:bg-blue-900/10 rounded-[16px] p-4 mb-4 relative">
        <span className="text-blue-500 font-serif text-[28px] font-bold leading-none absolute top-3 left-3">"</span>
        <p className="text-[14px] font-medium text-gray-800 dark:text-gray-200 leading-relaxed pl-4">
          Essa semana foque em manter sua hidratação em dia e bater sua meta de proteína. Pequenas consistências trazem grandes resultados! 💪
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden shrink-0 border-[2px] border-white dark:border-[#2C2C2E] shadow-sm relative flex items-end ml-1">
          <img 
            src={DR_ALLAN_PHOTO} 
            alt="Allan" 
            className="w-full h-full object-cover object-top absolute inset-0 z-0 scale-[1.3] translate-y-[8px] translate-x-[3px]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent z-10" />
        </div>

        <button className="flex items-center gap-2 bg-white dark:bg-[#1C1C1E] border-[1.5px] border-blue-500 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-5 py-2.5 rounded-full font-bold text-[14px] transition-all duration-200 group active:scale-95">
          Ver mensagens
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] group-hover:translate-x-[3px] transition-transform">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
