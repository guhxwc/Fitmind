
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
                
                {/* Headline Focada em Resultado/Velocidade */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    Quer dobrar a sua velocidade?
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mt-3 text-sm">
                    Seu esforço está dando resultado. O FitMind PRO é a ferramenta para transformar esse bom começo em uma vitória definitiva contra a balança.
                </p>
                
                <div className="flex flex-col gap-3 mt-6">
                    <button onClick={onUnlock} className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                        <StarIcon className="w-5 h-5"/>
                        Desbloquear o Plano PRO
                    </button>
                    <button onClick={onClose} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Agora não
                    </button>
                </div>
            </div>
        </div>
    );
};
