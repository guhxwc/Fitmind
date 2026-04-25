import React, { useEffect, useState } from 'react';
import { ChevronLeft, Bell, Sparkles, Activity, CheckCircle, MessageCircle, FileText, TrendingUp, Users, Shield } from 'lucide-react';

const DR_ALLAN_PHOTO = "https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png";

interface ConsultationWaitingScreenProps {
  onBack: () => void;
  onChatClick?: () => void;
}

export const ConsultationWaitingScreen: React.FC<ConsultationWaitingScreenProps> = ({ onBack, onChatClick }) => {
  const [progressOffset, setProgressOffset] = useState(320.4);

  useEffect(() => {
    // 320.4 * (1 - 0.65) = 112.14
    const timer = setTimeout(() => {
      setProgressOffset(112.14);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 w-full bg-transparent font-sans flex justify-center">
      <div className="flex-1 w-full max-w-[480px] relative flex flex-col sm:shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:sm:shadow-[0_0_40px_rgba(0,0,0,0.2)] sm:border-x sm:border-gray-200 dark:sm:border-gray-900 bg-transparent px-5 pt-6 pb-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="w-[42px] h-[42px] rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center shadow-[0_2px_6px_rgba(15,23,42,0.06)] dark:shadow-none active:scale-[0.94] transition-transform text-gray-900 border-none dark:text-white"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </button>
          <div className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Premium</div>
          <button 
            className="w-[42px] h-[42px] rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center shadow-[0_2px_6px_rgba(15,23,42,0.06)] dark:shadow-none active:scale-[0.94] transition-transform text-gray-900 border-none relative dark:text-white"
            aria-label="Notificações"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
            <span className="absolute top-[10px] right-[11px] w-[8px] h-[8px] bg-blue-500 border-2 border-white dark:border-[#1e293b] rounded-full"></span>
          </button>
        </div>

        {/* GREETING */}
        <div className="mb-[18px]">
          <h1 className="text-[30px] font-[800] tracking-[-0.8px] leading-[1.1] mb-2 flex items-center gap-2 flex-wrap text-slate-900 dark:text-white">
            Quase tudo <span className="text-blue-500">pronto!</span>
            <Sparkles className="w-6 h-6 text-blue-500 shrink-0" />
          </h1>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-[1.5]">
            Seu projeto está sendo desenvolvido sob medida para você.
          </p>
        </div>

        {/* HERO CARD (dark) */}
        <div className="bg-gradient-to-br from-[#0f172a] via-[#111c33] to-[#0b1223] rounded-[22px] p-[18px_20px] text-white relative overflow-hidden mb-[18px] min-h-[240px] flex flex-col shadow-lg animate-[fadeUp_0.5s_ease-out_both] delay-[50ms]">
          {/* Bolhas decorativas */}
          <div className="absolute -top-[40px] -right-[30px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(59,110,245,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute -bottom-[80px] -right-[100px] w-[260px] h-[260px] bg-[radial-gradient(circle,rgba(91,136,255,0.1)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-3 items-start flex-1">
            <div className="min-w-0 flex flex-col justify-center translate-y-2">
              <div className="inline-flex items-center gap-[6px] py-[4px] px-[10px] rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-[#93b3ff] tracking-[0.6px] mb-[12px] uppercase w-fit">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,110,245,1)] animate-[pulse-dot_1.8s_ease-in-out_infinite]" />
                Em andamento
              </div>
              <h2 className="text-[22px] font-bold tracking-[-0.3px] leading-[1.15] mb-[8px] text-white">
                Seu plano está<br/>sendo montado
              </h2>
              <p className="text-[13px] leading-[1.5] text-white/70 mb-[14px]">
                Dr. Allan está analisando seus dados para criar o plano ideal para você.
              </p>
            </div>

            {/* Avatar com anel de progresso */}
            <div className="relative w-[110px] h-[110px] shrink-0 mt-2">
              <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 110 110">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b6ef5"/>
                    <stop offset="100%" stopColor="#5b88ff"/>
                  </linearGradient>
                </defs>
                <circle cx="55" cy="55" r="51" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle 
                  cx="55" cy="55" r="51" 
                  fill="none" 
                  stroke="url(#ringGrad)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeDasharray="320.4"
                  strokeDashoffset={progressOffset}
                  className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-[10px] rounded-full bg-gradient-to-br from-[#eef3ff] to-[#d6e1ff] p-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.3)] overflow-hidden">
                <img
                  className="w-full h-full rounded-full object-cover object-[58%_40%] block bg-gradient-to-br from-[#eef3ff] to-[#d6e1ff] scale-[1.4] translate-x-4 translate-y-5"
                  src={DR_ALLAN_PHOTO}
                  alt="Dr. Allan Stachuk"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[14px] p-[12px_14px] flex items-center gap-[12px] relative z-10 mt-[12px]">
            <div className="w-[36px] h-[36px] rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
              <Activity className="w-[18px] h-[18px]" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-white leading-[1.3]">Em análise clínica</div>
              <div className="text-[11px] font-medium text-white/60 mt-px">Previsão de conclusão: até 24h</div>
            </div>
          </div>
        </div>

        {/* STAGES CARD */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[18px] p-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] border border-[#eef0f6] dark:border-[#334155] mb-[14px] animate-[fadeUp_0.5s_ease-out_both] delay-[150ms]">
          <div className="text-[15px] font-bold text-slate-900 dark:text-white mb-[20px]">Etapas do desenvolvimento</div>

          <div className="grid grid-cols-4 gap-1 relative mb-[18px]">
            {/* Linha base */}
            <div className="absolute top-[14px] left-[12.5%] right-[12.5%] h-[2px] bg-[#eef0f6] dark:bg-[#334155] z-0"></div>
            {/* Linha progresso */}
            <div className="absolute top-[14px] left-[12.5%] right-[62.5%] h-[2px] bg-blue-500 z-0"></div>
            {/* Linha animada */}
            <div className="absolute top-[14px] left-[37.5%] right-[37.5%] h-[2px] z-0 bg-[repeating-linear-gradient(to_right,#eef0f6_0,#eef0f6_4px,transparent_4px,transparent_8px)] dark:bg-[repeating-linear-gradient(to_right,#334155_0,#334155_4px,transparent_4px,transparent_8px)]" />

            <div className="flex flex-col items-center text-center relative">
              <div className="w-[30px] h-[30px] rounded-full bg-blue-500 border-2 border-blue-500 flex items-center justify-center text-[12px] font-bold text-white relative z-10 mb-[8px] transition-all duration-200">
                <CheckCircle className="w-[15px] h-[15px]" strokeWidth={2.5} />
              </div>
              <div className="text-[10.5px] font-semibold text-slate-900 dark:text-white leading-[1.2] mb-[3px] px-0.5">Dados recebidos</div>
              <div className="text-[9.5px] font-medium leading-[1.1] text-emerald-500">Concluído</div>
            </div>

            <div className="flex flex-col items-center text-center relative">
              <div className="w-[30px] h-[30px] rounded-full bg-blue-500 border-2 border-blue-500 flex items-center justify-center text-[12px] font-bold text-white relative z-10 mb-[8px] transition-all duration-200 shadow-[0_0_0_4px_rgba(59,110,245,0.2)]">
                2
              </div>
              <div className="text-[10.5px] font-semibold text-slate-900 dark:text-white leading-[1.2] mb-[3px] px-0.5">Análise clínica</div>
              <div className="text-[9.5px] font-medium leading-[1.1] text-blue-500">Em andamento</div>
            </div>

            <div className="flex flex-col items-center text-center relative">
              <div className="w-[30px] h-[30px] rounded-full bg-white dark:bg-[#1e293b] border-2 border-[#eef0f6] dark:border-[#334155] flex items-center justify-center text-[12px] font-bold text-slate-400 dark:text-slate-500 relative z-10 mb-[8px] transition-all duration-200">
                3
              </div>
              <div className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 leading-[1.2] mb-[3px] px-0.5">Plano sendo montado</div>
              <div className="text-[9.5px] font-medium leading-[1.1] text-slate-400 dark:text-slate-500">Pendente</div>
            </div>

            <div className="flex flex-col items-center text-center relative">
              <div className="w-[30px] h-[30px] rounded-full bg-white dark:bg-[#1e293b] border-2 border-[#eef0f6] dark:border-[#334155] flex items-center justify-center text-[12px] font-bold text-slate-400 dark:text-slate-500 relative z-10 mb-[8px] transition-all duration-200">
                4
              </div>
              <div className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 leading-[1.2] mb-[3px] px-0.5">Revisão final</div>
              <div className="text-[9.5px] font-medium leading-[1.1] text-slate-400 dark:text-slate-500">Pendente</div>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-[#f5f8ff] dark:bg-[#111c33] border border-[#e0e9ff] dark:border-[#1e293b] rounded-[12px] p-[12px_14px] flex items-start gap-2.5 mt-6">
            <div className="w-[32px] h-[32px] rounded-lg bg-white dark:bg-[#0f172a] border border-[#e0e9ff] dark:border-[#1e293b] flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
              <Shield className="w-[15px] h-[15px]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-blue-500 mb-0.5">Seus dados estão seguros</div>
              <div className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-[1.45]">Todas as informações são confidenciais e utilizadas apenas para seu acompanhamento.</div>
            </div>
          </div>
        </div>

        {/* CHAT CARD */}
        <div 
          onClick={onChatClick}
          className="bg-[#f0fdf4] dark:bg-[#052e16] border-[1.5px] border-[#dcfce7] dark:border-[#166534] rounded-[16px] p-[14px_16px] flex items-center gap-[12px] mb-[14px] cursor-pointer hover:bg-[#e7fbee] dark:hover:bg-[#064e3b] active:scale-[0.99] transition-all animate-[fadeUp_0.5s_ease-out_both] delay-[250ms]"
        >
          <div className="w-[44px] h-[44px] rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
            <MessageCircle className="w-5 h-5 fill-current" strokeWidth={0} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-emerald-600 dark:text-emerald-500 mb-0.5">Fale com o Dr. Allan</div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-[1.3]">Tire dúvidas ou mande uma mensagem.</div>
          </div>
          <div className="w-[32px] h-[32px] rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0">
            <ChevronLeft className="w-[14px] h-[14px] rotate-180" strokeWidth={2.5} />
          </div>
        </div>

        {/* BENEFÍCIOS */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[18px] p-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] border border-[#eef0f6] dark:border-[#334155] animate-[fadeUp_0.5s_ease-out_both] delay-[350ms]">
          <div className="text-[15px] font-bold text-slate-900 dark:text-white mb-[20px]">O que você vai receber</div>

          <div className="flex flex-col">
            <div className="flex items-start gap-[14px] py-[14px] pt-[4px] border-b border-[#eef0f6] dark:border-[#334155]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#eef3ff] dark:bg-[#111c33] text-blue-500 flex items-center justify-center shrink-0">
                <FileText className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[13.5px] font-bold text-slate-900 dark:text-white mb-[3px] leading-[1.3]">Plano alimentar 100% personalizado</div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-[1.4]">De acordo com seus objetivos e rotina.</div>
              </div>
            </div>

            <div className="flex items-start gap-[14px] py-[14px] border-b border-[#eef0f6] dark:border-[#334155]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#eef3ff] dark:bg-[#111c33] text-blue-500 flex items-center justify-center shrink-0">
                <TrendingUp className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[13.5px] font-bold text-slate-900 dark:text-white mb-[3px] leading-[1.3]">Estratégia e orientações</div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-[1.4]">Passo a passo para você alcançar resultados.</div>
              </div>
            </div>

            <div className="flex items-start gap-[14px] py-[14px] pb-0">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#eef3ff] dark:bg-[#111c33] text-blue-500 flex items-center justify-center shrink-0">
                <Users className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[13.5px] font-bold text-slate-900 dark:text-white mb-[3px] leading-[1.3]">Acompanhamento com o Dr. Allan</div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-[1.4]">Suporte e ajustes sempre que precisar.</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}} />
    </div>
  );
};
