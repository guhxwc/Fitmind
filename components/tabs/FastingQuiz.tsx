
import React, { useState } from 'react';
import Portal from '../core/Portal';
import { ShieldCheckIcon, CheckCircleIcon } from '../core/Icons';

interface FastingQuizProps {
  onComplete: (plan: string) => void;
  onClose: () => void;
}

const QuizHeader: React.FC<{onClose: () => void, step: number, totalSteps: number}> = ({ onClose, step, totalSteps }) => {
    const progress = Math.min(((step + 1) / totalSteps) * 100, 100);
    return (
        <div className="flex items-center gap-4 mb-4">
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
}

const QuizOption: React.FC<{onClick: () => void, isSelected: boolean, children: React.ReactNode, icon?: string}> = ({ onClick, isSelected, children, icon }) => (
     <button
        onClick={onClick}
        className={`w-full text-left p-4 my-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
            isSelected 
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                : 'bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
        {icon && <span className="text-2xl">{icon}</span>}
        <span className="text-lg font-medium flex-grow">{children}</span>
        {isSelected && <CheckCircleIcon className="w-6 h-6" />}
    </button>
)

export const FastingQuiz: React.FC<FastingQuizProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState(0);
  const [riskFactor, setRiskFactor] = useState(false);
  const [answers, setAnswers] = useState({
    goal: '',
    experience: '',
    flexibility: '',
  });

  // Total steps: 0 (Intro) -> 1 (Risk) -> 2 (Goal) -> 3 (Experience) -> 4 (Flexibility) -> 5 (Result/Warning)
  const TOTAL_STEPS = 5;

  const handleRiskSelection = (hasRisk: boolean) => {
      setRiskFactor(hasRisk);
      if (hasRisk) {
          // Jump straight to warning
          setStep(5); 
      } else {
          setStep(prev => prev + 1);
      }
  };

  const handleOptionSelect = (key: string, value: string) => {
      setAnswers(prev => ({ ...prev, [key]: value }));
      if (step < 4) {
        setStep(prev => prev + 1);
      } else {
        setStep(5); // Go to result
      }
  };

  const getRecommendation = () => {
      if (riskFactor) return null;

      // Logic for recommendation
      if (answers.experience === 'inexperiente') {
          return {
              plan: '14:10',
              icon: '🐰',
              title: 'Jejum Circadiano (14:10)',
              desc: 'Ideal para iniciantes. Respeita o ciclo natural do sono e é mais seguro para quem usa medicação GLP-1.',
              reason: 'Como você está começando, o 14:10 oferece os benefícios metabólicos sem estresse excessivo ou risco alto de hipoglicemia.'
          };
      }
      
      if (answers.goal === 'detox' || answers.experience === 'avancado') {
          return {
              plan: '18:6',
              icon: '🦁',
              title: 'Jejum 18:6',
              desc: 'Para quem busca máxima queima de gordura e autofagia.',
              reason: 'Sua experiência permite janelas maiores, potencializando a limpeza celular e sensibilidade à insulina.'
          };
      }

      // Default standard
      return {
          plan: '16:8',
          icon: '🦊',
          title: 'Protocolo Leangains (16:8)',
          desc: 'O equilíbrio perfeito entre resultados e sustentabilidade.',
          reason: 'Este é o padrão ouro para perda de peso consistente, permitindo duas grandes refeições diárias.'
      };
  };

  const recommendation = getRecommendation();

  const renderContent = () => {
      switch (step) {
          case 0: // Intro GLP-1
            return (
                <div className="flex flex-col h-full justify-center">
                     <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <ShieldCheckIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">Segurança com Mounjaro & Ozempic</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                        Medicamentos GLP-1 (como Mounjaro e Ozempic) já alteram sua glicemia, apetite e digestão. 
                        <br/><br/>
                        Adicionar jejum requer cuidado extra para evitar <strong>hipoglicemia</strong> (açúcar baixo) e mal-estar. Vamos verificar se é seguro para você.
                    </p>
                    <button onClick={() => setStep(1)} className="mt-8 w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold">
                        Entendi, vamos verificar
                    </button>
                </div>
            );

          case 1: // Risk Assessment
            return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Alguma das seguintes situações se aplica a você?</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Seja honesto para sua segurança.</p>
                    <div className="space-y-2">
                        <QuizOption onClick={() => handleRiskSelection(true)} isSelected={false} icon="💉">
                            Tenho diabetes e uso insulina ou sulfonilureias
                        </QuizOption>
                        <QuizOption onClick={() => handleRiskSelection(true)} isSelected={false} icon="⚠️">
                             Tenho histórico de transtorno alimentar
                        </QuizOption>
                        <QuizOption onClick={() => handleRiskSelection(true)} isSelected={false} icon="🤰">
                             Estou grávida ou amamentando
                        </QuizOption>
                         <QuizOption onClick={() => handleRiskSelection(true)} isSelected={false} icon="💊">
                             Faço uso de doses altas de Mounjaro com efeitos colaterais fortes
                        </QuizOption>
                        <QuizOption onClick={() => handleRiskSelection(false)} isSelected={false} icon="✅">
                             Nenhuma das opções
                        </QuizOption>
                    </div>
                </div>
            );
        
          case 2: // Goal
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Qual é o seu principal objetivo?</h2>
                    <div className="space-y-2">
                        <QuizOption onClick={() => handleOptionSelect('goal', 'peso')} isSelected={answers.goal === 'peso'} icon="📉">
                            Perda de peso acelerada
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('goal', 'saude')} isSelected={answers.goal === 'saude'} icon="❤️">
                            Melhorar saúde metabólica
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('goal', 'detox')} isSelected={answers.goal === 'detox'} icon="✨">
                            Detox e Autofagia
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('goal', 'controle')} isSelected={answers.goal === 'controle'} icon="🩸">
                            Controle de glicemia
                        </QuizOption>
                    </div>
                </div>
             );

          case 3: // Experience
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Qual seu nível de experiência com jejuns?</h2>
                     <div className="space-y-2">
                        <QuizOption onClick={() => handleOptionSelect('experience', 'inexperiente')} isSelected={answers.experience === 'inexperiente'} icon="🐣">
                            Sou inexperiente / Primeira vez
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('experience', 'medio')} isSelected={answers.experience === 'medio'} icon="👍">
                            Já fiz jejum algumas vezes
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('experience', 'avancado')} isSelected={answers.experience === 'avancado'} icon="💪">
                            Faço regularmente por longos períodos
                        </QuizOption>
                    </div>
                </div>
             );

          case 4: // Flexibility
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quão flexível deve ser o plano?</h2>
                     <div className="space-y-2">
                        <QuizOption onClick={() => handleOptionSelect('flexibility', 'rotina')} isSelected={answers.flexibility === 'rotina'} icon="🕰️">
                            Gosto de rotina fixa (mesmo horário todo dia)
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('flexibility', 'flexivel')} isSelected={answers.flexibility === 'flexivel'} icon="⚡">
                            Prefiro flexibilidade (mudar horários)
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('flexibility', 'tanto_faz')} isSelected={answers.flexibility === 'tanto_faz'} icon="🤷">
                            Não tenho preferência
                        </QuizOption>
                    </div>
                </div>
             );

          case 5: // Result
            if (riskFactor) {
                return (
                    <div className="flex flex-col h-full justify-center items-center text-center">
                         <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Alto Risco Identificado</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                            Com base nas suas respostas (uso de insulina, gravidez ou histórico médico), o jejum intermitente pode ser perigoso sem supervisão direta.
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-6">
                             <p className="font-bold text-red-800 dark:text-red-200">
                                 Consulte seu médico antes de tentar jejuns — risco aumentado de hipoglicemia e efeitos adversos.
                             </p>
                        </div>
                        <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 rounded-xl text-lg font-semibold">
                            Voltar
                        </button>
                    </div>
                )
            }

            return (
                 <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Seu Plano Ideal</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">Baseado no seu perfil e segurança.</p>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-2 border-blue-100 dark:border-gray-700 p-6 rounded-3xl text-center mb-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">RECOMENDADO</div>
                        <div className="text-6xl mb-4">{recommendation?.icon}</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{recommendation?.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">{recommendation?.desc}</p>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-auto">
                         <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Por que este plano?</p>
                         <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{recommendation?.reason}</p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <button 
                            onClick={() => onComplete(recommendation?.plan || '16:8')} 
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold shadow-lg active:scale-[0.98] transition-transform"
                        >
                            Usar este jejum
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-full text-gray-500 dark:text-gray-400 font-semibold py-2"
                        >
                            Não quero esse, escolher outro
                        </button>
                    </div>
                 </div>
            );
      }
  };

  return (
    <Portal>
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-md h-[90%] rounded-t-3xl p-6 flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {step > 0 && step < 5 && <QuizHeader onClose={onClose} step={step - 1} totalSteps={4} />} {/* Steps 1 to 4 show progress */}
                {step === 0 && (
                    <div className="flex justify-end mb-2">
                         <button onClick={onClose} className="p-2 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    </div>
                )}
                
                <div className="flex-grow overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    </Portal>
  );
};
