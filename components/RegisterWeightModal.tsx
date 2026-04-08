
import React, { useState } from 'react';
import Portal from './core/Portal';
import { useScrollLock } from '../hooks/useScrollLock';
import { useToast } from './ToastProvider';

interface RegisterWeightModalProps {
    onClose: () => void;
    onSave: (weight: number) => void;
}

export const RegisterWeightModal: React.FC<RegisterWeightModalProps> = ({ onClose, onSave }) => {
    const [weight, setWeight] = useState('');
    const { addToast } = useToast();
    useScrollLock(true);
    
    const handleSave = () => {
        if (!weight) return;
        
        const normalizedWeight = weight.replace(',', '.');
        const parsedWeight = parseFloat(normalizedWeight);
        
        if (isNaN(parsedWeight) || parsedWeight <= 0) {
            addToast("Por favor, insira um peso válido maior que zero.", "error");
            return;
        }
        
        onSave(parsedWeight);
    };
    
    return (
        <Portal>
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Registrar Peso</h2>
                    <div className="relative my-8">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full h-24 px-4 text-center text-5xl font-bold bg-gray-100 dark:bg-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            placeholder="0.0"
                            autoFocus
                        />
                        <span className="absolute bottom-4 right-6 text-xl font-bold text-gray-400 dark:text-gray-500 pointer-events-none">kg</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl font-bold text-lg">Cancelar</button>
                        <button onClick={handleSave} disabled={!weight} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg disabled:opacity-50 shadow-lg">Salvar</button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};
