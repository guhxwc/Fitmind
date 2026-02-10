
import React, { useState } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

export const StepStartDate: React.FC<{ onNext: () => void; onBack: () => void; onSelect: (d: string) => void; step: number; total: number }> = ({ onNext, onBack, onSelect, step, total }) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    
    // Estado como string para permitir limpar o campo (input vazio)
    const [d, setD] = useState<string>(new Date().getDate().toString());
    const [m, setM] = useState(new Date().getMonth());
    const [y, setY] = useState(currentYear);

    const handleContinue = () => {
        const day = parseInt(d);
        // Validação básica
        if (!d || isNaN(day) || day < 1 || day > 31) return;

        onSelect(`${y}-${String(m+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        onNext();
    }

    return (
        <OnboardingScreen>
            <OnboardingHeader 
                title="Quando você começou?" 
                subtitle="Se você já iniciou o tratamento, coloque a data da primeira dose. Se vai começar, coloque hoje."
                onBack={onBack}
                step={step}
                totalSteps={total}
            />

            <div className="flex-grow flex flex-col justify-center items-center">
                <div className="flex gap-3 items-center w-full justify-center">
                    <div className="flex flex-col items-center w-[28%]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Dia</span>
                        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl w-full text-center shadow-sm border border-transparent focus-within:border-blue-500 transition-colors h-[72px] flex items-center justify-center">
                            <input 
                                type="number" 
                                min="1" max="31" 
                                value={d} 
                                onChange={(e) => setD(e.target.value)} 
                                className="bg-transparent text-2xl font-bold w-full text-center outline-none text-gray-900 dark:text-white p-0 m-0" 
                                placeholder="DD"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center w-[40%]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Mês</span>
                        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl w-full text-center shadow-sm border border-transparent focus-within:border-blue-500 transition-colors relative h-[72px] flex items-center justify-center">
                            <select 
                                value={m} 
                                onChange={(e) => setM(Number(e.target.value))} 
                                className="bg-transparent text-xl font-bold w-full text-center outline-none appearance-none relative z-10 text-gray-900 dark:text-white border-none p-0 m-0"
                            >
                                {months.map((name, i) => <option key={i} value={i}>{name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col items-center w-[28%]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Ano</span>
                        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl w-full text-center shadow-sm border border-transparent focus-within:border-blue-500 transition-colors h-[72px] flex items-center justify-center">
                            <select 
                                value={y} 
                                onChange={(e) => setY(Number(e.target.value))} 
                                className="bg-transparent text-xl font-bold w-full text-center outline-none appearance-none text-gray-900 dark:text-white border-none p-0 m-0"
                            >
                                {years.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <OnboardingFooter onContinue={handleContinue} disabled={!d || parseInt(d) < 1} />
        </OnboardingScreen>
    );
};
