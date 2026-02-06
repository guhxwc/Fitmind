
import React, { useState } from 'react';
import Portal from '../core/Portal';
import { ShieldCheckIcon, CheckCircleIcon } from '../core/Icons';

interface FastingQuizProps {
  onComplete: (plan: string) => void;
  onClose: () => void;
}

const QuizHeader: React.FC<{onClose: () => void, step: number, totalSteps: number, onBack?: () => void}> = ({ onClose, step, totalSteps, onBack }) => {
    const progress = Math.min(((step + 1) / totalSteps) * 100, 100);
    return (
        <div className="flex items-center gap-4 mb-4">
            {step > 0 && onBack ? (
                <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
            ) : (
                <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}
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
  
  // Expanded State for detailed recommendation
  const [answers, setAnswers] = useState({
    sex: '', // 'homem' | 'mulher'
    experience: '', // 'iniciante' | 'intermediario' | 'avancado'
    goal: '', // 'peso' | 'saude' | 'autofagia' | 'praticidade'
    hunger: '', // 'manha' | 'noite' | 'controlada'
    active: '', // 'sedentario' | 'treino_leve' | 'treino_pesado'
  });

  const TOTAL_STEPS = 7; // Intro + 5 Questions + Result

  const handleRiskSelection = (hasRisk: boolean) => {
      setRiskFactor(hasRisk);
      if (hasRisk) {
          setStep(TOTAL_STEPS); // Jump to end (Risk screen)
      } else {
          setStep(prev => prev + 1);
      }
  };

  const handleOptionSelect = (key: string, value: string) => {
      setAnswers(prev => ({ ...prev, [key]: value }));
      setStep(prev => prev + 1);
  };

  const prevStep = () => {
      setStep(prev => Math.max(0, prev - 1));
  }

  const getRecommendation = () => {
      if (riskFactor) return null;

      const { sex, experience, goal, hunger, active } = answers;

      // --- LOGIC TREE ---

      // 1. Safety First: Beginners & Women (often more sensitive to fasting stress)
      if (experience === 'iniciante') {
          if (sex === 'mulher') return { plan: '12:12', icon: '🌅', title: '12:12 Circadiano', desc: 'Ideal para o ciclo hormonal feminino iniciar sem estresse.' };
          return { plan: '14:10', icon: '🥑', title: '14:10 Metabólico', desc: 'O melhor ponto de partida seguro e eficaz.' };
      }

      // 2. Goal: Weight Loss (Perda de Peso)
      if (goal === 'peso') {
          if (hunger === 'manha') return { plan: '14:10', icon: '🥑', title: '14:10 Metabólico', desc: 'Permite um café da manhã mais cedo para evitar compulsão.' };
          if (active === 'treino_pesado') return { plan: '16:8', icon: '🔥', title: '16:8 Leangains', desc: 'Padrão ouro para definir mantendo massa muscular.' };
          if (experience === 'avancado') return { plan: '18:6', icon: '🧬', title: '18:6 Autofagia', desc: 'Potencializa a queima de gordura teimosa.' };
          return { plan: '16:8', icon: '🔥', title: '16:8 Clássico', desc: 'O equilíbrio perfeito para queima de gordura.' };
      }

      // 3. Goal: Autophagy/Detox (Health)
      if (goal === 'autofagia') {
          if (experience === 'intermediario') return { plan: '18:6', icon: '🧬', title: '18:6 Autofagia', desc: 'O início da reciclagem celular profunda.' };
          if (experience === 'avancado') return { plan: '20:4', icon: '⚔️', title: '20:4 Guerreiro', desc: 'Máxima renovação celular diária.' };
          return { plan: '16:8', icon: '🔥', title: '16:8 Preparatório', desc: 'Prepare seu corpo antes de jejuns mais longos.' };
      }

      // 4. Goal: Praticidade (Busy lifestyle)
      if (goal === 'praticidade') {
          if (experience === 'avancado') return { plan: '23:1', icon: '🍽️', title: 'OMAD (23:1)', desc: 'Uma refeição, foco total, zero preocupação.' };
          return { plan: '16:8', icon: '🔥', title: '16:8 (Pula Café)', desc: 'A forma mais simples: apenas pule o café da manhã.' };
      }

      // 5. Hunger Patterns Override (Rotina)
      if (hunger === 'noite') {
          return { plan: '16:8', icon: '🔥', title: '16:8 (Janela Tarde)', desc: 'Foque sua alimentação entre 12h e 20h para dormir saciado.' };
      }

      // Default Fallback
      return {
          plan: '16:8',
          icon: '🔥',
          title: '16:8 Leangains',
          desc: 'O protocolo mais versátil e estudado para saúde geral.',
      };
  };

  const recommendation = getRecommendation();

  const renderContent = () => {
      switch (step) {
          case 0: // Intro
            return (
                <div className="flex flex-col h-full justify-center">
                     <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                        <ShieldCheckIcon className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">Segurança Primeiro</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed text-lg px-2">
                        O uso de medicamentos GLP-1 altera sua glicemia e digestão. 
                        <br/><br/>
                        Vamos encontrar um plano seguro que potencialize seus resultados <strong>sem causar mal-estar</strong>.
                    </p>
                    <button onClick={() => setStep(1)} className="mt-auto mb-4 w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-lg">
                        Começar Análise
                    </button>
                </div>
            );

          case 1: // Risk Check
            return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Histórico Médico</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Alguma destas condições se aplica a você?</p>
                    <div className="space-y-3">
                        <QuizOption onClick={() => handleRiskSelection(true)} isSelected={false} icon="💉">
                            Uso insulina (além do GLP-1)
                        </QuizOption>
                        <QuizOption onClick={() => handleRiskSelection(true)} isSelected={false} icon="⚠️">
                             Histórico de transtornos alimentares
                        </QuizOption>
                        <QuizOption onClick={() => handleRiskSelection(true)} isSelected={false} icon="🤰">
                             Grávida ou amamentando
                        </QuizOption>
                        <QuizOption onClick={() => handleRiskSelection(false)} isSelected={false} icon="✅">
                             Nenhuma das opções acima
                        </QuizOption>
                    </div>
                </div>
            );

          case 2: // Sex
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Qual seu gênero biológico?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-4">Importante pois mulheres têm sensibilidade hormonal diferente ao jejum.</p>
                     <div className="space-y-3">
                        <QuizOption onClick={() => handleOptionSelect('sex', 'mulher')} isSelected={answers.sex === 'mulher'} icon="👩">
                            Feminino
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('sex', 'homem')} isSelected={answers.sex === 'homem'} icon="👨">
                            Masculino
                        </QuizOption>
                    </div>
                </div>
             );
        
          case 3: // Experience
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sua experiência com jejum</h2>
                     <div className="space-y-3">
                        <QuizOption onClick={() => handleOptionSelect('experience', 'iniciante')} isSelected={answers.experience === 'iniciante'} icon="🐣">
                            Nunca fiz / Iniciante
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('experience', 'intermediario')} isSelected={answers.experience === 'intermediario'} icon="👍">
                            Já fiz algumas vezes
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('experience', 'avancado')} isSelected={answers.experience === 'avancado'} icon="💪">
                            Faço regularmente (Expert)
                        </QuizOption>
                    </div>
                </div>
             );

          case 4: // Goal
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Qual seu objetivo principal?</h2>
                    <div className="space-y-3">
                        <QuizOption onClick={() => handleOptionSelect('goal', 'peso')} isSelected={answers.goal === 'peso'} icon="📉">
                            Acelerar perda de peso
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('goal', 'saude')} isSelected={answers.goal === 'saude'} icon="❤️">
                            Melhorar saúde metabólica
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('goal', 'autofagia')} isSelected={answers.goal === 'autofagia'} icon="🧬">
                            Autofagia e Longevidade
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('goal', 'praticidade')} isSelected={answers.goal === 'praticidade'} icon="⚡">
                            Praticidade e foco mental
                        </QuizOption>
                    </div>
                </div>
             );

          case 5: // Hunger / Routine
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Onde está sua maior fome?</h2>
                     <div className="space-y-3">
                        <QuizOption onClick={() => handleOptionSelect('hunger', 'manha')} isSelected={answers.hunger === 'manha'} icon="🍳">
                            Pela manhã (preciso de café)
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('hunger', 'noite')} isSelected={answers.hunger === 'noite'} icon="🌙">
                            À noite (costumo beliscar)
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('hunger', 'controlada')} isSelected={answers.hunger === 'controlada'} icon="👌">
                            Minha fome é controlada
                        </QuizOption>
                    </div>
                </div>
             );

          case 6: // Activity Level
             return (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Como são seus treinos?</h2>
                     <div className="space-y-3">
                        <QuizOption onClick={() => handleOptionSelect('active', 'sedentario')} isSelected={answers.active === 'sedentario'} icon="🛋️">
                            Leve / Sedentário
                        </QuizOption>
                         <QuizOption onClick={() => handleOptionSelect('active', 'treino_leve')} isSelected={answers.active === 'treino_leve'} icon="🚶">
                            Caminhadas ou Yoga
                        </QuizOption>
                        <QuizOption onClick={() => handleOptionSelect('active', 'treino_pesado')} isSelected={answers.active === 'treino_pesado'} icon="🏋️">
                            Musculação ou Cardio Intenso
                        </QuizOption>
                    </div>
                </div>
             );

          case 7: // Result (Mapped to TOTAL_STEPS logic or Risk logic)
            if (riskFactor) {
                return (
                    <div className="flex flex-col h-full justify-center items-center text-center">
                         <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Atenção Médica Necessária</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                            Devido às condições selecionadas, o jejum intermitente apresenta riscos de saúde e não deve ser feito sem acompanhamento médico presencial.
                        </p>
                        <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-4 rounded-xl text-lg font-semibold">
                            Entendi
                        </button>
                    </div>
                )
            }

            return (
                 <div className="flex flex-col h-full pt-4">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center mb-2">Recomendação da IA</p>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">Seu Plano Ideal</h2>
                    
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-[32px] shadow-xl mb-8 relative overflow-hidden group">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[30px] text-center relative z-10 h-full flex flex-col items-center justify-center">
                            <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{recommendation?.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{recommendation?.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{recommendation?.desc}</p>
                        </div>
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-white/20 blur-2xl"></div>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                        <button 
                            onClick={() => onComplete(recommendation?.plan || '16:8')} 
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                            Aceitar Desafio
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-full text-gray-500 dark:text-gray-400 font-semibold py-3 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            Ver outros planos
                        </button>
                    </div>
                 </div>
            );
          default:
            return null;
      }
  };

  return (
    <Portal>
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md h-[95%] rounded-t-[32px] p-6 flex flex-col animate-slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {step > 0 && step < 7 && <QuizHeader onClose={onClose} step={step - 1} totalSteps={6} onBack={prevStep} />}
                
                <div className="flex-grow overflow-y-auto hide-scrollbar">
                    {renderContent()}
                </div>
            </div>
        </div>
    </Portal>
  );
};
