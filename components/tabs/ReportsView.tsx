
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { FileTextIcon, SparklesIcon } from '../core/Icons';
import type { WeightEntry, ApplicationEntry, DailyNote, SideEffectEntry, Meal } from '../../types';

interface ReportsViewProps {
}

const isWithinLast7Days = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    // Reset hours to compare dates properly
    date.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    sevenDaysAgo.setHours(0,0,0,0);
    
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
            // 1. Fetch Daily Records (Meals history) for the last 7 days from DB
            // We do this here because AppContext usually only holds 'today's' meals in the state.
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

            const { data: mealHistoryData } = await supabase
                .from('daily_records')
                .select('date, meals, water_liters')
                .gte('date', sevenDaysAgoStr)
                .order('date', { ascending: true });

            // 2. Filter Context Data
            const last7DaysWeight: WeightEntry[] = weightHistory.filter(e => isWithinLast7Days(e.date));
            const last7DaysApps: ApplicationEntry[] = applicationHistory.filter(e => isWithinLast7Days(e.date));
            const last7DaysEffects: SideEffectEntry[] = sideEffects.filter(e => isWithinLast7Days(e.date));
            const last7DaysNotes: DailyNote[] = dailyNotes.filter(e => isWithinLast7Days(e.date));

            // 3. Format Data for AI
            const formattedMealHistory = mealHistoryData?.map(record => {
                const totalCals = (record.meals as Meal[])?.reduce((acc, m) => acc + m.calories, 0) || 0;
                const totalProt = (record.meals as Meal[])?.reduce((acc, m) => acc + m.protein, 0) || 0;
                const foods = (record.meals as Meal[])?.map(m => m.name).join(', ');
                return `{ Data: ${record.date}, Calorias: ${totalCals}, Proteína: ${totalProt}g, Alimentos: [${foods}], Água: ${record.water_liters}L }`;
            }).join('\n');

            const formattedApps = last7DaysApps.map(e => `{ Data: ${e.date.split('T')[0]}, Medicação: ${e.medication} ${e.dose} }`).join('\n');
            const formattedEffects = last7DaysEffects.map(e => `{ Data: ${e.date}, Sintomas: ${e.effects.map(x => `${x.name} (${x.intensity})`).join(', ')} }`).join('\n');
            const formattedWeight = last7DaysWeight.map(e => `{ Data: ${e.date.split('T')[0]}, Peso: ${e.weight}kg }`).join('\n');

            // Check if we have enough data
            if (!formattedMealHistory && last7DaysWeight.length === 0 && last7DaysApps.length === 0) {
                 setError("Preciso de mais dados recentes (refeições, peso ou aplicações) para gerar uma análise profunda.");
                 setIsLoading(false);
                 return;
            }

            const prompt = `
                Você é um especialista em saúde metabólica e análise de dados para usuários de agonistas de GLP-1 (Ozempic, Mounjaro, etc).
                Gere um "Relatório de Inteligência Metabólica" semanal para o usuário.

                **PERFIL DO USUÁRIO:**
                - Nome: ${userData.name}
                - Peso Atual: ${userData.weight}kg (Meta: ${userData.targetWeight}kg)
                - TMB Estimada: ~${Math.round(userData.weight * 22)} kcal
                - Medicamento: ${userData.medication.name} (${userData.medication.dose})

                **DADOS DA ÚLTIMA SEMANA:**
                
                [APLICAÇÕES]
                ${formattedApps || "Nenhuma registrada nesta semana."}

                [DIETA E "FOOD NOISE"]
                ${formattedMealHistory || "Sem registros de refeições."}

                [EFEITOS COLATERAIS]
                ${formattedEffects || "Nenhum registrado."}

                [PESO]
                ${formattedWeight || "Sem pesagens novas."}

                **INSTRUÇÕES DE ANÁLISE (IMPORTANTE):**
                
                1. **CORRELAÇÃO GLP-1 vs. FOOD NOISE:** 
                   - Analise os dias pós-aplicação. A ingestão calórica diminuiu?
                   - Identifique se houve aumento de fome ("food noise") nos dias antes da próxima dose (efeito de fim de dose).
                
                2. **GATILHOS DE MAL-ESTAR:**
                   - Se houver efeitos colaterais registrados, cruze com os alimentos ingeridos no mesmo dia ou no dia anterior. 
                   - Ex: "Você relatou náusea na terça, dia em que consumiu alimentos mais gordurosos/pesados."
                
                3. **MACRONUTRIENTES:**
                   - Verifique se a ingestão de proteína está adequada para evitar perda de massa muscular (ideal: alta).
                   - Verifique a hidratação.

                **FORMATO DE SAÍDA (Markdown):**
                Use tom profissional, encorajador e analítico.
                
                ### 📊 Análise de Eficácia do GLP-1
                [Seu texto sobre como a medicação está agindo no apetite baseado nos dados]

                ### 🍽️ Gatilhos & Nutrição
                [Sua análise sobre a dieta e correlação com sintomas]

                ### 💡 Insight da Semana
                [Uma descoberta interessante baseada nos dados cruzados]

                ### 🎯 Meta para Próxima Semana
                [Uma sugestão prática e acionável]
            `;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            setReport(response.text);

        } catch (e) {
            console.error("Error generating report:", e);
            setError("Ocorreu um erro ao processar seus dados. Verifique sua conexão.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3 flex items-center gap-2"><span class="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white font-semibold">$1</strong>')
            .replace(/^- (.*$)/gim, '<li class="flex items-start gap-3 mb-2 ml-1"><span class="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span><span class="text-gray-700 dark:text-gray-300 leading-relaxed">$1</span></li>');
        
        return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html.replace(/<li/g, '<ul class="list-none pl-0"><li').replace(/<\/li>/g, '</li></ul>') }} />;
    };


    return (
        <div className="space-y-6 animate-fade-in pb-10">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[24px] text-center shadow-lg relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <SparklesIcon className="w-7 h-7 text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Relatório Inteligente PRO</h3>
                    <p className="text-blue-100 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                        A IA analisa a correlação entre sua dose, sua fome ("food noise") e efeitos colaterais para otimizar sua jornada.
                    </p>
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={isLoading}
                        className="bg-white text-blue-700 py-3.5 px-8 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center mx-auto gap-2 disabled:opacity-70 disabled:scale-100 w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Cruzando dados...</span>
                            </>
                        ) : (
                            'Gerar Análise Completa'
                        )}
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-fade-in">
                    <p className="font-semibold text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
            )}

            {report && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-soft animate-slide-up">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Análise Concluída</span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date().toLocaleDateString()}</span>
                    </div>
                    {renderMarkdown(report)}
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                        <p className="text-xs text-gray-400 italic">
                            Este relatório é gerado por IA com base nos seus registros. Não substitui aconselhamento médico.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
