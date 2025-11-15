import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { SyringeIcon, ChartLineIcon, ScaleIcon, FlameIcon, BarChartIcon, WavesIcon, ClipboardListIcon } from '../core/Icons';
import { DailyNoteModal } from './DailyNoteModal';
import { SideEffectModal } from './SideEffectModal';
import type { SideEffectEntry, SideEffect } from '../../types';

const isSameDay = (d1: Date, d2: Date) => {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

// More robust date parsing from YYYY-MM-DD
const parseSupabaseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}


const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];


const InfoCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    details?: string;
    placeholder?: string;
}> = ({ icon, label, value, details, placeholder }) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-soft rounded-2xl p-4 flex-1 min-w-[45%]">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
            {icon}
            <span className="ml-2">{label}</span>
        </div>
        {value ? (
            <>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
                {details && <p className="text-sm text-gray-500 dark:text-gray-400">{details}</p>}
            </>
        ) : (
             <p className="text-lg text-gray-400 font-medium">{placeholder || '—'}</p>
        )}
    </div>
);


export const CalendarView: React.FC = () => {
    const { userData, applicationHistory, weightHistory, meals, dailyNotes, setDailyNotes, sideEffects, setSideEffects } = useAppContext();
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isSideEffectModalOpen, setIsSideEffectModalOpen] = useState(false);

    const { month, year, calendarGrid, eventDays } = useMemo(() => {
        const date = new Date(viewDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid: (number | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(i);
        }

        const events = new Set<number>();
        applicationHistory.forEach(app => {
            const appDate = parseSupabaseDate(app.date);
            if (appDate.getFullYear() === year && appDate.getMonth() === month) {
                events.add(appDate.getDate());
            }
        });
        weightHistory.forEach(w => {
            const weightDate = parseSupabaseDate(w.date);
            if (weightDate.getFullYear() === year && weightDate.getMonth() === month) {
                events.add(weightDate.getDate());
            }
        });
        sideEffects.forEach(se => {
            const sideEffectDate = parseSupabaseDate(se.date);
            if (sideEffectDate.getFullYear() === year && sideEffectDate.getMonth() === month) {
                events.add(sideEffectDate.getDate());
            }
        });


        return { month, year, calendarGrid: grid, eventDays: events };
    }, [viewDate, applicationHistory, weightHistory, sideEffects]);

    const { selectedDayData } = useMemo(() => {
        const injection = applicationHistory.find(entry => isSameDay(parseSupabaseDate(entry.date), selectedDate));
        const weight = weightHistory.find(entry => isSameDay(parseSupabaseDate(entry.date), selectedDate));
        const note = dailyNotes.find(n => isSameDay(parseSupabaseDate(n.date), selectedDate));
        const sideEffect = sideEffects.find(se => isSameDay(parseSupabaseDate(se.date), selectedDate));
        // This is a simplification as meals are not dated in the current app state
        const dailyMeals = isSameDay(new Date(), selectedDate) ? meals : []; 
        const totalCalories = dailyMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = dailyMeals.reduce((sum, meal) => sum + meal.protein, 0);

        return { selectedDayData: { injection, weight, totalCalories, totalProtein, note, sideEffect } };
    }, [selectedDate, applicationHistory, weightHistory, meals, dailyNotes, sideEffects]);

    const handlePrevMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(year, month + 1, 1));
    };

    const handleSelectDate = (day: number) => {
        setSelectedDate(new Date(year, month, day));
    };

    const handleSaveNote = async (content: string) => {
        if (!userData) return;

        const existingNote = selectedDayData.note;
        const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

        // If new content is empty and a note exists, delete it
        if (!content.trim() && existingNote) {
            const { error } = await supabase.from('daily_notes').delete().eq('id', existingNote.id);
            if (!error) {
                setDailyNotes(prev => prev.filter(n => n.id !== existingNote.id));
            } else {
                console.error("Error deleting note:", error);
            }
            return;
        }

        if (!content.trim()) return;

        const notePayload = {
            id: existingNote?.id,
            user_id: userData.id,
            date: dateString,
            content,
        };
        
        const { data, error } = await supabase.from('daily_notes').upsert(notePayload).select().single();

        if (data) {
            setDailyNotes(prev => {
                const index = prev.findIndex(n => n.id === data.id);
                if (index > -1) {
                    const newNotes = [...prev];
                    newNotes[index] = data;
                    return newNotes;
                }
                return [...prev, data];
            });
        }
        if (error) console.error("Error upserting note:", error);
    };

    const handleSaveSideEffects = async (entry: { effects: SideEffect[]; notes?: string; }) => {
        if (!userData) return;

        const existingEntry = selectedDayData.sideEffect;
        const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

        if (entry.effects.length === 0 && (!entry.notes || !entry.notes.trim()) && existingEntry) {
            const { error } = await supabase.from('side_effects').delete().eq('id', existingEntry.id);
            if (!error) {
                setSideEffects(prev => prev.filter(se => se.id !== existingEntry.id));
            } else {
                console.error("Error deleting side effect entry:", error);
            }
            return;
        }

        if (entry.effects.length === 0 && (!entry.notes || !entry.notes.trim())) return;

        const payload: Omit<SideEffectEntry, 'id'> & { id?: number } = {
            id: existingEntry?.id,
            user_id: userData.id,
            date: dateString,
            effects: entry.effects,
            notes: entry.notes,
        };
        
        const { data, error } = await supabase.from('side_effects').upsert(payload).select().single();

        if (data) {
            setSideEffects(prev => {
                const index = prev.findIndex(se => se.id === data.id);
                if (index > -1) {
                    const newEffects = [...prev];
                    newEffects[index] = data;
                    return newEffects;
                }
                return [...prev, data];
            });
        }
        if (error) console.error("Error upserting side effect entry:", error);
    };
    
    const today = new Date();

    return (
        <div className="animate-fade-in text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between mb-4">
                 <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-xl font-bold capitalize">{monthNames[month]} {year}</h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            
            <div className="grid grid-cols-7 gap-y-2 text-center">
                {dayNames.map(day => <div key={day} className="text-sm font-semibold text-gray-400 dark:text-gray-500">{day}</div>)}
                {calendarGrid.map((day, index) => (
                    <div key={index} className="flex justify-center items-center py-1">
                        {day ? (
                            <button
                                onClick={() => handleSelectDate(day)}
                                className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-semibold relative transition-colors ${
                                    isSameDay(selectedDate, new Date(year, month, day))
                                    ? 'bg-teal-500 text-white'
                                    : isSameDay(today, new Date(year, month, day))
                                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {day}
                                {eventDays.has(day) && !isSameDay(selectedDate, new Date(year, month, day)) && (
                                    <div className="absolute bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                )}
                            </button>
                        ) : (
                            <div></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                 <h3 className="text-lg font-bold mb-4">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                 <div className="space-y-3">
                     {selectedDayData.injection && (
                         <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-soft rounded-2xl p-4 flex items-start">
                             <div className="text-blue-500 mt-1"><SyringeIcon className="w-5 h-5"/></div>
                             <div className="ml-3">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Injeção 1</p>
                                <div className="flex items-baseline gap-2">
                                     <p className="text-xl font-bold">{selectedDayData.injection.medication}®</p>
                                     <span className="text-sm font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-md">{selectedDayData.injection.dose}</span>
                                </div>
                             </div>
                         </div>
                     )}
                     <div className="flex gap-3">
                        <InfoCard icon={<ChartLineIcon className="w-5 h-5"/>} label="Nível Est." value="3,78mg" details="Aumentando ↗" />
                        <InfoCard icon={<ScaleIcon className="w-5 h-5"/>} label="Peso" value={selectedDayData.weight ? `${selectedDayData.weight.weight.toFixed(1)}kg` : null} />
                     </div>
                      <div className="flex gap-3">
                        <InfoCard icon={<FlameIcon className="w-5 h-5"/>} label="Calorias" value={selectedDayData.totalCalories > 0 ? selectedDayData.totalCalories : null} />
                        <InfoCard icon={<BarChartIcon className="w-5 h-5"/>} label="Proteína" value={selectedDayData.totalProtein > 0 ? `${selectedDayData.totalProtein}g` : null} />
                     </div>
                     <div 
                        className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-soft rounded-2xl p-4 w-full flex items-start cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors"
                        onClick={() => setIsSideEffectModalOpen(true)}
                     >
                         <div className="text-gray-400 dark:text-gray-500 mt-1"><WavesIcon className="w-5 h-5"/></div>
                         <div className="ml-3 overflow-hidden">
                             <p className="font-semibold text-gray-800 dark:text-gray-200">Efeitos colaterais</p>
                             {selectedDayData.sideEffect && selectedDayData.sideEffect.effects.length > 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                                    {selectedDayData.sideEffect.effects.map(e => `${e.name} (${e.intensity})`).join(', ')}
                                </p>
                             ) : (
                                <p className="text-gray-400 dark:text-gray-500 text-sm">Toque para adicionar efeitos colaterais</p>
                             )}
                         </div>
                    </div>
                     <div 
                        className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-soft rounded-2xl p-4 w-full flex items-start cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors"
                        onClick={() => setIsNoteModalOpen(true)}
                     >
                         <div className="text-gray-400 dark:text-gray-500 mt-1"><ClipboardListIcon className="w-5 h-5"/></div>
                         <div className="ml-3 overflow-hidden">
                             <p className="font-semibold text-gray-800 dark:text-gray-200">Notas do dia</p>
                             {selectedDayData.note?.content ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{selectedDayData.note.content}</p>
                             ) : (
                                <p className="text-gray-400 dark:text-gray-500 text-sm">Toque para adicionar notas</p>
                             )}
                         </div>
                    </div>
                 </div>
            </div>

            {isNoteModalOpen && (
                <DailyNoteModal
                    date={selectedDate}
                    initialContent={selectedDayData.note?.content || ''}
                    onClose={() => setIsNoteModalOpen(false)}
                    onSave={handleSaveNote}
                />
            )}
            {isSideEffectModalOpen && (
                <SideEffectModal
                    date={selectedDate}
                    initialEntry={selectedDayData.sideEffect}
                    onClose={() => setIsSideEffectModalOpen(false)}
                    onSave={handleSaveSideEffects}
                />
            )}
        </div>
    );
};
