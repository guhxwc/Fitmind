import React, { useState } from 'react';
import type { UserData, DietQuizAnswers } from '../../types';
import { useAppContext } from '../AppContext';

interface DietQuizProps {
  onComplete: (answers: DietQuizAnswers) => void;
  onClose: () => void;
}

const QuizHeader: React.FC<{onClose: () => void, step: number, totalSteps: number}> = ({ onClose, step, totalSteps }) => {
    const progress = ((step + 1) / totalSteps) * 100;
    return (
        <div className="flex items-center gap-4 mb-4">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-black h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
}

const QuizOption: React.FC<{onClick: () => void, isSelected: boolean, children: React.ReactNode}> = ({ onClick, isSelected, children }) => (
     <button
        onClick={onClick}
        className={`w-full text-left p-4 my-2 rounded-xl border-2 transition-all duration-200 ${
            isSelected ? 'bg-black text-white border-black' : 'bg-gray-100 border-gray-100 hover:border-gray-300'
        }`}
    >
        <span className="text-lg font-medium">{children}</span>
    </button>
)

export const DietQuiz: React.FC<DietQuizProps> = ({ onComplete, onClose }) => {
  const { userData } = useAppContext();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<DietQuizAnswers>({
    appetite: 'médio',
    mealsPerDay: 4,
    skipBreakfast: false,
    nightHunger: false,
    restrictions: [],
    pace: 'normal',
    trains: userData?.activityLevel !== 'Sedentário',
  });

  const updateAnswer = (key: keyof DietQuizAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const handleFinish = () => {
      onComplete(answers);
  }

  const questions = [
    {
      title: "Como você descreveria seu apetite?",
      key: 'appetite',
      options: [
          { label: 'Pouco', value: 'pouco' },
          { label: 'Médio', value: 'médio' },
          { label: 'Muito', value: 'muito' }
      ],
    },
    {
      title: "Quantas refeições você prefere fazer por dia?",
      key: 'mealsPerDay',
      options: [
          { label: '3 Refeições', value: 3 },
          { label: '4 Refeições', value: 4 },
          { label: '5 Refeições', value: 5 }
      ],
    },
    {
      title: "Você costuma pular o café da manhã?",
      key: 'skipBreakfast',
      options: [
          { label: 'Sim', value: true },
          { label: 'Não', value: false }
      ],
    },
    {
      title: "Sente mais fome à noite?",
      key: 'nightHunger',
      options: [
          { label: 'Sim', value: true },
          { label: 'Não', value: false }
      ],
    },
    {
        title: "Qual ritmo de emagrecimento você prefere?",
        key: 'pace',
        options: [
            { label: 'Mais devagar e sustentável', value: 'devagar' },
            { label: 'Normal, focado no resultado', value: 'normal' },
            { label: 'Mais rápido e intenso', value: 'rápido' }
        ],
    },
     {
        title: "Você pratica treinos de força ou cardio?",
        key: 'trains',
        options: [
            { label: 'Sim, regularmente', value: true },
            { label: 'Não, sou mais sedentário(a)', value: false }
        ],
    },
     {
        title: "Alguma restrição alimentar?",
        subtitle: "Selecione uma ou mais opções.",
        key: 'restrictions',
        type: 'multiselect',
        options: [
            { label: 'Vegetariano', value: 'vegetariano' },
            { label: 'Não como peixe', value: 'não como peixe' },
            { label: 'Evito lactose', value: 'sem lactose' },
            { label: 'Evito glúten', value: 'sem glúten' },
        ],
    },
  ];

  const currentQuestion = questions[step];
  
  const handleMultiSelect = (value: string) => {
      const currentRestrictions = answers.restrictions;
      if (currentRestrictions.includes(value)) {
          updateAnswer('restrictions', currentRestrictions.filter(r => r !== value));
      } else {
          updateAnswer('restrictions', [...currentRestrictions, value]);
      }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md h-[90%] rounded-t-3xl p-6 flex flex-col">
        <QuizHeader onClose={onClose} step={step} totalSteps={questions.length} />
        <div className="flex-grow overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900">{currentQuestion.title}</h2>
            {currentQuestion.subtitle && <p className="text-gray-500 mt-2">{currentQuestion.subtitle}</p>}
            <div className="mt-8">
                {currentQuestion.type === 'multiselect' ? (
                     currentQuestion.options.map(opt => (
                        <QuizOption key={opt.value} onClick={() => handleMultiSelect(opt.value)} isSelected={answers.restrictions.includes(opt.value)}>
                            {opt.label}
                        </QuizOption>
                    ))
                ) : (
                    currentQuestion.options.map(opt => (
                        <QuizOption key={opt.value.toString()} onClick={() => updateAnswer(currentQuestion.key as keyof DietQuizAnswers, opt.value)} isSelected={(answers as any)[currentQuestion.key] === opt.value}>
                            {opt.label}
                        </QuizOption>
                    ))
                )}
            </div>
        </div>

        <div className="mt-auto pt-6 flex gap-4">
             {step > 0 && <button onClick={prevStep} className="w-1/3 bg-gray-200 text-gray-800 py-4 rounded-xl text-lg font-semibold">Voltar</button>}
            <button
                onClick={step === questions.length - 1 ? handleFinish : nextStep}
                className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold"
            >
                {step === questions.length - 1 ? 'Gerar Dieta' : 'Continuar'}
            </button>
        </div>
      </div>
    </div>
  );
};