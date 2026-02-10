
import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import type { ApplicationEntry, MedicationName } from '../../types';
import { useAppContext } from '../AppContext';

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

export const MedicationLevelChart: React.FC<MedicationLevelChartProps> = ({ history, medicationName, className }) => {
    const { theme } = useAppContext();
    const data = useMemo(() => generateData(history, medicationName), [history, medicationName]);
    const currentLevel = data.find(d => d.isToday)?.level || 0;

    if (data.length === 0) return null;

    return (
        <div className={`relative ${className}`}>
            <div className="flex justify-between items-end mb-4 px-2">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Nível de Medicação</p>
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
        </div>
    );
};
