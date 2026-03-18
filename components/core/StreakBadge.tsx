
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import Portal from './Portal';

export const StreakBadge: React.FC<{className?: string}> = ({ className }) => {
    const { userData } = useAppContext();
    const [showAnimation, setShowAnimation] = useState(false);
    
    const [showModal, setShowModal] = useState(false);
    
    if (!userData) return null;

    const hasStreak = userData.streak > 0;

    const handleToggleAnimation = () => {
        setShowModal(true);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 3000); // Show for 3 seconds
    };

    return (
        <>
            <div 
                onClick={handleToggleAnimation}
                className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full shadow-sm transition-all duration-300 cursor-pointer active:scale-95 ${
                    hasStreak 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 border border-orange-400 text-white shadow-orange-500/30' 
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                } ${className}`}
            >
                <div className={`${hasStreak ? 'animate-pulse' : ''}`}>
                    <svg className={`w-4 h-4 ${hasStreak ? 'fill-white text-white' : 'text-gray-400 dark:text-gray-500'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.5 2C11.5 2 10 5 10 7.5C10 10 12 11.5 12 14C12 16.5 10.5 18.5 8 19.5C11 21.5 15 21 17 18C19 15 18 11.5 16 9C14 6.5 11.5 2 11.5 2Z" fill="currentColor"/>
                        <path d="M9.5 8C9.5 8 8.5 10 8.5 11.5C8.5 13 9.5 14 9.5 15.5C9.5 17 8.5 18.5 7 19C8.5 20 11 19.5 12 18C13 16.5 12.5 14.5 11.5 13C10.5 11.5 9.5 8 9.5 8Z" fill="currentColor" opacity="0.8"/>
                    </svg>
                </div>
                <span className={`text-sm font-bold font-mono leading-none ${hasStreak ? 'text-white' : ''}`}>
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

            {showAnimation && (
                <Portal>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
                        <div className="relative scale-[4] md:scale-[6] animate-pop-in">
                            <div className="flame-container">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                                    <defs>
                                        <linearGradient id="fireGradAnim" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#FFB300" />
                                            <stop offset="35%" stopColor="#FF6B00" />
                                            <stop offset="100%" stopColor="#E61A00" />
                                        </linearGradient>
                                    </defs>
                                    <path className="flame-outer" fill="url(#fireGradAnim)" 
                                          d="M12 2C12 2 5 8.5 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 8.5 12 2 12 2Z" />
                                    <path className="flame-inner" fill="#FFD700" 
                                          d="M12 8.5C12 8.5 8 12.5 8 16C8 18.21 9.79 20 12 20C14.21 20 16 18.21 16 16C16 12.5 12 8.5 12 8.5Z" />
                                    <path className="flame-core" fill="#FFF4D2" 
                                          d="M12 13C12 13 10 15 10 16.5C10 17.6 10.9 18.5 12 18.5C13.1 18.5 14 17.6 14 16.5C14 15 12 13 12 13Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    )
}
