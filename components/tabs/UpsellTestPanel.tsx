import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, Sparkles, Sliders, Play, ShieldAlert } from 'lucide-react';
import { useUpsell } from '../UpsellProvider';

interface UpsellTestPanelProps {
  onBack: () => void;
}

const TEST_TRIGGERS = [
  {
    key: 'engaged_user' as const,
    label: 'Engaged User (Usuário Ativo)',
    description: 'Disparado na aba Resumo após 3s para usuários Pro com ritmo estruturado.',
  },
  {
    key: 'plateau' as const,
    label: 'Plateau (Peso Travado)',
    description: 'Disparado ao notar variação de peso insignificante (< 0.3kg) em 14+ dias.',
  },
  {
    key: 'side_effect' as const,
    label: 'Side Effect (Desconforto Clínico)',
    description: 'Disparado ao registrar efeitos colaterais moderados ou severos.',
  },
  {
    key: 'diet_limit' as const,
    label: 'Diet Limit (Bloqueio de Dias 4-7)',
    description: 'Disparado ao interagir com dias bloqueados ou CTA de rodapé da dieta.',
  },
  {
    key: 'scheduled_day10' as const,
    label: 'Scheduled Day 10 (Vagas Limitadas)',
    description: 'Conversão agendada disparada entre o 10º e 12º dia do plano Pro ativo.',
  }
];

export const UpsellTestPanel: React.FC<UpsellTestPanelProps> = ({ onBack }) => {
  const { triggerUpsell } = useUpsell();
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [storageLogs, setStorageLogs] = useState<Record<string, string>>({});

  // Fetch local storage states to display on screen
  const updateStorageLogs = () => {
    const keys = [
      'fitmind_upsell_dismissed_at',
      'fitmind_upsell_shown_count',
      'fitmind_upsell_last_click',
      'fitmind_upsell_pause_start',
      'fitmind_upsell_plateau_last',
      'fitmind_upsell_sideeffect_last',
      'fitmind_upsell_day10_shown',
      'fitmind_upsell_test_mode',
    ];
    const logs: Record<string, string> = {};
    keys.forEach(k => {
      logs[k] = localStorage.getItem(k) || 'null';
    });
    logs['session:fitmind_upsell_shown_session'] = sessionStorage.getItem('fitmind_upsell_shown_session') || 'null';
    setStorageLogs(logs);
    setTestModeEnabled(localStorage.getItem('fitmind_upsell_test_mode') === 'true');
  };

  useEffect(() => {
    updateStorageLogs();
  }, []);

  const handleToggleTestMode = () => {
    const nextVal = !testModeEnabled;
    localStorage.setItem('fitmind_upsell_test_mode', nextVal ? 'true' : 'false');
    setTestModeEnabled(nextVal);
    updateStorageLogs();
  };

  const handleResetSettings = () => {
    const keys = [
      'fitmind_upsell_dismissed_at',
      'fitmind_upsell_shown_count',
      'fitmind_upsell_last_click',
      'fitmind_upsell_pause_start',
      'fitmind_upsell_plateau_last',
      'fitmind_upsell_sideeffect_last',
      'fitmind_upsell_day10_shown',
      'fitmind_upsell_test_mode',
    ];
    keys.forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem('fitmind_upsell_shown_session');
    
    setTestModeEnabled(false);
    updateStorageLogs();

    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase z-50 shadow-xl animate-fade-in';
    toast.innerText = 'Storage de Upsell limpo com sucesso!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const handleTestTrigger = (triggerKey: typeof TEST_TRIGGERS[number]['key']) => {
    // If testing manually, bypass rules to show modal immediately
    triggerUpsell(triggerKey, true);
    setTimeout(updateStorageLogs, 200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-[#1C1C1E] border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-950 dark:hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="font-extrabold text-[15px] uppercase tracking-widest text-emerald-500">
          Laboratório Upsell
        </span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="p-4 space-y-6 flex-grow pb-16">
        {/* Warning Badge */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-990/10 border border-yellow-250/30 rounded-2xl text-yellow-800 dark:text-yellow-400">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Painel de Diagnóstico do Desenvolvedor</p>
            <p className="opacity-90 leading-relaxed">
              Use as ferramentas abaixo para simular as triggers diretamente. O modo de teste força a exibição bypassando qualquer cooldown ativo ou verificações de status de assinatura.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <section className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            Configuração Geral
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800/40">
            <div>
              <p className="font-bold text-[14px]">Bypassar Regras (Test Mode)</p>
              <p className="text-[11px] text-gray-400">Desativa cooldowns e checagens Pro</p>
            </div>
            <button
              onClick={handleToggleTestMode}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${testModeEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>

          <button
            onClick={handleResetSettings}
            className="w-full py-3.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-red-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Zerar Storage de Upsell
          </button>
        </section>

        {/* Triggers List */}
        <section className="space-y-3">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider px-1">
            Testar Triggers Manualmente
          </h3>

          <div className="space-y-3">
            {TEST_TRIGGERS.map(t => (
              <div
                key={t.key}
                onClick={() => handleTestTrigger(t.key)}
                className="group flex items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] hover:bg-gray-50 dark:hover:bg-gray-800/20 border border-gray-150/40 dark:border-gray-800 rounded-2xl cursor-pointer transition-colors shadow-sm"
              >
                <div className="pr-4 space-y-1">
                  <p className="font-bold text-[14px] flex items-center gap-1.5 text-gray-900 dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    {t.label}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-normal max-w-sm">
                    {t.description}
                  </p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-active:scale-95 transition-transform">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* State Monitor */}
        <section className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800/50 shadow-sm">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">
            Monitor do LocalStorage
          </h3>
          <div className="space-y-2.5 font-mono text-[11px]">
            {Object.entries(storageLogs).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/10 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-850/10 px-1 rounded transition-colors">
                <span className="text-gray-400">{k}</span>
                <span className={`font-semibold ${v !== 'null' ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`}>{v}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
export default UpsellTestPanel;
