
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
// Removed GoogleGenAI import
import type { WorkoutQuizAnswers, WorkoutPlan, WorkoutFeedback, Exercise, WorkoutDay, Weekday } from '../../types';
import { DumbbellIcon, FlameIcon, ClockIcon, ChevronRightIcon, CheckCircleIcon, ArrowPathIcon, CalendarIcon, PlusIcon, MinusIcon, LockIcon, EditIcon, TrashIcon, SparklesIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import { WorkoutQuiz } from './WorkoutQuiz';
import { workoutService } from '../../services/workoutService';
import { useAppContext } from '../AppContext';
import Portal from '../core/Portal';
import { SubscriptionPage } from '../SubscriptionPage';
import { ProFeatureModal } from '../ProFeatureModal';
import { useToast } from '../ToastProvider';

// --- Helper Icons ---
const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
    </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Sub-components (RestTimer, SetRow, ActiveSessionView, etc...) ---
// (Mantendo os componentes de UI existentes sem alteração visual, apenas lógica)

// 1. Rest Timer Component
const RestTimer: React.FC<{ duration: number; onFinish: () => void; onCancel: () => void }> = ({ duration, onFinish, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        if (timeLeft <= 0) {
            onFinish();
            return;
        }
        const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isPaused, onFinish]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    return (
        <div className="fixed bottom-36 right-5 z-[60] animate-slide-up">
            <div className="bg-black/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-black rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/10 w-full max-w-[220px]">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="opacity-20" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={(2 * Math.PI * 20) * (1 - progress/100)} className="text-orange-500 transition-all duration-1000 ease-linear" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xs font-bold font-mono">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-1 truncate">Descanso</p>
                    <div className="flex gap-2">
                        <button onClick={() => setTimeLeft(t => t + 10)} className="bg-white/20 dark:bg-black/10 rounded-md px-2 py-1 hover:bg-white/30 text-[10px] font-bold">+10s</button>
                        <button onClick={onCancel} className="bg-red-500/80 rounded-md px-2 py-1 hover:bg-red-600 text-[10px] font-bold">Pular</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Set Row Component
const SetRow: React.FC<{ 
    index: number; 
    setNumber: number; 
    prevWeight?: string; 
    targetReps: string; 
    isCompleted: boolean; 
    onToggle: (weight: string, reps: string) => void;
}> = ({ index, setNumber, prevWeight, targetReps, isCompleted, onToggle }) => {
    const [weight, setWeight] = useState(prevWeight || '');
    const [reps, setReps] = useState(targetReps);

    const handleCheck = () => {
        onToggle(weight, reps);
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-xl mb-2 transition-all ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 opacity-60' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
            <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-xs font-bold text-gray-400 shadow-sm">
                {setNumber}
            </div>
            
            <div className="flex gap-3 items-center">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">KG</span>
                    <input 
                        type="number" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="-"
                        className="w-16 h-9 bg-white dark:bg-gray-700 rounded-lg text-center font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">REPS</span>
                    <input 
                        type="number" 
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-14 h-9 bg-white dark:bg-gray-700 rounded-lg text-center font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                </div>
            </div>

            <button 
                onClick={handleCheck}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
            >
                <CheckCircleIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

// 3. Active Session View
const ActiveSessionView: React.FC<{
    dayWorkout: any;
    dayIndex: number;
    lastSessionDetails?: any;
    onComplete: (rating: 'leve' | 'ideal' | 'pesado', details: any) => Promise<void>;
    onBack: () => void;
}> = ({ dayWorkout, dayIndex, lastSessionDetails, onComplete, onBack }) => {
    // --- State ---
    const [editableWorkout, setEditableWorkout] = useState(JSON.parse(JSON.stringify(dayWorkout))); // Deep copy for editing
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
    const [sessionData, setSessionData] = useState<Record<string, { weight: string, reps: string }[]>>({});
    const [activeTimer, setActiveTimer] = useState<number | null>(null);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    
    // --- Effects ---
    useEffect(() => {
        const storageKey = `workout_progress_${dayIndex}`;
        const savedProgress = localStorage.getItem(storageKey);
        
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                // Verify if the saved progress belongs to the current workout plan
                if (!parsed.editableWorkout || parsed.editableWorkout.focus === dayWorkout.focus) {
                    setCompletedSets(parsed.completedSets || {});
                    setSessionData(parsed.sessionData || {});
                    if (parsed.editableWorkout) {
                        setEditableWorkout(parsed.editableWorkout);
                    }
                    return; // Use saved progress
                }
            } catch (e) {
                console.error("Error parsing saved progress", e);
            }
        }

        const initialSets: Record<string, boolean[]> = {};
        const initialData: Record<string, { weight: string, reps: string }[] | any> = {};

        editableWorkout.exercises.forEach((ex: any, idx: number) => {
            const numSets = parseInt(ex.sets) || 3;
            initialSets[idx] = new Array(numSets).fill(false);
            
            // Try to pre-fill from last session if available
            const lastExData = lastSessionDetails?.[idx] || [];
            initialData[idx] = new Array(numSets).fill(null).map((_, sIdx) => ({
                weight: lastExData[sIdx]?.weight || '',
                reps: lastExData[sIdx]?.reps || ex.reps.toString().split(/[-– ]/)[0].replace(/\D/g, '')
            }));
        });
        setCompletedSets(initialSets);
        setSessionData(initialData);
    }, [dayIndex, dayWorkout, lastSessionDetails]); // Run on mount or when day changes

    // Timer effect
    useEffect(() => {
        const storageKey = `workout_start_time_${dayIndex}`;
        const savedStartTime = localStorage.getItem(storageKey);
        let startTime = Date.now();
        if (savedStartTime) {
            startTime = parseInt(savedStartTime, 10);
            setSessionStartTime(startTime);
        } else {
            localStorage.setItem(storageKey, startTime.toString());
        }

        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        
        return () => clearInterval(interval);
    }, [dayIndex]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Save to local storage whenever progress changes
    useEffect(() => {
        if (Object.keys(completedSets).length > 0) {
            const storageKey = `workout_progress_${dayIndex}`;
            localStorage.setItem(storageKey, JSON.stringify({ completedSets, sessionData, editableWorkout }));
        }
    }, [completedSets, sessionData, editableWorkout, dayIndex]);

    // --- Actions ---
    const handleSetToggle = (exerciseIndex: number, setIndex: number, weight: string, reps: string, restTime: number) => {
        const currentExerciseSets = [...(completedSets[exerciseIndex] || [])];
        const wasCompleted = currentExerciseSets[setIndex];
        
        currentExerciseSets[setIndex] = !wasCompleted;
        
        setCompletedSets(prev => ({
            ...prev,
            [exerciseIndex]: currentExerciseSets
        }));

        // Update session data
        const currentExData = [...(sessionData[exerciseIndex] || [])];
        currentExData[setIndex] = { weight, reps };
        setSessionData(prev => ({
            ...prev,
            [exerciseIndex]: currentExData
        }));

        // Start timer if checking off (not unchecking) and not the last set
        if (!wasCompleted && setIndex < currentExerciseSets.length - 1) {
            setActiveTimer(restTime || 60);
        } else if (!wasCompleted && setIndex === currentExerciseSets.length - 1) {
            // It's the last set and we are checking it off
            // Scroll to next exercise
            setTimeout(() => {
                const nextEl = document.getElementById(`exercise-container-${exerciseIndex + 1}`);
                if (nextEl) {
                    const headerOffset = 140; // Approximate height of the sticky header
                    const elementPosition = nextEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 400);
            setActiveTimer(null);
        } else {
            setActiveTimer(null); // Cancel timer if unchecked or last set
        }
    };

    const handleUpdateExercise = (idx: number, field: string, value: string) => {
        const updated = { ...editableWorkout };
        updated.exercises[idx][field] = value;
        setEditableWorkout(updated);
        
        // If sets changed, update completion tracking array
        if (field === 'sets') {
            const numSets = parseInt(value) || 1;
            setCompletedSets(prev => ({
                ...prev,
                [idx]: new Array(numSets).fill(false)
            }));
        }
    };

    const handleRemoveExercise = (idx: number) => {
        const updated = { ...editableWorkout };
        updated.exercises.splice(idx, 1);
        setEditableWorkout(updated);
        // Reset tracking for simplicity in demo
        const newSets: Record<string, boolean[]> = {};
        updated.exercises.forEach((ex: any, i: number) => {
             const numSets = parseInt(ex.sets) || 3;
             newSets[i] = new Array(numSets).fill(false);
        });
        setCompletedSets(newSets);
    };

    const handleAddExercise = () => {
        const updated = { ...editableWorkout };
        updated.exercises.push({
            exerciseId: Date.now(), // Temporary ID
            name: "Novo Exercício",
            sets: "3",
            reps: "10",
            rest: "60",
            muscleGroups: ["Geral"]
        });
        setEditableWorkout(updated);
        // Add tracking
        const newIdx = updated.exercises.length - 1;
        setCompletedSets(prev => ({ ...prev, [newIdx]: [false, false, false] }));
    };

    // --- Stats ---
    const allSetsValues = Object.values(completedSets) as boolean[][];
    const totalSets = allSetsValues.reduce((acc: number, curr: boolean[]) => acc + curr.length, 0);
    const totalCompleted = allSetsValues.reduce((acc: number, curr: boolean[]) => acc + curr.filter(Boolean).length, 0);
    const progress = totalSets > 0 ? Math.round((totalCompleted / totalSets) * 100) : 0;

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-black z-[100] flex flex-col animate-slide-up h-[100dvh]">
            {/* Header */}
            <div className="pt-safe-top px-5 pb-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-20 sticky top-0 shadow-sm">
                <div className="flex justify-between items-center mb-3 mt-2">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    
                    <button 
                        onClick={() => setIsEditingMode(!isEditingMode)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${isEditingMode ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-100 border-transparent text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        {isEditingMode ? (
                            <>
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Concluir Edição
                            </>
                        ) : (
                            <>
                                <EditIcon className="w-3.5 h-3.5" /> Editar Treino
                            </>
                        )}
                    </button>

                    <button 
                        onClick={() => setShowFinishModal(true)} 
                        disabled={totalCompleted === 0}
                        className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl disabled:opacity-50 shadow-lg shadow-black/10 dark:shadow-white/5"
                    >
                        Terminar
                    </button>
                </div>
                
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none mb-2">{editableWorkout.focus}</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {isEditingMode ? 'Modo de edição ativado' : `${totalCompleted} de ${totalSets} séries concluídas`}
                        </p>
                    </div>
                    {!isEditingMode && (
                        <div className="text-right flex flex-col items-end">
                            <span className="text-3xl font-extrabold text-orange-500 tabular-nums">{progress}%</span>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                <ClockIcon className="w-3.5 h-3.5" />
                                <span className="text-xs font-mono font-bold">{formatTime(elapsedTime)}</span>
                            </div>
                        </div>
                    )}
                </div>
                {!isEditingMode && (
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto px-5 py-6 space-y-6 pb-40">
                {editableWorkout.exercises.map((ex: any, idx: number) => {
                    const setsData = completedSets[idx] || [];
                    const isExerciseDone = setsData.every(Boolean);

                    // Fix for bugged repetitions (e.g., "8-12" becoming "812")
                    // We split by non-digit separators and take the first part
                    const cleanedReps = ex.reps.toString().split(/[-– ]/)[0].replace(/\D/g, '');

                    if (isEditingMode) {
                        return (
                            <div key={`edit-${idx}`} id={`exercise-container-${idx}`} className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-4 border-2 border-orange-100 dark:border-orange-900/30 relative group">
                                <div className="absolute top-4 right-4">
                                    <button onClick={() => handleRemoveExercise(idx)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="space-y-3 pr-10">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Nome do Exercício</label>
                                        <input 
                                            value={ex.name} 
                                            onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-lg font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Séries</label>
                                            <input 
                                                type="number"
                                                value={ex.sets} 
                                                onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-lg font-bold text-center text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Reps</label>
                                            <input 
                                                type="number"
                                                value={ex.reps} 
                                                onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-lg font-bold text-center text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Rest (s)</label>
                                            <input 
                                                type="number"
                                                value={ex.rest} 
                                                onChange={(e) => handleUpdateExercise(idx, 'rest', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-lg font-bold text-center text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={idx} id={`exercise-container-${idx}`} className={`bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-sm border transition-all ${isExerciseDone ? 'border-green-500/30 opacity-80' : 'border-gray-100 dark:border-gray-800'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`text-lg font-extrabold text-gray-900 dark:text-white leading-tight ${isExerciseDone ? 'text-green-600 dark:text-green-400' : ''}`}>{ex.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase">{ex.muscleGroups?.[0] || 'Geral'}</span>
                                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded uppercase">Descanso: {ex.rest}s</span>
                                    </div>
                                </div>
                                {isExerciseDone && <div className="bg-green-100 text-green-600 rounded-full p-1"><CheckCircleIcon className="w-5 h-5"/></div>}
                            </div>

                            <div className="space-y-1">
                                {setsData.map((isSetDone, setIdx) => (
                                    <SetRow 
                                        key={setIdx}
                                        index={setIdx}
                                        setNumber={setIdx + 1}
                                        prevWeight={sessionData[idx]?.[setIdx]?.weight}
                                        targetReps={sessionData[idx]?.[setIdx]?.reps || cleanedReps}
                                        isCompleted={isSetDone}
                                        onToggle={(w, r) => handleSetToggle(idx, setIdx, w, r, parseInt(ex.rest) || 60)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {isEditingMode && (
                    <button 
                        onClick={handleAddExercise}
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" /> Adicionar Exercício
                    </button>
                )}
            </div>

            {activeTimer && (
                <RestTimer 
                    duration={activeTimer} 
                    onFinish={() => setActiveTimer(null)} 
                    onCancel={() => setActiveTimer(null)} 
                />
            )}

            {showFinishModal && (
                <WorkoutFeedbackModal 
                    onClose={() => setShowFinishModal(false)} 
                    onRate={async (rating) => {
                        await onComplete(rating, sessionData);
                        localStorage.removeItem(`workout_progress_${dayIndex}`);
                        localStorage.removeItem(`workout_start_time_${dayIndex}`);
                        setShowFinishModal(false);
                    }} 
                />
            )}
        </div>
    );
};

const WorkoutFeedbackModal: React.FC<{
    onClose: () => void;
    onRate: (rating: 'leve' | 'ideal' | 'pesado') => void;
}> = ({ onClose, onRate }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleRate = async (rating: 'leve' | 'ideal' | 'pesado') => {
        setIsSaving(true);
        await onRate(rating);
        setIsSaving(false);
    }

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    {isSaving ? (
                        <div className="py-10">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Salvando Treino...</h3>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pop-in relative z-10">
                                <CheckCircleIcon className="w-10 h-10" />
                            </div>
                            
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 relative z-10">Treino Concluído!</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm font-medium relative z-10">Como foi a intensidade?</p>
                            
                            <div className="space-y-3 relative z-10">
                                <button onClick={() => handleRate('leve')} className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 text-gray-700 dark:text-gray-200 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                                    <span className="group-hover:scale-110 transition-transform">😌</span> Fácil / Leve
                                </button>
                                <button onClick={() => handleRate('ideal')} className="w-full p-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    <span>💪</span> Na Medida
                                </button>
                                <button onClick={() => handleRate('pesado')} className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 text-gray-700 dark:text-gray-200 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                                    <span className="group-hover:scale-110 transition-transform">🥵</span> Difícil / Pesado
                                </button>
                            </div>
                            
                            <button onClick={onClose} className="mt-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-semibold relative z-10">Cancelar</button>
                        </>
                    )}
                </div>
            </div>
        </Portal>
    );
};

import { ConfirmModal } from '../ConfirmModal';

// --- History Edit Modal ---
const HistoryEditModal: React.FC<{
    item: WorkoutFeedback;
    onClose: () => void;
    onUpdate: (id: number, newRating: 'leve' | 'ideal' | 'pesado') => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}> = ({ item, onClose, onUpdate, onDelete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleRatingChange = async (rating: 'leve' | 'ideal' | 'pesado') => {
        setIsProcessing(true);
        if (item.id) await onUpdate(item.id, rating);
        setIsProcessing(false);
    };

    const handleDelete = async () => {
        if (!item.id) return;
        setIsProcessing(true);
        await onDelete(item.id);
        setIsProcessing(false);
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Editar Registro</h2>
                    
                    <div className="space-y-4 mb-8">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center mb-2">Alterar Intensidade</p>
                        <div className="grid grid-cols-3 gap-2">
                            {(['leve', 'ideal', 'pesado'] as const).map(rate => (
                                <button 
                                    key={rate}
                                    onClick={() => handleRatingChange(rate)}
                                    disabled={isProcessing}
                                    className={`py-3 rounded-xl font-bold text-sm capitalize transition-all ${
                                        item.rating === rate 
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {rate}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <TrashIcon className="w-5 h-5" />
                        Excluir Registro
                    </button>
                    
                    <button onClick={onClose} className="mt-4 w-full text-center text-gray-400 font-semibold text-sm">
                        Cancelar
                    </button>
                </div>
            </div>
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Excluir Treino"
                message="Excluir este treino do histórico?"
                confirmText="Excluir"
                onConfirm={() => {
                    setShowDeleteConfirm(false);
                    handleDelete();
                }}
                onCancel={() => setShowDeleteConfirm(false)}
                isDestructive={true}
            />
        </Portal>
    )
}

// --- Edit Days Modal ---
const EditDaysModal: React.FC<{
    plan: WorkoutPlan;
    onClose: () => void;
    onSave: (newPlan: WorkoutPlan) => void;
}> = ({ plan, onClose, onSave }) => {
    const [editedPlan, setEditedPlan] = useState<WorkoutPlan>(JSON.parse(JSON.stringify(plan)));
    const weekdays: Weekday[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

    const handleSave = () => {
        onSave(editedPlan);
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Configurar Dias da Semana</h2>
                    
                    <div className="space-y-4 mb-8 overflow-y-auto hide-scrollbar flex-grow">
                        {editedPlan.map((day, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Treino {idx + 1}: {day.focus}</p>
                                <select 
                                    value={day.weekday || ''}
                                    onChange={(e) => {
                                        const newPlan = [...editedPlan];
                                        newPlan[idx].weekday = e.target.value as Weekday;
                                        setEditedPlan(newPlan);
                                    }}
                                    className="w-full bg-white dark:bg-gray-700 p-3 rounded-xl text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="" disabled>Selecione um dia</option>
                                    {weekdays.map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto">
                        <button 
                            onClick={handleSave}
                            className="w-full py-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            Salvar Alterações
                        </button>
                        
                        <button onClick={onClose} className="mt-4 w-full text-center text-gray-400 font-semibold text-sm">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

// --- Swap Modal ---
const SwapWorkoutModal: React.FC<{ 
    plan: WorkoutPlan, 
    onClose: () => void, 
    onSelect: (index: number) => void,
    onFreestyle: () => void
}> = ({ plan, onClose, onSelect, onFreestyle }) => (
    <Portal>
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] p-6 flex flex-col animate-slide-up max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trocar Treino de Hoje</h2>
                    <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-3 pb-6">
                    {plan.map((day, idx) => (
                        <button 
                            key={idx}
                            onClick={() => { onSelect(idx); onClose(); }}
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group"
                        >
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{day.weekday ? day.weekday : `Dia ${idx + 1}`}</span>
                                <span className="text-base font-bold text-gray-900 dark:text-white">{day.focus}</span>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white" />
                        </button>
                    ))}
                    
                    <button 
                        onClick={() => { onFreestyle(); onClose(); }}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 text-gray-500 dark:text-gray-400 font-bold"
                    >
                        <div className="bg-gray-200 dark:bg-gray-700 p-1.5 rounded-lg">
                            <PlusIcon className="w-4 h-4" />
                        </div>
                        Treino Livre / Avulso
                    </button>
                </div>
            </div>
        </div>
    </Portal>
);

// --- Calendar Strip Component ---
const CalendarStrip: React.FC<{ 
    plan: WorkoutPlan, 
    completedHistory: WorkoutFeedback[], 
    onDaySelect: (index: number) => void,
    onEditDays: () => void,
    selectedIndex: number
}> = ({ plan, completedHistory, onDaySelect, onEditDays, selectedIndex }) => {
    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-3 px-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sua Semana</h3>
                <button onClick={onEditDays} className="text-[10px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1.5 rounded-lg transition-colors uppercase tracking-wider">
                    <EditIcon className="w-3 h-3" /> Editar Dias
                </button>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 -mx-5 px-5 snap-x">
                {plan.map((day, index) => {
                    // Check if this day index exists in history for today
                    const isCompleted = completedHistory.some(h => {
                        const hDate = new Date(h.date);
                        const now = new Date();
                        return h.workoutDayIndex === index && 
                               hDate.getDate() === now.getDate() && 
                               hDate.getMonth() === now.getMonth() && 
                               hDate.getFullYear() === now.getFullYear();
                    });
                    const isRest = day.exercises.length === 0;
                    const isSelected = selectedIndex === index;
                    
                    const dayLabel = day.weekday ? day.weekday.substring(0, 3) : `D${index + 1}`;

                    return (
                        <button 
                            key={index}
                            onClick={() => onDaySelect(index)}
                            className={`flex flex-col items-center justify-center min-w-[64px] h-[88px] rounded-[20px] border snap-center transition-all duration-300 ${
                                isSelected
                                    ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-lg scale-105'
                                    : isCompleted 
                                        ? 'bg-green-500 border-green-500 text-white opacity-60 hover:opacity-80' 
                                        : isRest 
                                            ? 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                                            : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'opacity-80' : 'opacity-60'}`}>{dayLabel}</span>
                            <span className="text-2xl font-extrabold">{index + 1}</span>
                            <div className="h-1.5 mt-1 flex items-center justify-center">
                                {isCompleted && <div className="bg-current w-1.5 h-1.5 rounded-full"></div>}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const EmptyStateView: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => (
    <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
            <DumbbellIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Sem Treino Ativo</h2>
        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-xs mb-10 font-medium">
            Seu personal trainer IA está pronto para criar uma rotina perfeita para seu perfil.
        </p>
        <button 
            onClick={onGenerate} 
            className="w-full max-w-xs bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
            <FlameIcon className="w-5 h-5 text-orange-500" />
            <span>Criar Rotina</span>
        </button>
    </div>
);

// --- Main Component ---

export const WorkoutsTab: React.FC = () => {
    const { userData, workoutPlan, setWorkoutPlan, workoutHistory, setWorkoutHistory, updateStreak, unlockPro, isGeneratingWorkout, setIsGeneratingWorkout } = useAppContext();
    const { addToast } = useToast();
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    
    // State to toggle between the dashboard and the active workout runner
    const [activeWorkoutDay, setActiveWorkoutDay] = useState<number | null>(null);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [isEditDaysModalOpen, setIsEditDaysModalOpen] = useState(false);
    
    // State to track which workout is selected for preview/start (defaulting to next in queue)
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    
    // Edit History State
    const [editingHistoryItem, setEditingHistoryItem] = useState<WorkoutFeedback | null>(null);
    const [showAllHistory, setShowAllHistory] = useState(false);
    
    // Pro Features
    const [showProModal, setShowProModal] = useState(false);
    const [showSubPage, setShowSubPage] = useState(false);

    // Logic: Find next incomplete workout automatically
    const nextWorkoutIndex = useMemo(() => {
        if (!workoutPlan || workoutPlan.length === 0) return 0;
        
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        const weekdays: Weekday[] = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const todayWeekday = weekdays[today];

        // Try to find a workout for today
        const todayIdx = workoutPlan.findIndex(day => day.weekday === todayWeekday);
        
        if (todayIdx !== -1) {
            return todayIdx;
        }

        // Fallback if today has no assigned workout
        return 0;
    }, [workoutPlan]);

    // Determines what to show on the Hero Card
    // Prioritize manual selection, otherwise fallback to the automatic next workout
    const currentDisplayIndex = selectedDayIndex !== null ? selectedDayIndex : nextWorkoutIndex;

    // Helper to get the plan object for the Hero Card
    const activePlanForCard = useMemo(() => {
        if (currentDisplayIndex === -1) {
            // Freestyle object structure for preview
            return {
                focus: "Treino Livre / Avulso",
                exercises: { length: 0 }, // Just for count display
                estimatedTime: 45
            };
        }
        return workoutPlan && workoutPlan[currentDisplayIndex] ? workoutPlan[currentDisplayIndex] : null;
    }, [currentDisplayIndex, workoutPlan]);


    const handleGenerateClick = () => {
        if (userData?.isPro) {
            setIsQuizOpen(true);
        } else {
            setShowProModal(true);
        }
    };

    // When freestyle is selected from Modal
    const handleFreestyleSelect = () => {
        setSelectedDayIndex(-1);
    };

    const handleSaveDays = async (newPlan: WorkoutPlan) => {
        try {
            const { error: dbError } = await supabase.from('workout_plans').insert({
                user_id: userData?.id,
                plan: newPlan
            });
            if (dbError) throw dbError;
            setWorkoutPlan(newPlan);
            setIsEditDaysModalOpen(false);
            addToast("Dias de treino atualizados!", "success");
        } catch (e: any) {
            console.error("Erro ao atualizar dias:", e);
            addToast('Erro ao atualizar dias. Tente novamente.', 'error');
        }
    };

    const handleQuizComplete = async (answers: WorkoutQuizAnswers) => {
        setIsQuizOpen(false);
        setIsGeneratingWorkout(true);

        try {
            // AI GENERATION LOGIC
            const newPlan = await workoutService.generateWorkoutPlan(answers);
            
            // Assign default weekdays
            const defaultWeekdays: Weekday[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
            newPlan.forEach((day, index) => {
                day.weekday = defaultWeekdays[index % 7];
            });
            
            // Save to DB
            const { error: dbError } = await supabase.from('workout_plans').insert({
                user_id: userData?.id,
                plan: newPlan
            });

            if (dbError) throw dbError;
            setWorkoutPlan(newPlan);
            // Reset selection to auto
            setSelectedDayIndex(null); 
            addToast("Treino gerado com sucesso pela IA!", "success");

        } catch (e: any) {
            console.error("Erro na geração do treino:", e);
            addToast('Erro ao gerar treino com IA. Tente novamente.', 'error');
        } finally {
            setIsGeneratingWorkout(false);
        }
    };

    const handleFeedback = async (rating: WorkoutFeedback['rating'], details?: any) => {
        if (!userData || activeWorkoutDay === null) return;
        
        // If activeWorkoutDay is -1 (Freestyle), we can record it as a special index
        const dayIndexToSave = activeWorkoutDay === -1 ? 999 : activeWorkoutDay;

        const newFeedback: WorkoutFeedback = {
            user_id: userData.id,
            date: new Date().toISOString(),
            workoutDayIndex: dayIndexToSave,
            rating,
            details
        };
        
        try {
            const { data, error } = await supabase.from('workout_history').insert(newFeedback).select();
            
            if (error) throw error;

            if (data) {
                setWorkoutHistory(prev => [data[0], ...prev]);
                updateStreak();
                addToast("Treino salvo com sucesso!", "success");
            }
        } catch (error: any) {
            console.error("Error saving workout:", error);
            addToast(`Erro ao salvar: ${error.message || 'Tente novamente'}`, "error");
        } finally {
            setActiveWorkoutDay(null); // Close modal
            setSelectedDayIndex(null); // Reset selection
        }
    };

    const handleUpdateHistory = async (id: number, newRating: 'leve' | 'ideal' | 'pesado') => {
        try {
            const { error } = await supabase.from('workout_history').update({ rating: newRating }).eq('id', id);
            if (error) throw error;
            setWorkoutHistory(prev => prev.map(item => item.id === id ? { ...item, rating: newRating } : item));
            addToast("Histórico atualizado!", "success");
            setEditingHistoryItem(null);
        } catch (error: any) {
            console.error("Error updating history:", error);
            addToast("Erro ao atualizar.", "error");
        }
    };

    const handleDeleteHistory = async (id: number) => {
        try {
            const { error } = await supabase.from('workout_history').delete().eq('id', id);
            if (error) throw error;
            setWorkoutHistory(prev => prev.filter(item => item.id !== id));
            addToast("Registro excluído.", "success");
            setEditingHistoryItem(null);
        } catch (error: any) {
            console.error("Error deleting history:", error);
            addToast("Erro ao excluir.", "error");
        }
    };

    if (isGeneratingWorkout) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-[6px] border-gray-200 dark:border-gray-800 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Construindo Plano...</h3>
                <p className="text-gray-500 text-sm mt-2 font-medium">Analisando suas respostas e montando a rotina.</p>
            </div>
        );
    }

    if (activeWorkoutDay !== null) {
        // Determine which plan to show for the Active Session
        let dayPlan;
        if (activeWorkoutDay === -1) {
            // Freestyle Default Template
            dayPlan = {
                day: 0,
                focus: "Treino Livre",
                estimatedTime: 45,
                exercises: [
                    { exerciseId: 101, name: "Supino Reto", sets: "3", reps: "10", rest: "60", muscleGroups: ["Peito"] },
                    { exerciseId: 201, name: "Puxada Frontal", sets: "3", reps: "12", rest: "60", muscleGroups: ["Costas"] },
                    { exerciseId: 302, name: "Leg Press 45", sets: "3", reps: "12", rest: "90", muscleGroups: ["Pernas"] }
                ]
            };
        } else if (workoutPlan) {
            dayPlan = workoutPlan[activeWorkoutDay];
        }

        if (dayPlan) {
            const lastSession = workoutHistory.find(h => h.workoutDayIndex === activeWorkoutDay);
            return <ActiveSessionView 
                dayWorkout={dayPlan} 
                dayIndex={activeWorkoutDay}
                lastSessionDetails={lastSession?.details}
                onComplete={handleFeedback} 
                onBack={() => setActiveWorkoutDay(null)} 
            />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-28 animate-fade-in font-sans">
            {/* Header */}
            <div id="tour-workouts-main" className="px-6 pt-4 pb-2 sticky top-0 z-30 bg-gray-50/95 dark:bg-black/95 backdrop-blur-xl">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Treinos</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Sua Jornada Física</p>
                    </div>
                    <StreakBadge />
                </div>
                
                {/* Weekly Strip */}
                {workoutPlan && (
                    <CalendarStrip 
                        plan={workoutPlan} 
                        completedHistory={workoutHistory} 
                        onDaySelect={(idx) => setSelectedDayIndex(idx)}
                        onEditDays={() => setIsEditDaysModalOpen(true)}
                        selectedIndex={currentDisplayIndex}
                    />
                )}
            </div>

            <div className="px-5 mt-6">
                {!workoutPlan ? (
                    <EmptyStateView onGenerate={handleGenerateClick} />
                ) : (
                    <div className="space-y-8">
                        
                        {/* Next Workout Hero Card */}
                        {activePlanForCard && (
                            <div className="relative overflow-hidden bg-[#1C1C1E] dark:bg-white text-white dark:text-black p-6 rounded-[32px] shadow-2xl shadow-orange-500/10 cursor-pointer active:scale-[0.98] transition-all duration-300 group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/40">
                                            {currentDisplayIndex === -1 ? 'Treino Livre' : 'Selecionado'}
                                        </div>
                                        
                                        {/* Subtle Swap Button */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setIsSwapModalOpen(true); }}
                                            className="flex items-center gap-1.5 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full transition-colors text-[10px] font-bold uppercase tracking-wide z-20"
                                        >
                                            <ArrowPathIcon className="w-3 h-3" />
                                            Trocar
                                        </button>
                                    </div>
                                    
                                    <div onClick={() => setActiveWorkoutDay(currentDisplayIndex)}>
                                        <h3 className="text-3xl font-extrabold mb-1 leading-none tracking-tight">
                                            {activePlanForCard.focus}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-400 dark:text-gray-600 mb-6 uppercase tracking-wide">
                                            {currentDisplayIndex === -1 ? 'Personalizado' : (activePlanForCard as any).weekday ? (activePlanForCard as any).weekday : `Dia ${currentDisplayIndex + 1}`} • {currentDisplayIndex === -1 ? '?' : activePlanForCard.exercises.length} Exercícios
                                        </p>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-white/10 dark:bg-black/5 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5 dark:border-black/5">
                                                <ClockIcon className="w-4 h-4 text-orange-500" />
                                                <span className="text-xs font-bold font-mono">{activePlanForCard.estimatedTime} min</span>
                                            </div>
                                            <div className="h-px flex-grow bg-white/10 dark:bg-black/10"></div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Começar Agora</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent History List */}
                        <div>
                            <div className="flex items-center justify-between px-1 mb-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimos Realizados</h3>
                            </div>
                            
                            <div className="space-y-3">
                                {(showAllHistory ? workoutHistory : workoutHistory.slice(0, 3)).map((h, i) => {
                                    const planName = h.workoutDayIndex === 999 
                                        ? "Treino Livre" 
                                        : workoutPlan[h.workoutDayIndex]?.focus || (workoutPlan[h.workoutDayIndex]?.weekday ? `Treino ${workoutPlan[h.workoutDayIndex].weekday}` : `Treino Dia ${h.workoutDayIndex + 1}`);
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setEditingHistoryItem(h)}
                                            className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-[20px] flex justify-between items-center border border-gray-100 dark:border-gray-800 shadow-sm opacity-90 hover:opacity-100 transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900 dark:text-white text-xs">
                                                        {planName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                                        {new Date(h.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wide ${
                                                    h.rating === 'pesado' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                    h.rating === 'leve' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                }`}>
                                                    {h.rating}
                                                </span>
                                                <EditIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                            </div>
                                        </button>
                                    )
                                })}
                                {workoutHistory.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-4">Nenhum treino completado ainda.</p>
                                )}
                                {workoutHistory.length > 3 && (
                                    <button 
                                        onClick={() => setShowAllHistory(!showAllHistory)}
                                        className="w-full py-3 mt-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                        {showAllHistory ? 'Ver Menos' : `Ver Mais (${workoutHistory.length - 3})`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Regenerate Option */}
                        <button onClick={handleGenerateClick} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 transition-colors">
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Regerar Plano
                        </button>
                    </div>
                )}
            </div>

            {isSwapModalOpen && workoutPlan && (
                <SwapWorkoutModal 
                    plan={workoutPlan}
                    onClose={() => setIsSwapModalOpen(false)}
                    onSelect={(idx) => setSelectedDayIndex(idx)}
                    onFreestyle={handleFreestyleSelect}
                />
            )}

            {isEditDaysModalOpen && workoutPlan && (
                <EditDaysModal 
                    plan={workoutPlan}
                    onClose={() => setIsEditDaysModalOpen(false)}
                    onSave={handleSaveDays}
                />
            )}

            {isQuizOpen && <WorkoutQuiz onComplete={handleQuizComplete} onClose={() => setIsQuizOpen(false)} />}
            
            {editingHistoryItem && (
                <HistoryEditModal 
                    item={editingHistoryItem}
                    onClose={() => setEditingHistoryItem(null)}
                    onUpdate={handleUpdateHistory}
                    onDelete={handleDeleteHistory}
                />
            )}

            {showProModal && (
                <ProFeatureModal 
                    title="Personal Trainer Inteligente"
                    onClose={() => setShowProModal(false)}
                    onUnlock={() => { setShowProModal(false); setShowSubPage(true); }}
                />
            )}
            {showSubPage && (
                <SubscriptionPage 
                    onClose={() => setShowSubPage(false)}
                    onSubscribe={() => { unlockPro(); setShowSubPage(false); setIsQuizOpen(true); }}
                />
            )}
        </div>
    );
};
