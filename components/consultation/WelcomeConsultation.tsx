import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

interface WelcomeConsultationProps {
    onStart: () => void;
}

export const WelcomeConsultation: React.FC<WelcomeConsultationProps> = ({ onStart }) => {
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            await onStart();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10">Consultoria Premium</h2>
            <p className="text-gray-500 text-center font-medium">Inicie sua jornada com uma estratégia 100% calculada por especialistas.</p>
            <button 
                onClick={handleStart}
                disabled={loading}
                className="w-full bg-[#007AFF] text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
                {loading ? 'Iniciando...' : (
                    <>
                        <Play className="w-5 h-5 fill-white" />
                        <span>Preencher Anamnese</span>
                    </>
                )}
            </button>
        </div>
    );
};
