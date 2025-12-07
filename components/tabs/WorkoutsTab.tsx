
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { GoogleGenAI, Type } from "@google/genai";
import type { WorkoutQuizAnswers, WorkoutPlan, WorkoutFeedback } from '../../types';
import { DumbbellIcon } from '../core/Icons';
import { WorkoutQuiz } from './WorkoutQuiz';
import { EXERCISE_DATABASE } from '../../workoutData';
import { useAppContext } from '../AppContext';
import Portal from '../core/Portal';

const WorkoutIntro: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 p-6 rounded-2xl text-center flex flex-col items-center mt-6 animate-fade-in">
        <DumbbellIcon />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">Personal Trainer IA</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1 mb-4">Receba um plano de treinos semanal, personalizado pela nossa IA para seus objetivos.</p>
        <button onClick={onGenerate} className="bg-black dark:bg-white text-white dark:text-black py-3 px-8 rounded-xl font-semibold transition-transform active:scale-[0.98]">
            Gerar meu treino
        </button>
    </div>
);

const WorkoutFeedbackModal: React.FC<{
    onClose: () => void;
    onRate: (rating: 'leve' | 'ideal' | 'pesado') => void;
}> = ({ onClose, onRate }) => {
    return (
        <Portal>
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm shadow-2xl animate-pop-in text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Treino Concluído!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Parabéns pela dedicação. Como você sentiu a intensidade hoje?</p>
                    
                    <div className="space-y-3">
                        <button onClick={() => onRate('leve')} className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-900 dark:text-white hover:text-green-700 dark:hover:text-green-400 py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-2 border-transparent hover:border-green-200 dark:hover:border-green-900">
                            <span className="text-2xl">😌</span> Muito Fácil
                        </button>
                        <button onClick={() => onRate('ideal')} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                            <span className="text-2xl">💪</span> Na Medida
                        </button>
                        <button onClick={() => onRate('pesado')} className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-900 dark:text-white hover:text-red-700 dark:hover:text-red-400 py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-2 border-transparent hover:border-red-200 dark:hover:border-red-900">
                            <span className="text-2xl">🥵</span> Muito Difícil
                        </button>
                    </div>
                    
                    <button onClick={onClose} className="mt-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors">Cancelar</button>
                </div>
            </div>
        </Portal>
    );
}

const DailyWorkoutView: React.FC<{
    dayWorkout: NonNullable<WorkoutPlan>[0];
    onComplete: (feedback: WorkoutFeedback['rating']) => void;
    onBack: () => void;
}> = ({ dayWorkout, onComplete, onBack }) => {
    const [completedExercises, setCompletedExercises] = useState<number[]>([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const toggleExercise = (exerciseId: number) => {
        setCompletedExercises(prev => {
            const isCompleted = prev.includes(exerciseId);
            const newCompleted = isCompleted ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId];
            
            // Auto-trigger feedback if all exercises are newly completed
            if (!isCompleted && newCompleted.length === dayWorkout.exercises.length) {
                setTimeout(() => setShowFeedbackModal(true), 500);
            }
            
            return newCompleted;
        });
    };

    const allCompleted = completedExercises.length === dayWorkout.exercises.length;

    return (
        <div className="space-y-4 mt-6 animate-fade-in pb-8">
            <div className="flex items-center gap-4">
                 <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Treino do Dia: {dayWorkout.focus}</h2>
                    <p className="text-gray-500 dark:text-gray-400">Tempo estimado: {dayWorkout.estimatedTime} min</p>
                </div>
            </div>

            <div className="space-y-3">
                {dayWorkout.exercises.map((ex, index) => (
                    <div key={index} className={`p-4 rounded-xl transition-all duration-300 border ${completedExercises.includes(ex.exerciseId) ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800/50 border-transparent'}`}>
                        <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleExercise(ex.exerciseId)}>
                             <div>
                                <h3 className={`font-bold text-lg ${completedExercises.includes(ex.exerciseId) ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>{ex.name}</h3>
                                <p className={`text-sm font-medium ${completedExercises.includes(ex.exerciseId) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {ex.sets} séries · {ex.reps} reps · {ex.rest}s descanso
                                </p>
                            </div>
                            <button className={`w-8 h-8 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${completedExercises.includes(ex.exerciseId) ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                {completedExercises.includes(ex.exerciseId) && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <button 
                    onClick={() => setShowFeedbackModal(true)}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${
                        allCompleted 
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    {allCompleted ? 'Concluir Treino' : 'Encerrar por hoje'}
                </button>
            </div>

            {showFeedbackModal && (
                <WorkoutFeedbackModal 
                    onClose={() => setShowFeedbackModal(false)} 
                    onRate={onComplete} 
                />
            )}
        </div>
    );
};

const WorkoutPlanView: React.FC<{ 
    plan: WorkoutPlan; 
    onStartWorkout: (dayIndex: number) => void;
}> = ({ plan, onStartWorkout }) => (
    <div className="space-y-4 mt-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seu Plano Semanal</h2>
        {plan.map((day, index) => (
            <div key={index} onClick={() => onStartWorkout(index)} className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all active:scale-[0.99] border border-transparent dark:border-gray-800">
                <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">DIA {day.day}</p>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{day.focus}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{day.estimatedTime} min</span>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        ))}
    </div>
);

const WorkoutHistoryView: React.FC<{ history: WorkoutFeedback[], plan: WorkoutPlan | null }> = ({ history, plan }) => {
    if (history.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/30 rounded-2xl mt-6 animate-fade-in border border-gray-200 dark:border-gray-800">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Sem histórico de treinos</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conclua um treino para vê-lo aqui.</p>
            </div>
        )
    }
    
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const ratingStyles = {
        leve: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        ideal: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        pesado: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    };
    
    return (
        <div className="space-y-3 mt-6 animate-fade-in">
            {sortedHistory.map((item, index) => {
                const dayData = plan ? plan[item.workoutDayIndex] : null;
                return (
                    <div key={index} className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-800">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{dayData ? dayData.focus : `Treino do Dia ${item.workoutDayIndex + 1}`}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${ratingStyles[item.rating]}`}>
                            {item.rating}
                        </span>
                    </div>
                );
            })}
        </div>
    )
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-1/3 py-2.5 rounded-lg font-semibold transition-all duration-300 active:scale-[0.98] ${isActive ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}>
        {label}
    </button>
);

export const WorkoutsTab: React.FC = () => {
    const { userData, workoutPlan, setWorkoutPlan, workoutHistory, setWorkoutHistory, updateStreak } = useAppContext();
    const [view, setView] = useState<'generate' | 'my_workouts' | 'history'>(workoutPlan ? 'my_workouts' : 'generate');
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeWorkoutDay, setActiveWorkoutDay] = useState<number | null>(null);

    if (!userData) return null;

    const generateWorkoutPlan = async (answers: WorkoutQuizAnswers) => {
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const model = 'gemini-2.5-pro';

            const schema = {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  focus: { type: Type.STRING },
                  estimatedTime: { type: Type.NUMBER },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        exerciseId: { type: Type.NUMBER },
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        rest: { type: Type.STRING },
                      },
                      required: ['exerciseId', 'name', 'sets', 'reps', 'rest'],
                    },
                  },
                },
                required: ['day', 'focus', 'estimatedTime', 'exercises'],
              },
            };
            
            const exerciseList = JSON.stringify(EXERCISE_DATABASE, null, 2);
            const userHistory = JSON.stringify(workoutHistory.slice(0, 5), null, 2);

            const prompt = `
                Você é um personal trainer especialista em criar treinos para usuários de medicamentos GLP-1.
                Crie um plano de treino semanal completo.

                **BANCO DE DADOS DE EXERCÍCIOS DISPONÍVEIS (USE APENAS EXERCÍCIOS DESTA LISTA):**
                ${exerciseList}

                **DADOS DO USUÁRIO:**
                - Idade: ${userData.age}
                - Sexo: ${userData.gender}
                - Nível de Atividade Geral: ${userData.activityLevel}
                - Peso: ${userData.weight}kg
                - Altura: ${userData.height}cm

                **RESPOSTAS DO QUIZ (PREFERÊNCIAS):**
                - Local de Treino: ${answers.location}
                - Dias por semana: ${answers.daysPerWeek}
                - Tempo por dia: ${answers.duration} minutos
                - Objetivo: ${answers.goal}
                - Intensidade desejada: ${answers.intensity}
                - Nível de experiência: ${answers.level}
                - Tipo de corpo: ${answers.bodyType}
                - Músculos prioritários: ${answers.priorityMuscles.join(', ')}
                - Possui equipamento em casa: ${answers.equipment ? 'Sim' : 'Não'}
                
                **HISTÓRICO DE FEEDBACK RECENTE:**
                ${userHistory}

                **INSTRUÇÕES IMPORTANTES:**
                1.  **SELECIONE EXERCÍCIOS EXCLUSIVAMENTE DO BANCO DE DADOS FORNECIDO.** O \`exerciseId\` no resultado DEVE corresponder ao \`id\` do exercício no banco de dados.
                2.  Filtre os exercícios com base no local de treino ('setting': '${answers.location}'). Se for 'Casa' e 'equipment' for false, use apenas exercícios de 'Corpo'.
                3.  O plano deve ter exatamente ${answers.daysPerWeek} dias de treino.
                4.  Distribua os dias de treino e descanso (ex: ABC, ABCD, ABCDE, etc.).
                5.  Defina o foco de cada dia (ex: 'Peito e Tríceps', 'Pernas e Glúteos', 'Corpo Inteiro').
                6.  Para cada exercício, defina \`sets\`, \`reps\`, e \`rest\` (em segundos). Adapte-os ao objetivo e nível do usuário. (ex: para 'ganhar massa', menos reps e mais carga/sets; para 'emagrecer', mais reps e menos descanso).
                7.  Ajuste a intensidade baseado no feedback. Se o feedback foi 'pesado', considere diminuir o volume. Se foi 'leve', aumente.
                8.  O tempo total estimado para cada treino (\`estimatedTime\`) deve ser próximo de ${answers.duration} minutos.
                9.  Priorize os grupos musculares que o usuário escolheu.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                },
            });

            const newPlan = JSON.parse(response.text) as WorkoutPlan;

            const { error: dbError } = await supabase.from('workout_plans').insert({
                user_id: userData.id,
                plan: newPlan
            });

            if (dbError) throw dbError;

            setWorkoutPlan(newPlan);
            setView('my_workouts');
        } catch (e) {
            console.error(e);
            setError('Não foi possível gerar o treino. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuizComplete = (answers: WorkoutQuizAnswers) => {
        setIsQuizOpen(false);
        generateWorkoutPlan(answers);
    };
    
    const handleFeedback = async (rating: WorkoutFeedback['rating']) => {
        if (activeWorkoutDay === null) return;
        
        const newFeedback = {
            user_id: userData.id,
            date: new Date().toISOString(),
            workoutDayIndex: activeWorkoutDay,
            rating,
        };
        
        const { data, error } = await supabase.from('workout_history').insert(newFeedback).select();
        
        if (data) {
            setWorkoutHistory(prev => [data[0], ...prev]);
            setActiveWorkoutDay(null); // Return to plan view
            updateStreak();
        }
        if (error) console.error("Error saving feedback:", error);
    };

    const handleGenerateClick = () => {
        setIsQuizOpen(true);
    };
    
    const renderMainContent = () => {
        if (isLoading) {
             return (
                 <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mt-6">
                    <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-300">Gerando seu treino personalizado...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aguarde, nosso personal trainer IA está trabalhando.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl mt-6">
                    <p className="font-semibold text-red-700 dark:text-red-400">{error}</p>
                    <button onClick={() => { setError(null); handleGenerateClick() }} className="mt-4 bg-black dark:bg-white text-white dark:text-black py-2 px-6 rounded-lg font-semibold">
                        Tentar Novamente
                    </button>
                </div>
            );
        }
        
        if (activeWorkoutDay !== null && workoutPlan) {
            const dayWorkout = workoutPlan[activeWorkoutDay];
            return <DailyWorkoutView dayWorkout={dayWorkout} onComplete={handleFeedback} onBack={() => setActiveWorkoutDay(null)} />;
        }
        
        switch (view) {
            case 'generate':
                return <WorkoutIntro onGenerate={handleGenerateClick} />;
            case 'my_workouts':
                if (workoutPlan) {
                    return <WorkoutPlanView plan={workoutPlan} onStartWorkout={setActiveWorkoutDay} />;
                }
                return (
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mt-6">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Nenhum plano de treino ativo.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gere um novo plano para começar.</p>
                        <button onClick={() => setView('generate')} className="mt-4 bg-black dark:bg-white text-white dark:text-black py-2 px-6 rounded-lg font-semibold">Gerar Treino</button>
                    </div>
                );
            case 'history':
                return <WorkoutHistoryView history={workoutHistory} plan={workoutPlan} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen animate-fade-in bg-white dark:bg-black">
            <header>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Treinos</h1>
                <p className="text-gray-500 dark:text-gray-400">Seu plano de exercícios</p>
            </header>
            
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <TabButton label="Gerar Treino" isActive={view === 'generate'} onClick={() => setView('generate')} />
                <TabButton label="Meus Treinos" isActive={view === 'my_workouts'} onClick={() => setView('my_workouts')} />
                <TabButton label="Histórico" isActive={view === 'history'} onClick={() => setView('history')} />
            </div>

            {renderMainContent()}

            {isQuizOpen && <WorkoutQuiz onComplete={handleQuizComplete} onClose={() => setIsQuizOpen(false)} />}
        </div>
    );
};
