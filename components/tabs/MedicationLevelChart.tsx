
import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import type { ApplicationEntry, MedicationName } from '../../types';
import { useAppContext } from '../AppContext';
import Portal from '../core/Portal';
import { SyringeIcon, XMarkIcon } from '../core/Icons';

// --- Ícone de Informação Local ---
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
);

interface MedicationLevelChartProps {
  history: ApplicationEntry[];
  medicationName: MedicationName;
  className?: string;
}

// Meias-vidas aproximadas em DIAS
const HALF_LIVES: Record<string, number> = {
    'Mounjaro': 5,      // Tirzepatida (~116 horas)
    'Ozempic': 7,       // Semaglutida (~165-168 horas)
    'Wegovy': 7,        // Semaglutida
    'Saxenda': 0.54,    // Liraglutida (~13 horas)
    'Other': 7          // Fallback
};

const parseDose = (doseStr: string): number => {
    // Converte "2,5 mg" -> 2.5
    const cleanStr = doseStr.replace(',', '.').replace(/[^\d.]/g, '');
    return parseFloat(cleanStr) || 0;
};

// Gera dados diários para o gráfico
const generateData = (history: ApplicationEntry[], medName: string) => {
    if (history.length === 0) return [];

    const halfLife = HALF_LIVES[medName] || 7;
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Determinar janela de tempo (30 dias atrás até 14 dias no futuro)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14);

    const data = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        let totalLevel = 0;

        // Somar contribuição de cada dose aplicada ANTES ou NO dia atual
        sortedHistory.forEach(entry => {
            const doseDate = new Date(entry.date);
            doseDate.setHours(0,0,0,0);
            
            // Se a dose foi tomada antes ou no dia do cálculo
            if (doseDate <= currentDate) {
                const doseValue = parseDose(entry.dose);
                const timeDiff = currentDate.getTime() - doseDate.getTime();
                const daysElapsed = timeDiff / (1000 * 3600 * 24);
                
                // Fórmula de Decaimento Exponencial: Q(t) = Q0 * (1/2)^(t/h)
                const remaining = doseValue * Math.pow(0.5, daysElapsed / halfLife);
                
                // Ignorar traços insignificantes (< 0.01) para performance
                if (remaining > 0.01) {
                    totalLevel += remaining;
                }
            }
        });

        data.push({
            date: currentDate.toISOString(),
            level: parseFloat(totalLevel.toFixed(2)),
            displayDate: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            isToday: currentDate.getTime() === today.getTime()
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
};

// --- Modal de Informações ---
const MedicationInfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <Portal>
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-sm max-h-[85vh] rounded-[32px] p-0 shadow-2xl relative overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header Fixo */}
                <div className="p-6 pb-2 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                            <SyringeIcon className="w-6 h-6" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Estimativas de Nível</h2>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Rolável */}
                <div className="overflow-y-auto px-6 space-y-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed custom-scrollbar pb-6">
                    <p>
                        Os níveis de medicação fornecidos neste aplicativo são estimativas calculadas usando princípios farmacocinéticos estabelecidos. Nossos cálculos são baseados em estudos revisados por pares e dados oficiais de farmacologia clínica.
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Como é Calculado:</h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                <span><strong>Meia-vida:</strong> Consideramos a meia-vida do medicamento — a duração necessária para a concentração reduzir pela metade.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                <span><strong>Dosagem e Frequência:</strong> As estimativas levam em conta o acúmulo da substância no corpo com base nas datas e doses que você registrou.</span>
                            </li>
                        </ul>
                    </div>

                    <p>
                        Essas estimativas fornecem uma indicação geral, mas não levam em conta variações individuais no metabolismo, condições de saúde ou outros fatores pessoais.
                    </p>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">Fontes e Leituras:</h3>
                        <ul className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400">
                            <li>• Revisão de Farmacologia Clínica do FDA</li>
                            <li>• Informações de Bula do FDA (Ozempic/Mounjaro)</li>
                            <li>• Estudos Clínicos PubMed</li>
                        </ul>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                        <p className="text-[11px] text-red-800 dark:text-red-300 font-medium leading-tight">
                            <strong>Aviso:</strong> As respostas individuais podem variar. Estas estimativas são apenas para fins informativos e não substituem aconselhamento médico profissional.
                        </p>
                    </div>
                </div>

                {/* Footer Fixo */}
                <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] flex-shrink-0">
                    <button onClick={onClose} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-2xl active:scale-95 transition-transform shadow-lg">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    </Portal>
);

export const MedicationLevelChart: React.FC<MedicationLevelChartProps> = ({ history, medicationName, className }) => {
    const { theme } = useAppContext();
    const [showInfo, setShowInfo] = useState(false);
    const data = useMemo(() => generateData(history, medicationName), [history, medicationName]);
    const currentLevel = data.find(d => d.isToday)?.level || 0;

    if (data.length === 0) return null;

    return (
        <div className={`relative ${className}`}>
            <div className="flex justify-between items-end mb-4 px-2">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nível de Medicação</p>
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInfo(true); }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <InfoIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{currentLevel.toFixed(2)}</span>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">mg</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Ativo
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-40 w-full relative z-10 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#e5e7eb'} strokeOpacity={0.5} />
                        
                        <XAxis 
                            dataKey="displayDate" 
                            tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 500 }} 
                            axisLine={false} 
                            tickLine={false} 
                            interval={6}
                            dy={10}
                        />
                        <YAxis 
                            tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 500 }} 
                            axisLine={false} 
                            tickLine={false}
                            domain={[0, 'auto']}
                        />
                        
                        <Tooltip 
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                            contentStyle={{ 
                                backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px',
                                padding: '8px 12px'
                            }}
                            labelStyle={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginBottom: '2px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                            itemStyle={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}
                            formatter={(value: number) => [`${value} mg`, '']}
                            labelFormatter={(label) => `${label}`}
                        />

                        {/* Linha de Hoje */}
                        <ReferenceLine 
                            x={data.find(d => d.isToday)?.displayDate} 
                            stroke="#ef4444" 
                            strokeDasharray="3 3" 
                            strokeOpacity={0.6}
                        />

                        <Area 
                            type="monotone" 
                            dataKey="level" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorLevel)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {showInfo && <MedicationInfoModal onClose={() => setShowInfo(false)} />}
        </div>
    );
};
