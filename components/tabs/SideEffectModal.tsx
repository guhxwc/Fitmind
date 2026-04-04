
import React, { useState } from 'react';
import type { SideEffectEntry, SideEffect, SideEffectName, SideEffectIntensity } from '../../types';
import Portal from '../core/Portal';
import { SparklesIcon, CheckCircleIcon, ShieldCheckIcon, ChevronRightIcon } from '../core/Icons';
import { useScrollLock } from '../../hooks/useScrollLock';

interface SideEffectModalProps {
  date: Date;
  initialEntry?: SideEffectEntry | null;
  onClose: () => void;
  onSave: (data: { effects: SideEffect[], notes?: string }) => Promise<void>;
}

const COMMON_EFFECTS: { name: SideEffectName; icon: string }[] = [
    { name: 'Náusea', icon: '🤢' },
    { name: 'Dor de cabeça', icon: '🤕' },
    { name: 'Fadiga', icon: '😴' },
    { name: 'Apetite reduzido', icon: '🤐' },
    { name: 'Tontura', icon: '😵‍💫' },
    { name: 'Constipação', icon: '🧻' }
];

const INTENSITIES: SideEffectIntensity[] = ['Leve', 'Moderado', 'Severo'];
const DURATIONS = ['< 1h', 'Algumas horas', 'O dia todo', 'Vários dias'];

const EFFECT_TIPS: Record<SideEffectName, string> = {
    'Náusea': 'Chá de gengibre ou mascar um pedaço pequeno de gengibre ajuda muito. Evite deitar logo após comer e fracione as refeições.',
    'Dor de cabeça': 'Na maioria dos casos com GLP-1, é desidratação. Tome 500ml de água agora. Se não passar em 1h, considere um analgésico comum.',
    'Fadiga': 'Seu corpo está se adaptando metabolicamente. Não force treinos pesados hoje. Priorize dormir 30min mais cedo.',
    'Apetite reduzido': 'É o efeito esperado. Foque em comer proteínas (ovos, frango, iogurte) primeiro para não perder massa muscular.',
    'Tontura': 'Pode ser queda de pressão ou açúcar (hipoglicemia). Coma uma fruta ou uma pitada de sal agora e levante-se devagar.',
    'Constipação': 'Aumente a água para 3L hoje. Caminhar ajuda o movimento intestinal. Fibras como psyllium ou mamão são essenciais.',
    'Diarreia': 'Hidrate-se com soro caseiro ou água de coco. Evite alimentos gordurosos e laticínios. Banana e arroz branco ajudam.',
    'Nenhum': 'Ótimo! Continue mantendo sua hidratação e alimentação equilibrada.'
};

export const SideEffectModal: React.FC<SideEffectModalProps> = ({ date, initialEntry, onClose, onSave }) => {
  const [view, setView] = useState<'input' | 'care_plan'>('input');
  const [effects, setEffects] = useState<SideEffect[]>(initialEntry?.effects || []);
  const [notes, setNotes] = useState(initialEntry?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useScrollLock(true);

  const toggleEffect = (name: SideEffectName | string) => {
    const existingEffect = effects.find(e => e.name === name);
    if (existingEffect) {
      setEffects(effects.filter(e => e.name !== name));
    } else {
      setEffects([...effects, { name, intensity: 'Leve', duration: '< 1h' }]);
    }
  };

  const setIntensity = (name: SideEffectName | string, intensity: SideEffectIntensity) => {
    setEffects(effects.map(e => e.name === name ? { ...e, intensity } : e));
  };

  const setDuration = (name: SideEffectName | string, duration: string) => {
    setEffects(effects.map(e => e.name === name ? { ...e, duration } : e));
  };
  
  const handleSaveAndShowPlan = async () => {
      setIsSaving(true);
      await onSave({ effects, notes });
      setIsSaving(false);
      
      if (effects.length > 0) {
          setView('care_plan');
      } else {
          onClose();
      }
  };

  if (view === 'care_plan') {
      return (
        <Portal>
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-[32px] flex flex-col animate-pop-in shadow-2xl relative max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    
                    <button 
                      onClick={onClose}
                      className="absolute top-4 right-5 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <div className="p-8 pb-4 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-pop-in">
                            <ShieldCheckIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Seu Plano de Alívio</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Dicas baseadas no que você relatou.</p>
                    </div>

                    <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-4">
                        {effects.map((effect, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{COMMON_EFFECTS.find(c => c.name === effect.name)?.icon}</span>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{effect.name}</h3>
                                    {effect.intensity === 'Severo' && (
                                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">ATENÇÃO</span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                    {EFFECT_TIPS[effect.name as SideEffectName]}
                                </p>
                                {effect.intensity === 'Severo' && (
                                    <p className="mt-3 text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                                        Como a intensidade é severa, se o sintoma persistir por mais de 24h, entre em contato com seu médico.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 pt-2 bg-white dark:bg-[#1C1C1E] border-t border-gray-100 dark:border-gray-800">
                        <button onClick={onClose} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-transform">
                            Entendi, obrigado
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
      )
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
        <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-[32px] flex flex-col animate-pop-in shadow-2xl relative max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex items-center justify-between p-6 pb-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium">
                Cancelar
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Check-in de Saúde</h2>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-8">
              
              {/* Selector Grid */}
              <section>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                      O que você está sentindo hoje?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                      {COMMON_EFFECTS.map(({name, icon}) => {
                          const isSelected = effects.some(e => e.name === name);
                          return (
                              <button
                                  key={name}
                                  onClick={() => toggleEffect(name)}
                                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 ${
                                      isSelected 
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400' 
                                      : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                  }`}
                              >
                                  <span className="text-2xl">{icon}</span>
                                  <span className={`font-bold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>{name}</span>
                              </button>
                          )
                      })}
                  </div>
              </section>
              
              {/* Detailed Inputs for Selected */}
              {effects.length > 0 && (
                  <section className="space-y-4 animate-fade-in">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Detalhes dos Sintomas</h3>
                      {effects.map(effect => (
                          <div key={effect.name} className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                              <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-2">
                                      <span className="text-lg">{COMMON_EFFECTS.find(c => c.name === effect.name)?.icon}</span>
                                      <span className="font-bold text-gray-900 dark:text-white">{effect.name}</span>
                                  </div>
                                  <button onClick={() => toggleEffect(effect.name)} className="text-gray-400 hover:text-red-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>
                              </div>
                              
                              <div className="space-y-4">
                                  <div>
                                      <p className="text-xs font-semibold text-gray-500 mb-2">Intensidade</p>
                                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                          {INTENSITIES.map(intensity => (
                                              <button
                                                  key={intensity}
                                                  onClick={() => setIntensity(effect.name, intensity)}
                                                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                                      effect.intensity === intensity 
                                                      ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                                                      : 'text-gray-400 hover:text-gray-600'
                                                  }`}
                                              >
                                                  {intensity}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  <div>
                                      <p className="text-xs font-semibold text-gray-500 mb-2">Duração</p>
                                      <div className="flex flex-wrap gap-2">
                                          {DURATIONS.map(dur => (
                                              <button
                                                  key={dur}
                                                  onClick={() => setDuration(effect.name, dur)}
                                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                      effect.duration === dur 
                                                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                                                      : 'border-gray-200 dark:border-gray-700 text-gray-500'
                                                  }`}
                                              >
                                                  {dur}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </section>
              )}

              <section>
                  <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">Alguma observação extra?</label>
                  <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Começou depois do almoço..."
                      className="w-full h-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white border border-gray-200 dark:border-gray-700 resize-none placeholder:text-gray-400"
                  />
              </section>
          </div>

          <div className="p-6 pt-2 bg-white dark:bg-[#1C1C1E] border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={handleSaveAndShowPlan}
                disabled={isSaving}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
              >
                  {isSaving ? 'Salvando...' : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        Salvar e Ver Dicas
                      </>
                  )}
              </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
