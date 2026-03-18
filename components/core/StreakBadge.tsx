
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import Portal from './Portal';

export const StreakBadge: React.FC<{className?: string}> = ({ className }) => {
    const { userData } = useAppContext();
    const [showAnimation, setShowAnimation] = useState(false);
    
    if (!userData) return null;

    const hasStreak = userData.streak > 0;

    const handleToggleAnimation = () => {
        if (hasStreak) {
            setShowAnimation(true);
            setTimeout(() => setShowAnimation(false), 3000); // Show for 3 seconds
        }
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

            {showAnimation && (
                <Portal>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
                        <div className="relative scale-[4] md:scale-[6] animate-pop-in">
                            <div className="flame-container">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path className="flame-outer" d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 12 2 12 2C12 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" fill="#FF4D00"/>
                                    <path className="flame-inner" d="M12 20C14.7614 20 17 17.7614 17 15C17 12.2386 12 7 12 7C12 7 7 12.2386 7 15C7 17.7614 9.23858 20 12 20Z" fill="#FF9500"/>
                                    <path className="flame-core" d="M12 18C13.6569 18 15 16.6569 15 15C15 13.3431 12 10 12 10C12 10 9 13.3431 9 15C9 16.6569 10.3431 18 12 18Z" fill="#FFD600"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    )
}
