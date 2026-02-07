import React from 'react';
import { CheckCircleIcon, StarIcon, LockIcon } from './core/Icons';

interface ProFeatureModalProps {
    title: string;
    onClose: () => void;
    onUnlock: () => void;
}

export const ProFeatureModal: React.FC<ProFeatureModalProps> = ({ title, onClose, onUnlock }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 w-full max-w-sm text-center animate-pop-in relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                    <LockIcon className="w-8 h-8"/>
                </div>
                
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                    Desbloqueie {title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    Este é um recurso exclusivo do FitMind PRO. Assine para acessar todas as ferramentas avançadas.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 my-6 text-left space-y-3">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Registro Ilimitado</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Inteligência Artificial</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Análises Completas</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={onUnlock} className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                        Ver Planos e Preços
                    </button>
                    <button onClick={onClose} className="w-full text-gray-500 dark:text-gray-400 py-2 font-medium text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                        Agora não
                    </button>
                </div>
            </div>
        </div>
    );
};