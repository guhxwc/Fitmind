
import React, { useState } from 'react';
import { CheckCircleIcon, StarIcon, ShieldCheckIcon, LockIcon, CoffeeIcon } from './core/Icons';
import { PaymentPage } from './PaymentPage';
import { PreSubscriptionPage } from './PreSubscriptionPage';
import Portal from './core/Portal';
import type { UserData } from '../types';

interface SubscriptionPageProps {
  onClose: () => void;
  onSubscribe: (plan: 'annual' | 'monthly') => void;
  customUserData?: Partial<UserData>; // Add this prop
}

const FeatureItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <li className="flex items-start space-x-3">
    <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5">
        <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
    </div>
    <div>
        <span className="text-gray-900 dark:text-white text-sm font-bold block mb-0.5">{title}</span>
        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium leading-tight">{desc}</span>
    </div>
  </li>
);

const PlanOption: React.FC<{
    title: string;
    price: string;
    subtext?: string;
    isPopular?: boolean;
    savings?: string;
    extraTag?: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ title, price, subtext, isPopular, savings, extraTag, isSelected, onClick }) => (
    <div onClick={onClick} className={`relative p-5 rounded-2xl text-left cursor-pointer transition-all duration-300 ${isSelected ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : 'border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'}`}>
        {isPopular && (
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                Melhor Escolha
            </div>
        )}
        <div className="flex justify-between items-center">
            <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className={`font-bold text-lg ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{title}</p>
                    {savings && <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-md">{savings}</span>}
                    {extraTag && <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><CoffeeIcon className="w-2.5 h-2.5"/> {extraTag}</span>}
                </div>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{price}</p>
                </div>
                {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{subtext}</p>}
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
        </div>
    </div>
);


export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onClose, onSubscribe, customUserData }) => {
  const [showShowcase, setShowShowcase] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [showCheckout, setShowCheckout] = useState(false);
  const [hasTrial, setHasTrial] = useState(false); // Default to FALSE (Pagar Agora)

  const handleSuccess = () => {
      // Set flag to trigger Pro Tour on return to Summary
      localStorage.setItem('trigger_pro_tour', 'true');
      onSubscribe(selectedPlan);
  };

  // Use Portal to break out of any parent container limitations
  return (
    <Portal>
        {showShowcase ? (
            <PreSubscriptionPage 
                onClose={onClose} 
                onContinue={() => setShowShowcase(false)} 
                customUserData={customUserData}
            />
        ) : showCheckout ? (
            <PaymentPage 
                plan={selectedPlan}
                initialHasTrial={hasTrial}
                onClose={() => setShowCheckout(false)}
                onPaymentSuccess={handleSuccess}
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

                <div className="flex-grow overflow-y-auto p-6 pb-40">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
                            <StarIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Escolha seu Plano</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Invista na sua transformação definitiva.</p>
                    </div>

                    <div className="space-y-4">
                        <PlanOption 
                            title="Plano Anual"
                            price="R$ 389,22"
                            subtext="Equivalente a R$ 32,43/mês"
                            isPopular
                            savings="-35% OFF"
                            extraTag="R$ 1,08/dia"
                            isSelected={selectedPlan === 'annual'}
                            onClick={() => setSelectedPlan('annual')}
                        />
                        <PlanOption 
                            title="Plano Mensal"
                            price="R$ 49,00"
                            subtext="Cobrado mensalmente"
                            isSelected={selectedPlan === 'monthly'}
                            onClick={() => setSelectedPlan('monthly')}
                        />
                    </div>

                    {/* Features List */}
                    <div className="mt-8 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">O que está incluído:</h3>
                        <ul className="space-y-4">
                            <FeatureItem title="CalorieCam Ilimitado" desc="Reconhecimento instantâneo de alimentos via IA." />
                            <FeatureItem title="Personal Trainer Adaptativo" desc="Treinos que se ajustam à sua energia diária." />
                            <FeatureItem title="Dieta Anti-Rebote" desc="Planejamento nutricional para manutenção de peso." />
                            <FeatureItem title="Relatórios Avançados" desc="Análise profunda de tendências e correlações." />
                        </ul>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                        <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                        <span>Compra 100% Segura e Criptografada</span>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]"></div>
                        Continuar
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>
            </div>
        )}
    </Portal>
  );
};
