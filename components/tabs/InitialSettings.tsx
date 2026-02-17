
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { ChevronLeftIcon } from '../core/Icons';

export const InitialSettings: React.FC = () => {
    const { userData, setUserData } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Date State
    const [day, setDay] = useState<string>('');
    const [month, setMonth] = useState<string>('');
    const [year, setYear] = useState<string>('');

    // Weight State
    const [weight, setWeight] = useState<number>(userData?.startWeight || 80);
    const [isMetric, setIsMetric] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Constants
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // Last 10 years
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

    // Constants for Ruler
    const minWeight = 30; 
    const maxWeight = 250;
    const stepSize = 10; // pixels per 0.1kg

    // Initialize Data
    useEffect(() => {
        if (userData?.startWeightDate) {
            const [y, m, d] = userData.startWeightDate.split('-');
            setYear(y);
            setMonth(String(parseInt(m) - 1));
            setDay(String(parseInt(d)));
        } else {
            const now = new Date();
            setYear(String(now.getFullYear()));
            setMonth(String(now.getMonth()));
            setDay(String(now.getDate()));
        }
    }, [userData]);

    // Initialize Ruler Position
    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                const stepsFromMin = (weight - minWeight) * 10;
                const pixelOffset = stepsFromMin * stepSize;
                scrollRef.current.scrollLeft = pixelOffset;
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []); 

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const stepsFromMin = scrollLeft / stepSize;
        const rawWeight = minWeight + (stepsFromMin / 10);
        
        const roundedWeight = Math.round(rawWeight * 10) / 10;
        if (roundedWeight >= minWeight && roundedWeight <= maxWeight) {
            setWeight(roundedWeight);
        }
    };

    const handleSave = async () => {
        if (!userData) return;
        setIsSaving(true);

        const formattedDate = `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-${day.padStart(2, '0')}`;

        const { error } = await supabase
            .from('profiles')
            .update({ 
                start_weight: weight,
                start_weight_date: formattedDate
            })
            .eq('id', userData.id);

        if (error) {
            addToast('Erro ao salvar configurações.', 'error');
        } else {
            setUserData({ 
                ...userData, 
                startWeight: weight, 
                startWeightDate: formattedDate 
            });
            addToast('Configurações salvas!', 'success');
            navigate(-1);
        }
        setIsSaving(false);
    };

    const displayedWeight = isMetric ? weight : (weight * 2.20462);
    const unitLabel = isMetric ? 'kg' : 'lbs';

    // Helper for Custom Select
    const DateSelect = ({ label, value, options, onChange, displayValue }: any) => (
        <div className="flex flex-col items-center flex-1">
            <span className="text-xs font-semibold text-gray-400 mb-2">{label}</span>
            <div className="w-full bg-white dark:bg-[#1C1C1E] rounded-2xl h-[56px] flex items-center justify-center relative shadow-sm">
                <span className="text-lg font-bold text-gray-900 dark:text-white pointer-events-none z-0">
                    {displayValue || label}
                </span>
                <svg className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                
                <select 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                >
                    <option value="" disabled>{label}</option>
                    {options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#F2F2F7]/95 dark:bg-black/95 backdrop-blur-md">
                <div className="px-4 h-14 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 dark:text-white">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-[17px] text-gray-900 dark:text-white">Configurações Iniciais</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="flex-grow px-6 py-6 space-y-12">
                
                {/* Date Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Data de Início do Tratamento</h3>
                    <div className="flex gap-3">
                        <DateSelect 
                            label="Dia" 
                            value={day} 
                            options={days.map(d => ({ value: d, label: d }))}
                            onChange={setDay}
                            displayValue={day}
                        />
                        <div className="flex-[1.5]">
                            <DateSelect 
                                label="Mês" 
                                value={month} 
                                options={months.map((m, i) => ({ value: i, label: m }))}
                                onChange={setMonth}
                                displayValue={month !== '' ? months[parseInt(month)] : ''}
                            />
                        </div>
                        <DateSelect 
                            label="Ano" 
                            value={year} 
                            options={years.map(y => ({ value: y, label: y }))}
                            onChange={setYear}
                            displayValue={year}
                        />
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Weight Section */}
                <section className="flex flex-col items-center">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 w-full text-left">Peso Inicial do Tratamento</h3>
                    
                    {/* Toggle */}
                    <div className="bg-white dark:bg-[#1C1C1E] p-1 rounded-lg flex mb-8 shadow-sm">
                        <button 
                            onClick={() => setIsMetric(true)}
                            className={`px-8 py-1.5 rounded-md text-sm font-bold transition-all ${isMetric ? 'bg-[#F2F2F7] dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}
                        >
                            Métrico
                        </button>
                        <button 
                            onClick={() => setIsMetric(false)}
                            className={`px-8 py-1.5 rounded-md text-sm font-bold transition-all ${!isMetric ? 'bg-[#F2F2F7] dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}
                        >
                            Imperial
                        </button>
                    </div>

                    {/* Large Value Display */}
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {displayedWeight.toFixed(1)}
                        </span>
                        <span className="text-xl font-bold text-gray-500">{unitLabel}</span>
                    </div>

                    {/* Ruler Area */}
                    <div className="w-full relative h-32 mt-4">
                        {/* The Black Pill Indicator (Fixed Center) */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                            {/* Pill */}
                            <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg mb-1">
                                {displayedWeight.toFixed(1)} {unitLabel}
                            </div>
                            {/* The line pointing down (Cursor) */}
                            <div className="w-[3px] h-10 bg-black dark:bg-white rounded-full"></div>
                        </div>

                        {/* Scrolling Area */}
                        <div 
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="w-full overflow-x-scroll hide-scrollbar snap-x snap-mandatory flex items-end h-full pt-16 pb-2"
                            style={{ paddingLeft: '50%', paddingRight: '50%' }}
                        >
                            {Array.from({ length: (maxWeight - minWeight) * 10 + 1 }).map((_, i) => {
                                const isKg = i % 10 === 0;
                                const isHalfKg = i % 5 === 0 && !isKg;
                                
                                return (
                                    <div 
                                        key={i} 
                                        className="flex-shrink-0 flex flex-col items-center justify-end h-12 relative"
                                        style={{ width: `${stepSize}px` }}
                                    >
                                        <div 
                                            className={`w-[2px] rounded-full bg-gray-300 dark:bg-gray-600 ${
                                                isKg 
                                                ? 'h-10 bg-gray-400 dark:bg-gray-500' 
                                                : isHalfKg 
                                                    ? 'h-6' 
                                                    : 'h-3'
                                            }`}
                                        ></div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Side Fades for ruler */}
                        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F2F2F7] dark:from-black to-transparent pointer-events-none z-10"></div>
                        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F2F2F7] dark:from-black to-transparent pointer-events-none z-10"></div>
                    </div>
                </section>

            </div>

            {/* Footer */}
            <div className="p-6 bg-[#F2F2F7] dark:bg-black safe-bottom mt-auto">
                <button 
                    onClick={handleSave}
                    disabled={isSaving || !day || !month || !year}
                    className="w-full bg-black dark:bg-white text-white dark:text-black h-[56px] rounded-2xl text-[17px] font-bold shadow-xl active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    );
};
