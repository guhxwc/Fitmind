
import React, { useState } from 'react';
import Portal from '../core/Portal';
import { ChevronLeftIcon, CheckCircleIcon, XMarkIcon } from '../core/Icons';
import type { WorkoutQuizAnswers } from '../../types';

interface WorkoutQuizProps {
  onComplete: (answers: WorkoutQuizAnswers) => void;
  onClose: () => void;
}

// --- Components ---

const QuizHeader: React.FC<{
    onBack: () => void; 
    onClose: () => void; 
    step: number; 
    totalSteps: number;
    showBack: boolean;
}> = ({ onBack, onClose, step, totalSteps, showBack }) => {
    const progress = ((step + 1) / totalSteps) * 100;
    
    return (
        <div className="flex flex-col w-full bg-white dark:bg-black pt-safe-top z-20">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="w-10">
                    {showBack && (
                        <button 
                            onClick={onBack} 
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-900 dark:text-white active:scale-90 transition-transform"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
                
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Passo {step + 1} de {totalSteps}
                </span>

                <div className="w-10 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors active:scale-90"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-100 dark:bg-gray-900">
                <div 
                    className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    )
}

const QuizOptionCard: React.FC<{
    onClick: () => void; 
    isSelected: boolean; 
    label: string;
    description?: string;
}> = ({ onClick, isSelected, label, description }) => (
     <button
        onClick={onClick}
        className={`w-full text-left p-5 rounded-[20px] border transition-all duration-200 flex items-center gap-4 group active:scale-[0.98] ${
            isSelected 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-sm' 
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
        }`}
    >
        <div className="flex-grow">
            <h3 className={`text-base font-bold transition-colors ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                {label}
            </h3>
            {description && (
                <p className={`text-xs font-medium mt-1 leading-relaxed ${isSelected ? 'text-orange-600/70 dark:text-orange-400/70' : 'text-gray-400 dark:text-gray-500'}`}>
                    {description}
                </p>
            )}
        </div>

        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-gray-700'
        }`}>
            {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
        </div>
    </button>
)

const MultiSelectTag: React.FC<{
    onClick: () => void;
    isSelected: boolean;
    label: string;
}> = ({ onClick, isSelected, label }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all duration-200 border ${
            isSelected
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
        {label}
    </button>
)

// --- Main Quiz Component ---

export const WorkoutQuiz: React.FC<WorkoutQuizProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WorkoutQuizAnswers>({
    location: 'Academia',
    daysPerWeek: 4,
    duration: 60,
    goal: 'emagrecer',
    intensity: 'moderado',
    level: 'Iniciante',
    bodyType: 'mesomorfo',
    priorityMuscles: [],
    equipment: true,
    splitPreference: 'abc',
    injuries: []
  });

  const updateAnswer = (key: keyof WorkoutQuizAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    // Auto advance for single select
    setTimeout(nextStep, 200); 
  };
  
  const handleMultiSelect = (key: 'priorityMuscles' | 'injuries', value: string) => {
      const currentSelection = answers[key];
      if (currentSelection.includes(value)) {
          setAnswers(prev => ({ ...prev, [key]: currentSelection.filter(r => r !== value) }));
      } else {
          // Limit priority muscles to 4
          if (key === 'priorityMuscles' && currentSelection.length >= 4) return;
          
          // Logic for "None" vs others
          if (key === 'injuries') {
              if (value === 'Nenhuma') {
                  setAnswers(prev => ({ ...prev, injuries: ['Nenhuma'] }));
              } else {
                  const newSelection = currentSelection.filter(i => i !== 'Nenhuma');
                  setAnswers(prev => ({ ...prev, injuries: [...newSelection, value] }));
              }
          } else {
              setAnswers(prev => ({ ...prev, [key]: [...currentSelection, value] }));
          }
      }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const questions = [
    { 
        title: "Ambiente de Treino", 
        subtitle: "Onde você vai realizar seus exercícios?",
        key: 'location', 
        type: 'single',
        options: [
            {label: 'Academia', value: 'Academia', desc: 'Acesso a máquinas, pesos livres e cabos.'}, 
            {label: 'Em Casa', value: 'Casa', desc: 'Peso do corpo e equipamentos limitados.'}
        ] 
    },
    { 
        title: "Frequência Semanal", 
        subtitle: "Quantos dias você pode se comprometer?",
        key: 'daysPerWeek', 
        type: 'single',
        options: [
            {label: '2 Dias / Semana', value: 2, desc: 'Manutenção ou iniciante absoluto.'}, 
            {label: '3 Dias / Semana', value: 3, desc: 'Frequência mínima ideal.'}, 
            {label: '4 Dias / Semana', value: 4, desc: 'Ótimo equilíbrio para resultados.'}, 
            {label: '5 Dias / Semana', value: 5, desc: 'Comprometido e consistente.'}, 
            {label: '6 Dias / Semana', value: 6, desc: 'Foco total em performance.'}
        ] 
    },
    { 
        title: "Duração da Sessão", 
        subtitle: "Quanto tempo você tem disponível por dia?",
        key: 'duration', 
        type: 'single',
        options: [
            {label: '30 Minutos', value: 30, desc: 'Treino expresso e metabólico.'}, 
            {label: '45 Minutos', value: 45, desc: 'Tempo padrão para um bom treino.'}, 
            {label: '60 Minutos', value: 60, desc: 'Treino completo com descansos adequados.'}, 
            {label: '90 Minutos', value: 90, desc: 'Volume alto de treino.'}
        ] 
    },
    { 
        title: "Objetivo Principal", 
        subtitle: "Isso definirá o volume e intensidade.",
        key: 'goal', 
        type: 'single',
        options: [
            {label: 'Perda de Gordura', value: 'emagrecer', desc: 'Foco em gasto calórico e definição.'}, 
            {label: 'Hipertrofia', value: 'ganhar massa', desc: 'Foco em volume muscular e força.'}, 
            {label: 'Condicionamento', value: 'manter', desc: 'Saúde cardiovascular e manutenção.'}
        ] 
    },
    { 
        title: "Seu Biotipo Corporal", 
        subtitle: "Ajuda a ajustar a intensidade e repetições.",
        key: 'bodyType', 
        type: 'single',
        options: [
            {label: 'Ectomorfo', value: 'ectomorfo', desc: 'Magro, dificuldade em ganhar peso.'}, 
            {label: 'Mesomorfo', value: 'mesomorfo', desc: 'Atlético, ganha músculos com facilidade.'}, 
            {label: 'Endomorfo', value: 'endomorfo', desc: 'Estrutura larga, facilidade em ganhar gordura.'}
        ] 
    },
    { 
        title: "Estrutura do Treino", 
        subtitle: "Como você prefere dividir os grupos musculares?",
        key: 'splitPreference', 
        type: 'single',
        options: [
            {label: 'ABC (Clássico)', value: 'abc', desc: '3 treinos diferentes rotacionados. Ideal para 3 a 6 dias.'},
            {label: 'ABCD (4 Divisões)', value: 'abcd', desc: 'Foco maior em grupos específicos. Ideal para 4 dias.'},
            {label: 'ABCDE (1 Músculo/dia)', value: 'abcde', desc: 'Isolamento máximo. Ideal para 5 dias consecutivos.'},
            {label: 'Full Body', value: 'fullbody', desc: 'Corpo todo em todas as sessões. Alta frequência.'},
            {label: 'Recomendação da IA', value: 'no_preference', desc: 'Deixe o sistema decidir a melhor estratégia.'}
        ] 
    },
    { 
        title: "Nível de Experiência", 
        subtitle: "Para ajustar a complexidade dos movimentos.",
        key: 'level', 
        type: 'single',
        options: [
            {label: 'Iniciante', value: 'Iniciante', desc: 'Aprendendo os movimentos básicos.'}, 
            {label: 'Intermediário', value: 'Intermediário', desc: 'Treino há pelo menos 6 meses.'}, 
            {label: 'Avançado', value: 'Avançado', desc: 'Domínio total da técnica e alta intensidade.'}
        ] 
    },
    { 
        title: "Foco Muscular", 
        subtitle: "Selecione até 3 áreas para priorizar.",
        key: 'priorityMuscles', 
        type: 'multiselect', 
        options: [
            {label: 'Pernas', value: 'Pernas'}, 
            {label: 'Glúteos', value: 'Glúteos'}, 
            {label: 'Braços', value: 'Braços'}, 
            {label: 'Dorsais', value: 'Costas'}, 
            {label: 'Peitoral', value: 'Peito'}, 
            {label: 'Abdômen', value: 'Abdômen'},
            {label: 'Ombros', value: 'Ombros'}
        ] 
    },
    { 
        title: "Lesões ou Limitações", 
        subtitle: "Evitaremos exercícios que sobrecarreguem estas áreas.",
        key: 'injuries', 
        type: 'multiselect', 
        options: [
            {label: 'Joelhos', value: 'Joelhos'}, 
            {label: 'Lombar', value: 'Lombar'}, 
            {label: 'Ombros', value: 'Ombros'}, 
            {label: 'Punhos', value: 'Punhos'}, 
            {label: 'Sem Lesões', value: 'Nenhuma'}
        ] 
    },
  ];
  
  // Add equipment question only if Location is Home
  if (answers.location === 'Casa') {
      const equipmentQ = { 
        title: "Equipamentos Disponíveis", 
        subtitle: "O que você tem à disposição?",
        key: 'equipment', 
        type: 'single',
        options: [
            {label: 'Tenho Equipamentos', value: true, desc: 'Halteres, elásticos, banco, barra...'}, 
            {label: 'Apenas Peso do Corpo', value: false, desc: 'Calistenia e exercícios funcionais.'}
        ] 
      };
      
      const locIndex = questions.findIndex(q => q.key === 'location');
      if (locIndex !== -1 && !questions.find(q => q.key === 'equipment')) {
          questions.splice(locIndex + 1, 0, equipmentQ as any);
      }
  }

  const currentQuestion = questions[step];
  const isMultiSelect = currentQuestion.type === 'multiselect';
  
  const canContinue = isMultiSelect 
    ? (answers[currentQuestion.key as keyof WorkoutQuizAnswers] as string[]).length > 0 
    : true;

  return (
    <Portal>
        <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col animate-fade-in">
            
            <QuizHeader 
                onBack={prevStep} 
                onClose={onClose} 
                step={step} 
                totalSteps={questions.length} 
                showBack={step > 0}
            />

            <div className="flex-grow overflow-y-auto px-6 py-4">
                <div className="max-w-md mx-auto space-y-6 animate-slide-up">
                    <div className="text-left space-y-2 mb-6">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {currentQuestion.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {currentQuestion.subtitle}
                        </p>
                    </div>

                    <div className={isMultiSelect ? "flex flex-wrap gap-2" : "space-y-3"}>
                        {currentQuestion.options.map((opt: any) => {
                            const isSelected = isMultiSelect 
                                ? (answers[currentQuestion.key as keyof WorkoutQuizAnswers] as any[]).includes(opt.value)
                                : (answers[currentQuestion.key as keyof WorkoutQuizAnswers] === opt.value);
                            
                            if (isMultiSelect) {
                                return (
                                    <MultiSelectTag 
                                        key={String(opt.value)}
                                        label={opt.label}
                                        isSelected={isSelected}
                                        onClick={() => handleMultiSelect(currentQuestion.key as any, opt.value)}
                                    />
                                )
                            }

                            return (
                                <QuizOptionCard 
                                    key={String(opt.value)}
                                    label={opt.label}
                                    description={opt.desc}
                                    isSelected={isSelected}
                                    onClick={() => updateAnswer(currentQuestion.key as keyof WorkoutQuizAnswers, opt.value)}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Sticky Footer for Multiselect or Final Step */}
            {(isMultiSelect || step === questions.length - 1) && (
                <div className="p-6 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-30">
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={step === questions.length - 1 ? () => onComplete(answers) : nextStep}
                            disabled={!canContinue}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl text-lg font-bold shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                        >
                            {step === questions.length - 1 ? 'Criar Meu Plano' : 'Continuar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    </Portal>
  );
};
