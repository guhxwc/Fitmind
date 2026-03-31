
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import Portal from './Portal';

export const StreakBadge: React.FC<{className?: string}> = ({ className }) => {
    const { userData } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    
    if (!userData) return null;

    const hasStreak = userData.streak > 0;

    const handleToggleAnimation = () => {
        setShowModal(true);
    };

    return (
        <>
            <div 
                onClick={handleToggleAnimation}
                className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full shadow-sm transition-all duration-300 cursor-pointer active:scale-95 ${
                    hasStreak 
                        ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400' 
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                } ${className}`}
            >
                <div className={`${hasStreak ? 'animate-pulse' : ''}`}>
                    <svg className={`w-5 h-5 ${hasStreak ? 'drop-shadow-sm' : 'grayscale opacity-50'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Sparkles */}
                        <path d="M18 4L18.5 5.5L20 6L18.5 6.5L18 8L17.5 6.5L16 6L17.5 5.5L18 4Z" fill={hasStreak ? "#FFB300" : "#9CA3AF"} />
                        <path d="M6 8L6.5 9.5L8 10L6.5 10.5L6 12L5.5 10.5L4 10L5.5 9.5L6 8Z" fill={hasStreak ? "#FFB300" : "#9CA3AF"} />
                        
                        {/* Main Flame */}
                        <path d="M12 2C12 2 5 8.5 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 8.5 12 2 12 2Z" fill={hasStreak ? "url(#cuteFireGradBadge)" : "#D1D5DB"}/>
                        <path d="M12 8.5C12 8.5 8 12.5 8 16C8 18.21 9.79 20 12 20C14.21 20 16 18.21 16 16C16 12.5 12 8.5 12 8.5Z" fill={hasStreak ? "#FFD700" : "#9CA3AF"}/>
                        <path d="M12 13C12 13 10 15 10 16.5C10 17.6 10.9 18.5 12 18.5C13.1 18.5 14 17.6 14 16.5C14 15 12 13 12 13Z" fill={hasStreak ? "#FFF4D2" : "#D1D5DB"}/>
                        
                        {hasStreak && (
                            <defs>
                                <linearGradient id="cuteFireGradBadge" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#FFB300" />
                                    <stop offset="35%" stopColor="#FF6B00" />
                                    <stop offset="100%" stopColor="#E61A00" />
                                </linearGradient>
                            </defs>
                        )}
                    </svg>
                </div>
                <span className={`text-sm font-bold font-mono leading-none ${hasStreak ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                    {userData.streak}
                </span>
            </div>

            {showModal && (
                <Portal>
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                            onClick={() => setShowModal(false)}
                        />
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl p-8 max-w-sm w-full mx-auto relative overflow-hidden flex flex-col items-center animate-pop-in">
                            {/* Brilho de fundo decorativo do fogo */}
                            <div className="absolute top-0 left-0 w-full h-48 bg-glow pointer-events-none"></div>

                            {/* Área da Animação do Fogo (SVG) */}
                            <div className="relative w-32 h-32 flex items-center justify-center mb-4 z-10 flame-container">
                                <svg width="100%" height="100%" viewBox="0 0 24 24" className="overflow-visible">
                                    <defs>
                                        <linearGradient id="fireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#FFB300" />
                                            <stop offset="35%" stopColor="#FF6B00" />
                                            <stop offset="100%" stopColor="#E61A00" />
                                        </linearGradient>
                                    </defs>
                                    <path className="flame-outer" fill="url(#fireGrad)" 
                                          d="M12 2C12 2 5 8.5 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 8.5 12 2 12 2Z" />
                                    <path className="flame-inner" fill="#FFD700" 
                                          d="M12 8.5C12 8.5 8 12.5 8 16C8 18.21 9.79 20 12 20C14.21 20 16 18.21 16 16C16 12.5 12 8.5 12 8.5Z" />
                                    <path className="flame-core" fill="#FFF4D2" 
                                          d="M12 13C12 13 10 15 10 16.5C10 17.6 10.9 18.5 12 18.5C13.1 18.5 14 17.6 14 16.5C14 15 12 13 12 13Z" />
                                </svg>
                            </div>

                            {/* Título */}
                            <h2 className="text-[1.65rem] font-extrabold text-gray-800 dark:text-white tracking-tight text-center relative z-10">
                                {hasStreak ? `${userData.streak} ${userData.streak === 1 ? 'Dia' : 'Dias'} de Sequência!` : 'Comece sua sequência'}
                            </h2>

                            {/* Componente dos Dias da Semana */}
                            <div className="flex justify-between w-full mt-8 mb-2 px-1 z-10">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => {
                                    const today = new Date().getDay();
                                    const isToday = idx === today;
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-3 relative">
                                            <span className={`text-xs font-bold ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>{day}</span>
                                            <div className="relative">
                                                {isToday && <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-25"></div>}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                                                    isToday 
                                                        ? 'bg-orange-50 border-2 border-dashed border-orange-400' 
                                                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                                                }`}>
                                                    {isToday && <div className="w-2 h-2 rounded-full bg-orange-300"></div>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Descrição */}
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center leading-relaxed mt-5 px-3 z-10 font-medium">
                                {hasStreak 
                                    ? 'Incrível! Continue mantendo sua rotina saudável.' 
                                    : 'Faça seu primeiro registro hoje e comece sua sequência!'}
                            </p>

                            {/* Botão Continuar */}
                            <button 
                                onClick={() => setShowModal(false)}
                                className="mt-8 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(255,92,0,0.6)] active:scale-[0.97] z-10"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    )
}
