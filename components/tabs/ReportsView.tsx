
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAppContext } from '../AppContext';
import { FileTextIcon } from '../core/Icons';
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

            const dataSummary = `
                - Variação de Peso: ${JSON.stringify(last7DaysWeight.map(e => ({ date: e.date, weight: e.weight })))}
                - Aplicações de Medicamento: ${JSON.stringify(last7DaysApps.map(e => ({ date: e.date, medication: e.medication, dose: e.dose })))}
                - Efeitos Colaterais Registrados: ${JSON.stringify(last7DaysEffects.map(e => ({ date: e.date, effects: e.effects, notes: e.notes })))}
                - Anotações Diárias: ${JSON.stringify(last7DaysNotes.map(e => ({ date: e.date, content: e.content })))}
            `;

            if (last7DaysWeight.length === 0 && last7DaysApps.length === 0 && last7DaysEffects.length === 0 && last7DaysNotes.length === 0) {
                 setError("Não há dados suficientes na última semana para gerar um relatório. Continue registrando seu progresso!");
                 setIsLoading(false);
                 return;
            }

            const prompt = `
                Você é um assistente de saúde especialista em analisar dados para usuários do medicamento GLP-1.
                Analise os dados da última semana de um usuário e gere um relatório conciso, motivacional e útil em markdown.

                Dados do usuário:
                - Nome: ${userData.name}
                - Peso atual: ${userData.weight}kg
                - Meta de peso: ${userData.targetWeight}kg
                - Medicamento: ${userData.medication.name}

                Dados da última semana:
                ${dataSummary}

                Siga estas instruções para o relatório:
                1.  **Título:** Comece com "### Relatório Semanal da IA".
                2.  **Análise Geral:** Faça um breve parágrafo resumindo a semana.
                3.  **Pontos Positivos:** Destaque 1 ou 2 coisas que o usuário fez bem (ex: consistência no registro, progresso no peso). Use o formato "- **Ponto Positivo:** [descrição]".
                4.  **Insights e Correlações:** Encontre 1 correlação interessante nos dados. Por exemplo, se o usuário relatou 'Fadiga' 1-2 dias após uma aplicação, aponte isso. Se o peso caiu após dias com anotações sobre 'caminhada', mencione. Use o formato "- **Insight da IA:** [descrição]".
                5.  **Sugestão para a Próxima Semana:** Dê uma sugestão prática e simples baseada na análise. Use o formato "- **Sugestão:** [descrição]".
                6.  **Tom:** Seja encorajador, positivo e evite linguagem médica complexa. Aja como um coach de saúde.
                7.  **Formato:** Use markdown para negrito (**texto**) e listas.
            `;
            
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 2000 }
                }
            });

            setReport(response.text);

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
