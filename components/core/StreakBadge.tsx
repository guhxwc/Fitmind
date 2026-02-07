
import React from 'react';
import { useAppContext } from '../AppContext';
import { FlameIcon } from './Icons';

export const StreakBadge: React.FC<{className?: string}> = ({ className }) => {
    const { userData } = useAppContext();
    
    if (!userData) return null;

    const hasStreak = userData.streak > 0;

    return (
        <div className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full shadow-sm transition-all duration-300 ${
            hasStreak 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 border border-orange-400 text-white shadow-orange-500/30' 
                : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
        } ${className}`}>
            <div className={`${hasStreak ? 'animate-pulse' : ''}`}>
                <FlameIcon className={`w-4 h-4 ${hasStreak ? 'fill-white text-white' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
            <span className={`text-sm font-bold font-mono leading-none ${hasStreak ? 'text-white' : ''}`}>
                {userData.streak}
            </span>
        </div>
    )
}
