
import React, { useState } from 'react';
import { CheckCircleIcon, StarIcon, ShieldCheckIcon, LockIcon } from './core/Icons';
import { PaymentPage } from './PaymentPage';
import { PreSubscriptionPage } from './PreSubscriptionPage';
import Portal from './core/Portal';

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
                Melhor Escolha
            </div>
        )}
        <div className="flex justify-between items-center">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <p className={`font-bold text-lg ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{title}</p>
                    {savings && <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-md">{savings}</span>}
                </div>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{price}</p>
                </div>
                {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{subtext}</p>}
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
        </div>
    </div>
);


export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onClose, onSubscribe }) => {
  const [showShowcase, setShowShowcase] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [showCheckout, setShowCheckout] = useState(false);

  // Use Portal to break out of any parent container limitations
  return (
    <Portal>
        {showShowcase ? (
            <PreSubscriptionPage 
                onClose={onClose} 
                onContinue={() => setShowShowcase(false)} 
            />
        ) : showCheckout ? (
            <PaymentPage 
                plan={selectedPlan}
                onClose={() => setShowCheckout(false)}
                onPaymentSuccess={() => onSubscribe(selectedPlan)}
            />
        ) : (
            <div className="fixed inset-0 bg-white dark:bg-black z-[70] animate-fade-in flex flex-col h-[100dvh]">
                {/* Top Actions */}
                <div className="flex items-center justify-between p-4 flex-none border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black z-20">
                    <button onClick={() => setShowShowcase(true)} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        <span className="text-xs font-bold">Voltar</span>
                    </button>
                    <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto hide-scrollbar bg-white dark:bg-black">
                    <div className="p-6 pt-8 pb-40 space-y-8 max-w-md mx-auto">
                        
                        {/* Hero Section */}
                        <div className="text-center flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-500/30 mb-6 animate-pop-in">
                                <StarIcon className="w-3 h-3 fill-white" />
                                Teste Grátis por 7 Dias
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                                Escolha seu plano
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-3 text-base max-w-xs mx-auto leading-relaxed">
                                Comece hoje sem pagar nada. Cancele quando quiser.
                            </p>
                        </div>

                        {/* Plans */}
                        <div className="space-y-4">
                            <PlanOption
                                title="Anual"
                                price="R$ 32,40 / mês"
                                subtext="35% OFF comparado ao mensal"
                                isPopular
                                savings="Economize 35%"
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

                        {/* Benefits List */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Tudo incluso no PRO</h3>
                            <ul className="space-y-4">
                                <FeatureItem><strong>Registro de Doses:</strong> Controle histórico de aplicações</FeatureItem>
                                <FeatureItem><strong>CalorieCam:</strong> Nutrição automática por foto</FeatureItem>
                                <FeatureItem><strong>Personal Trainer IA:</strong> Treinos adaptativos</FeatureItem>
                                <FeatureItem><strong>Análise Inteligente:</strong> Relatórios de progresso</FeatureItem>
                                <FeatureItem><strong>Fotos:</strong> Comparativo Antes x Depois</FeatureItem>
                            </ul>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>Pagamento seguro via loja de aplicativos</span>
                        </div>
                        
                    </div>
                </div>
                
                {/* Sticky Footer */}
                <div className="flex-none p-6 pt-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-30 w-full">
                    <div className="max-w-md mx-auto">
                        <button 
                            onClick={() => setShowCheckout(true)} 
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl active:scale-[0.98] transition-transform flex flex-col items-center justify-center leading-tight relative overflow-hidden"
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]"></div>
                            
                            <span>Começar 7 Dias Grátis</span>
                            <span className="text-[10px] opacity-70 font-medium uppercase tracking-wider mt-0.5">
                                {selectedPlan === 'annual' 
                                    ? 'Depois R$ 388,80/ano (R$ 32,40/mês)' 
                                    : 'Depois R$ 49,90/mês'}
                            </span>
                        </button>
                        <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-3 px-4 leading-tight">
                            Teste sem riscos. Cancele antes do fim dos 7 dias para não ser cobrado.
                        </p>
                    </div>
                </div>
            </div>
        )}
    </Portal>
  );
};
