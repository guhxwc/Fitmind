import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, TrophyIcon, TrendingDownIcon, TrendingUpIcon, TargetIcon, FlameIcon } from 'lucide-react';
import { useAppContext } from './AppContext';
import confetti from 'canvas-confetti';

export const WeightMilestoneModal: React.FC = () => {
    const { userData, weightMilestoneData, setWeightMilestoneData } = useAppContext();
    const [message, setMessage] = useState<{ title: string; body: string; icon: React.ReactNode; color: string; bgColor: string }>({ title: '', body: '', icon: null, color: '', bgColor: '' });

    useEffect(() => {
        if (weightMilestoneData && userData) {
            const { oldWeight, newWeight } = weightMilestoneData;
            const diff = newWeight - oldWeight;
            const isLoss = diff < 0;
            const absDiff = Math.abs(diff);
            
            const startWeight = userData.startWeight || oldWeight;
            const targetWeight = userData.targetWeight || oldWeight;
            const totalToLose = startWeight - targetWeight;
            const totalLost = startWeight - newWeight;
            
            let percentage = 0;
            if (totalToLose > 0 && startWeight > targetWeight) {
                percentage = (totalLost / totalToLose) * 100;
            }

            let newMsg = { title: '', body: '', icon: <TrendingDownIcon className="w-8 h-8" />, color: 'text-blue-500', bgColor: 'bg-blue-500' };

            if (isLoss) {
                if (percentage >= 100) {
                    newMsg = {
                        title: 'Objetivo Alcançado! 🎉',
                        body: `Incrível! Você atingiu sua meta de ${targetWeight}kg. Você é uma verdadeira inspiração!`,
                        icon: <TrophyIcon className="w-8 h-8" />,
                        color: 'text-yellow-500',
                        bgColor: 'bg-yellow-500'
                    };
                    triggerConfetti();
                } else if (percentage >= 50 && (startWeight - oldWeight) / totalToLose < 0.5) {
                    newMsg = {
                        title: 'Metade do Caminho! 🚀',
                        body: `Você já perdeu ${totalLost.toFixed(1)}kg e chegou na metade do seu objetivo! Continue firme!`,
                        icon: <TargetIcon className="w-8 h-8" />,
                        color: 'text-purple-500',
                        bgColor: 'bg-purple-500'
                    };
                    triggerConfetti();
                } else if (absDiff < 1) {
                    const messages = [
                        `Parabéns, cada grama é essencial! Você eliminou ${absDiff.toFixed(1)}kg.`,
                        `Pequenos passos levam a grandes resultados. Menos ${absDiff.toFixed(1)}kg!`,
                        `O progresso contínuo é o segredo. Você está indo super bem!`,
                        `Menos ${absDiff.toFixed(1)}kg na balança! Continue com o foco.`,
                        `Excelente! Cada dia é uma nova vitória. Menos ${absDiff.toFixed(1)}kg!`
                    ];
                    newMsg = {
                        title: 'Progresso Registrado!',
                        body: messages[Math.floor(Math.random() * messages.length)],
                        icon: <FlameIcon className="w-8 h-8" />,
                        color: 'text-orange-500',
                        bgColor: 'bg-orange-500'
                    };
                } else {
                    const messages = [
                        `Incrível! Você perdeu ${absDiff.toFixed(1)}kg desde a última pesagem.`,
                        `Uau! ${absDiff.toFixed(1)}kg a menos. Seu esforço está valendo a pena!`,
                        `Que resultado fantástico! Continue assim, você está voando!`,
                        `Menos ${absDiff.toFixed(1)}kg! O seu corpo está respondendo muito bem.`,
                        `Excelente trabalho! A consistência traz resultados: menos ${absDiff.toFixed(1)}kg.`
                    ];
                    newMsg = {
                        title: 'Ótimo Resultado! 🌟',
                        body: messages[Math.floor(Math.random() * messages.length)],
                        icon: <TrendingDownIcon className="w-8 h-8" />,
                        color: 'text-green-500',
                        bgColor: 'bg-green-500'
                    };
                    triggerConfetti();
                }
            } else if (diff > 0) {
                const messages = [
                    `O peso pode flutuar. Mantenha o foco, o importante é a consistência!`,
                    `Pequenos ganhos fazem parte do processo. Vamos voltar ao plano!`,
                    `Não desanime! Flutuações de água e músculo são normais.`,
                    `Um dia de cada vez. O importante é não desistir agora!`,
                    `Lembre-se: a jornada não é linear. Continue firme no seu propósito!`
                ];
                newMsg = {
                    title: 'Mantenha o Foco!',
                    body: messages[Math.floor(Math.random() * messages.length)],
                    icon: <TrendingUpIcon className="w-8 h-8" />,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-500'
                };
            } else {
                newMsg = {
                    title: 'Peso Mantido!',
                    body: 'Você manteve o seu peso. A consistência é a chave para o sucesso a longo prazo.',
                    icon: <TargetIcon className="w-8 h-8" />,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-500'
                };
            }

            setMessage(newMsg);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weightMilestoneData]);

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999
        });
    };

    if (!weightMilestoneData || !userData?.isPro) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full relative overflow-hidden border border-white/20"
                >
                    {/* Decorative background blur */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${message.bgColor}`} />
                    <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${message.bgColor}`} />

                    <button
                        onClick={() => setWeightMilestoneData(null)}
                        className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors z-10"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center mt-4 relative z-10">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-800 shadow-inner ${message.color}`}>
                            {message.icon}
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                            {message.title}
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            {message.body}
                        </p>

                        <div className="flex items-center justify-center space-x-4 mb-6 w-full">
                            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl flex-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Anterior</span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{weightMilestoneData.oldWeight.toFixed(1)}<span className="text-sm text-gray-500">kg</span></span>
                            </div>
                            <div className="text-gray-300 dark:text-gray-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl flex-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Atual</span>
                                <span className={`text-lg font-semibold ${message.color}`}>{weightMilestoneData.newWeight.toFixed(1)}<span className="text-sm opacity-70">kg</span></span>
                            </div>
                        </div>

                        <button
                            onClick={() => setWeightMilestoneData(null)}
                            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-transform active:scale-95 ${message.bgColor} hover:opacity-90 shadow-lg`}
                        >
                            Continuar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
