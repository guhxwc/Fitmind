import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { FileTextIcon } from '../core/Icons';
import { supabase } from '../supabaseClient';
import type { WeightEntry, ApplicationEntry, DailyNote, SideEffectEntry } from '../../types';

interface ReportsViewProps {
}

const isWithinLast7Days = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return date >= sevenDaysAgo && date <= today;
};

export const ReportsView: React.FC<ReportsViewProps> = () => {
    const { userData, weightHistory, applicationHistory, sideEffects, dailyNotes } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateReport = async () => {
        if (!userData) return;

        setIsLoading(true);
        setReport(null);
        setError(null);

        try {
            const last7DaysWeight: WeightEntry[] = weightHistory.filter(e => isWithinLast7Days(e.date));
            const last7DaysApps: ApplicationEntry[] = applicationHistory.filter(e => isWithinLast7Days(e.date));
            const last7DaysEffects: SideEffectEntry[] = sideEffects.filter(e => isWithinLast7Days(e.date));
            const last7DaysNotes: DailyNote[] = dailyNotes.filter(e => isWithinLast7Days(e.date));

            if (last7DaysWeight.length === 0 && last7DaysApps.length === 0 && last7DaysEffects.length === 0 && last7DaysNotes.length === 0) {
                setError("Não há dados suficientes na última semana para gerar um relatório. Continue registrando seu progresso!");
                setIsLoading(false);
                return;
            }

            
            const { data, error: fnError } = await supabase.functions.invoke('generate-report', {
                body: {
                    userData,
                    weightHistory: last7DaysWeight,
                    applicationHistory: last7DaysApps,
                    sideEffects: last7DaysEffects,
                    dailyNotes: last7DaysNotes,
                }
            });

            if (fnError) throw new Error(fnError.message);
            if (data?.error) throw new Error(data.message || data.error);

            setReport(data.report || '');

        } catch (e) {
            console.error("Error generating report:", e);
            setError("Ocorreu um erro ao gerar seu relatório. Por favor, tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">$1</h3>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*$)/gim, '<li class="flex items-start gap-3 mb-2"><span class="mt-1.5 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full flex-shrink-0"></span><span class="text-gray-700 dark:text-gray-300">$1</span></li>');
        return <ul className="space-y-2 list-none" dangerouslySetInnerHTML={{ __html: html.replace(/<li/g, '<ul class="list-none pl-0"><li').replace(/<\/li>/g, '</li></ul>') }} />;
    };


    return (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-6 rounded-2xl text-center">
                <FileTextIcon className="w-10 h-10 mx-auto text-blue-600 dark:text-blue-400 mb-3"/>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200">Relatórios Semanais com IA</h3>
                <p className="text-blue-700 dark:text-blue-300 mt-1 mb-4">Receba insights e correlações sobre seu progresso, analisados pela nossa IA.</p>
                <button 
                    onClick={handleGenerateReport} 
                    disabled={isLoading}
                    className="bg-black dark:bg-white text-white dark:text-black py-3 px-8 rounded-xl font-semibold flex items-center justify-center mx-auto gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    {isLoading ? (
                        <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Analisando...</span>
                        </>
                    ) : (
                        'Gerar Relatório Semanal'
                    )}
                </button>
            </div>
            
            {error && (
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl">
                    <p className="font-semibold text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {report && (
                <div className="bg-gray-100/60 dark:bg-gray-800/50 p-5 rounded-2xl space-y-3 animate-fade-in">
                    {renderMarkdown(report)}
                </div>
            )}
        </div>
    );
};