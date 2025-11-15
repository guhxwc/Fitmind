import React, { useState } from 'react';

interface WorkoutQuizAnswers {
  location: 'Casa' | 'Academia';
  daysPerWeek: number;
  duration: number;
  goal: 'emagrecer' | 'ganhar massa' | 'manter';
  intensity: 'lento' | 'moderado' | 'agressivo';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  bodyType: 'ectomorfo' | 'mesomorfo' | 'endomorfo';
  priorityMuscles: string[];
  equipment: boolean;
}

interface WorkoutQuizProps {
  onComplete: (answers: WorkoutQuizAnswers) => void;
  onClose: () => void;
}

const QuizHeader: React.FC<{onClose: () => void, step: number, totalSteps: number}> = ({ onClose, step, totalSteps }) => {
    const progress = ((step + 1) / totalSteps) * 100;
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

const QuizOption: React.FC<{onClick: () => void, isSelected: boolean, children: React.ReactNode}> = ({ onClick, isSelected, children }) => (
     <button
        onClick={onClick}
        className={`w-full text-left p-4 my-2 rounded-xl border-2 transition-all duration-200 ${
            isSelected 
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                : 'bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
        <span className="text-lg font-medium text-gray-900 dark:text-gray-200">{children}</span>
    </button>
)

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
  });

  const updateAnswer = (key: keyof WorkoutQuizAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };
  
  const handleMultiSelect = (value: string) => {
      const currentSelection = answers.priorityMuscles;
      if (currentSelection.includes(value)) {
          updateAnswer('priorityMuscles', currentSelection.filter(r => r !== value));
      } else {
          if(currentSelection.length < 4) {
            updateAnswer('priorityMuscles', [...currentSelection, value]);
          }
      }
  }

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const questions = [
    { title: "Onde você prefere treinar?", key: 'location', options: [{label: 'Academia', value: 'Academia'}, {label: 'Em Casa', value: 'Casa'}] },
    { title: "Quantos dias por semana?", key: 'daysPerWeek', options: [{label: '2 dias', value: 2}, {label: '3 dias', value: 3}, {label: '4 dias', value: 4}, {label: '5 dias', value: 5}] },
    { title: "Quanto tempo por dia?", key: 'duration', options: [{label: '30 min', value: 30}, {label: '45 min', value: 45}, {label: '60 min', value: 60}, {label: '90 min', value: 90}] },
    { title: "Qual seu objetivo principal?", key: 'goal', options: [{label: 'Emagrecer', value: 'emagrecer'}, {label: 'Ganhar Massa', value: 'ganhar massa'}, {label: 'Manter', value: 'manter'}] },
    { title: "Qual ritmo de progresso?", key: 'intensity', options: [{label: 'Lento e sustentável', value: 'lento'}, {label: 'Moderado e focado', value: 'moderado'}, {label: 'Agressivo e rápido', value: 'agressivo'}] },
    { title: "Qual seu nível atual?", key: 'level', options: [{label: 'Iniciante', value: 'Iniciante'}, {label: 'Intermediário', value: 'Intermediário'}, {label: 'Avançado', value: 'Avançado'}] },
    { title: "Qual seu tipo de corpo?", key: 'bodyType', options: [{label: 'Ectomorfo (magro, dificuldade em ganhar peso)', value: 'ectomorfo'}, {label: 'Mesomorfo (atlético, ganha músculo fácil)', value: 'mesomorfo'}, {label: 'Endomorfo (maior % de gordura, ganha peso fácil)', value: 'endomorfo'}] },
    { title: "Grupos musculares para priorizar?", subtitle: "Selecione até 4.", key: 'priorityMuscles', type: 'multiselect', options: [{label: 'Pernas', value: 'Pernas'}, {label: 'Glúteos', value: 'Glúteos'}, {label: 'Braços', value: 'Braços'}, {label: 'Costas', value: 'Costas'}, {label: 'Peito', value: 'Peito'}, {label: 'Abdômen', value: 'Abdômen'}] },
    { title: "Você tem equipamentos em casa?", key: 'equipment', options: [{label: 'Sim (halteres, elásticos, etc.)', value: true}, {label: 'Não, apenas peso corporal', value: false}] },
  ];
  
  const filteredQuestions = answers.location === 'Academia' ? questions.filter(q => q.key !== 'equipment') : questions;
  const currentQuestion = filteredQuestions[step];

  const canContinue = currentQuestion.type === 'multiselect' ? answers.priorityMuscles.length > 0 : true;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white dark:bg-black w-full max-w-md h-[90%] rounded-t-3xl p-6 flex flex-col">
        <QuizHeader onClose={onClose} step={step} totalSteps={filteredQuestions.length} />
        <div className="flex-grow overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentQuestion.title}</h2>
            {currentQuestion.subtitle && <p className="text-gray-500 dark:text-gray-400 mt-2">{currentQuestion.subtitle}</p>}
            <div className="mt-8">
                {currentQuestion.type === 'multiselect' ? (
                     currentQuestion.options.map(opt => (
                        <QuizOption key={opt.value} onClick={() => handleMultiSelect(opt.value)} isSelected={answers.priorityMuscles.includes(opt.value)}>
                            {opt.label}
                        </QuizOption>
                    ))
                ) : (
                    currentQuestion.options.map(opt => (
                        <QuizOption key={String(opt.value)} onClick={() => updateAnswer(currentQuestion.key as keyof WorkoutQuizAnswers, opt.value)} isSelected={(answers as any)[currentQuestion.key] === opt.value}>
                            {opt.label}
                        </QuizOption>
                    ))
                )}
            </div>
        </div>

        <div className="mt-auto pt-6 flex gap-4">
             {step > 0 && <button onClick={prevStep} className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 rounded-xl text-lg font-semibold">Voltar</button>}
            <button
                onClick={step === filteredQuestions.length - 1 ? () => onComplete(answers) : nextStep}
                disabled={!canContinue}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
                {step === filteredQuestions.length - 1 ? 'Gerar Treino' : 'Continuar'}
            </button>
        </div>
      </div>
    </div>
  );
};