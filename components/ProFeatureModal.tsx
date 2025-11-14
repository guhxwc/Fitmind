
import React from 'react';
import { CheckCircleIcon, StarIcon } from './core/Icons';

interface ProFeatureModalProps {
    title: string;
    onClose: () => void;
    onUnlock: () => void;
}

export const ProFeatureModal: React.FC<ProFeatureModalProps> = ({ title, onClose, onUnlock }) => {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
                <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <StarIcon className="w-8 h-8"/>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Este recurso faz parte do FitMind PRO</h2>
                <p className="text-gray-600 mt-2">
                    Aprimore sua jornada com o recurso <strong>{title}</strong> e muitas outras vantagens.
                </p>

                <ul className="text-left space-y-2 my-6">
                    <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /><span>Planos de Treino e Dieta com IA</span></li>
                    <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /><span>CalorieCam para registrar por foto</span></li>
                    <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /><span>Análises e relatórios avançados</span></li>
                </ul>

                <div className="flex flex-col gap-3">
                    <button onClick={onUnlock} className="w-full bg-black text-white py-3 rounded-xl font-semibold">Desbloquear Agora</button>
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold">Talvez depois</button>
                </div>
            </div>
        </div>
    );
};
