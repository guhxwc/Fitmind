import React from 'react';
import { StarIcon } from './core/Icons';

interface ProUpsellModalProps {
    onClose: () => void;
    onUnlock: () => void;
}

export const ProUpsellModal: React.FC<ProUpsellModalProps> = ({ onClose, onUnlock }) => {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm text-center animate-pop-in" onClick={(e) => e.stopPropagation()}>
                <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 text-white dark:text-black rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Você está no caminho certo!</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Seu progresso é inspirador. Aprimore ainda mais sua jornada com o FitMind PRO.
                </p>
                <div className="flex flex-col gap-3 mt-6">
                    <button onClick={onUnlock} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                        <StarIcon className="w-5 h-5"/>
                        Ver Vantagens do PRO
                    </button>
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold">Agora não</button>
                </div>
            </div>
        </div>
    );
};