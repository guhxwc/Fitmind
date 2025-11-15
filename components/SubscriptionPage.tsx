import React, { useState } from 'react';
import { CheckCircleIcon, StarIcon } from './core/Icons';

interface SubscriptionPageProps {
  onClose: () => void;
  onSubscribe: (plan: 'annual' | 'monthly') => void;
}

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center space-x-3">
    <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{children}</span>
  </li>
);

const PlanOption: React.FC<{
    title: string;
    price: string;
    subtext?: string;
    isPopular?: boolean;
    savings?: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ title, price, subtext, isPopular, savings, isSelected, onClick }) => (
    <div onClick={onClick} className={`relative p-4 rounded-xl text-left cursor-pointer transition-all duration-200 ${isSelected ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-2 border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'}`}>
        {isPopular && <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">MAIS POPULAR</div>}
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{title}</p>
                <p className="text-gray-700 dark:text-gray-200 font-semibold mt-1">{price}</p>
                {subtext && <p className="text-sm text-gray-500 dark:text-gray-400">{subtext}</p>}
            </div>
            {savings && <p className="font-semibold text-blue-600 dark:text-blue-400 text-right">{savings}</p>}
        </div>
    </div>
);


export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  return (
    <div className="fixed inset-0 bg-white dark:bg-black z-50 animate-fade-in flex flex-col">
        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-end">
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl mx-auto flex items-center justify-center">
                        <StarIcon className="w-8 h-8"/>
                    </div>
                    <header className="mt-4">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">FitMind PRO</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Desbloqueie todo o potencial da sua jornada.</p>
                    </header>
                </div>

                <div className="bg-gray-100/50 dark:bg-gray-800/50 p-6 rounded-2xl text-left">
                    <ul className="space-y-3">
                        <FeatureItem>
                            <strong>CalorieCam:</strong> Reconhecimento de alimentos por IA
                        </FeatureItem>
                        <FeatureItem>Planos de treino completos e personalizados</FeatureItem>
                        <FeatureItem>Dietas avançadas geradas por IA</FeatureItem>
                        <FeatureItem>Gráficos detalhados e projeções</FeatureItem>
                        <FeatureItem>Comparador de fotos de progresso</FeatureItem>
                    </ul>
                </div>

                <div className="space-y-4">
                    <PlanOption
                        title="Anual"
                        price="R$ 18,90 / mês"
                        subtext="cobrado R$ 226,80 por ano"
                        isPopular
                        savings="Economize 53%"
                        isSelected={selectedPlan === 'annual'}
                        onClick={() => setSelectedPlan('annual')}
                    />
                    <PlanOption
                        title="Mensal"
                        price="R$ 39,90 / mês"
                        isSelected={selectedPlan === 'monthly'}
                        onClick={() => setSelectedPlan('monthly')}
                    />
                </div>
            </div>
        </div>
        
        {/* Sticky Footer */}
        <div className="flex-shrink-0 p-6 pt-4 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => onSubscribe(selectedPlan)} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold active:scale-[0.98] transition-transform">
                Assinar Agora
            </button>
            <div className="text-center mt-4">
                <button className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Restaurar Compras</button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">O pagamento será cobrado na sua conta da App Store. A assinatura é renovada automaticamente, a menos que seja cancelada 24 horas antes do final do período.</p>
            </div>
        </div>
    </div>
  );
};