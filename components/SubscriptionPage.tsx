
import React, { useState } from 'react';
import { CheckCircleIcon, StarIcon, ShieldCheckIcon } from './core/Icons';

interface SubscriptionPageProps {
  onClose: () => void;
  onSubscribe: (plan: 'annual' | 'monthly') => void;
}

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start space-x-3">
    <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5">
        <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
    </div>
    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-tight">{children}</span>
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
    <div onClick={onClick} className={`relative p-5 rounded-2xl text-left cursor-pointer transition-all duration-300 ${isSelected ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : 'border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'}`}>
        {isPopular && (
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                Recomendado
            </div>
        )}
        <div className="flex justify-between items-center">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <p className={`font-bold text-lg ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{title}</p>
                    {savings && <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-md">{savings}</span>}
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{price}</p>
                {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{subtext}</p>}
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
        </div>
    </div>
);


export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  return (
    <div className="fixed inset-0 bg-white dark:bg-black z-50 animate-fade-in flex flex-col">
        {/* Top Actions */}
        <div className="flex items-center justify-end p-4 absolute top-0 right-0 z-20">
            <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto hide-scrollbar">
            <div className="p-6 pt-12 pb-24 space-y-8">
                
                {/* Hero Section */}
                <div className="text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-500/30 mb-6 animate-pop-in">
                        <StarIcon className="w-3 h-3 fill-white" />
                        7 Dias Grátis
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                        FitMind <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">PRO</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg max-w-xs mx-auto leading-relaxed">
                        Acelere seus resultados com Inteligência Artificial e anulações ilimitadas.
                    </p>
                </div>

                {/* Benefits List */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Tudo incluído</h3>
                    <ul className="space-y-4">
                        <FeatureItem><strong>CalorieCam Ilimitado:</strong> Registre refeições por foto</FeatureItem>
                        <FeatureItem><strong>Personal Trainer IA:</strong> Treinos adaptativos semanais</FeatureItem>
                        <FeatureItem><strong>Nutricionista IA:</strong> Dietas flexíveis e receitas</FeatureItem>
                        <FeatureItem><strong>Relatórios Avançados:</strong> Análise de progresso</FeatureItem>
                        <FeatureItem><strong>Fotos Comparativas:</strong> Antes e depois lado a lado</FeatureItem>
                    </ul>
                </div>

                {/* Plans */}
                <div className="space-y-4">
                    <PlanOption
                        title="Anual"
                        price="R$ 34,90 / mês"
                        subtext="Cobrado R$ 418,80 por ano"
                        isPopular
                        savings="Economize 30%"
                        isSelected={selectedPlan === 'annual'}
                        onClick={() => setSelectedPlan('annual')}
                    />
                    <PlanOption
                        title="Mensal"
                        price="R$ 49,90 / mês"
                        isSelected={selectedPlan === 'monthly'}
                        onClick={() => setSelectedPlan('monthly')}
                    />
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Cancelamento fácil a qualquer momento</span>
                </div>
                
                {/* Developer / Test Option */}
                <button 
                    onClick={() => onSubscribe('annual')} 
                    className="w-full text-center py-2 text-sm text-blue-500 hover:text-blue-600 font-medium opacity-80"
                >
                    Ativar Modo Teste (Desenvolvedor)
                </button>
            </div>
        </div>
        
        {/* Sticky Footer */}
        <div className="flex-shrink-0 p-6 pt-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 absolute bottom-0 left-0 right-0 z-10">
            <button 
                onClick={() => onSubscribe(selectedPlan)} 
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl active:scale-[0.98] transition-transform flex flex-col items-center justify-center leading-tight"
            >
                <span>Começar 7 Dias Grátis</span>
                <span className="text-[10px] opacity-70 font-medium uppercase tracking-wider mt-0.5">
                    Depois R$ {selectedPlan === 'annual' ? '418,80/ano' : '49,90/mês'}
                </span>
            </button>
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-3 px-4 leading-tight">
                Você não será cobrado até o fim do período de teste. Cancele nas configurações da loja pelo menos 24h antes.
            </p>
        </div>
    </div>
  );
};
