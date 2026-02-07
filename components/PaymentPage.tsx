
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { LockIcon, ShieldCheckIcon } from './core/Icons';
import { useAppContext } from './AppContext';

// Using user-provided TEST keys for sandbox environment.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51STR9hQdX6ANfRVO0hpDkaTDe6Mj0WLrjFsXh57T4TX9fhWEhfWAriLC5s4Ti2WorlL57YYZOS42lhqBuDxc6Cuf003enTSGnn';

// Using user-provided TEST Price IDs.
const PRICE_IDS = {
  annual: 'price_1STlzzQdX6ANfRVOKsrT29TQ',
  monthly: 'price_1STlzZQdX6ANfRVOkyXlfOvr',
};

declare global {
    interface Window {
        Stripe: any;
    }
}

interface PaymentPageProps {
  plan: 'annual' | 'monthly'; // Initial plan preference
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const getCardElementOptions = (isDarkMode: boolean) => ({
    style: {
        base: {
            color: isDarkMode ? '#FFFFFF' : '#111827',
            fontFamily: '"Inter", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: isDarkMode ? '#6b7280' : '#9ca3af',
            },
            iconColor: isDarkMode ? '#FFFFFF' : '#111827',
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
    hidePostalCode: true,
});

export const PaymentPage: React.FC<PaymentPageProps> = ({ plan: initialPlan, onClose, onPaymentSuccess }) => {
  const { userData, session } = useAppContext();
  
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>(initialPlan);
  const [name, setName] = useState(userData?.name || '');
  const [postalCode, setPostalCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cardElementRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<any>(null);
  const cardElement = useRef<any>(null);

  useEffect(() => {
    // Ensure stripe customer exists - mocked for frontend demo
    const init = async () => {
        if (!userData?.stripeCustomerId) {
             try {
                // Mock call or real call if configured
             } catch(e) {
                 console.warn("Stripe setup skipped in demo");
             }
        }
    }
    init();
  }, [userData]);

  useEffect(() => {
    if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = "https://js.stripe.com/v3/";
        script.onload = initStripe;
        document.body.appendChild(script);
    } else {
        initStripe();
    }

    function initStripe() {
        if (!cardElementRef.current) return;
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // Safety check for test key
        if (!STRIPE_PUBLISHABLE_KEY) {
            setError("Chave do Stripe não configurada.");
            return;
        }

        const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        stripeRef.current = stripe;
        const elements = stripe.elements({ locale: 'pt-BR' });
        cardElement.current = elements.create('card', getCardElementOptions(isDarkMode));
        cardElement.current.mount(cardElementRef.current);
        cardElement.current.on('ready', () => setIsStripeLoaded(true));
        cardElement.current.on('change', (event: any) => setError(event.error ? event.error.message : null));
    }

    return () => {
        if (cardElement.current) {
            try { cardElement.current.destroy(); } catch (e) {}
        }
    };
  }, []);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    // MOCK PAYMENT FOR DEMO PURPOSES
    setTimeout(() => {
        onPaymentSuccess();
        setIsProcessing(false);
    }, 2000);
    return; 
  };

  const totalFutureDue = selectedPlan === 'annual' ? 388.80 : 49.90;
  const trialDays = 7;
  const billingDate = new Date();
  billingDate.setDate(billingDate.getDate() + trialDays);
  const billingDateStr = billingDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-black z-[60] overflow-y-auto animate-fade-in font-sans">
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        <LockIcon className="w-3 h-3" />
                        Ambiente Seguro
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Ativar 7 Dias Grátis</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Nenhuma cobrança será feita hoje.</p>
                    </div>

                    {/* Plan Selection (Compact) */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                        <button 
                            onClick={() => setSelectedPlan('annual')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${selectedPlan === 'annual' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white scale-[1.02]' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Anual (-35%)
                        </button>
                        <button 
                            onClick={() => setSelectedPlan('monthly')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${selectedPlan === 'monthly' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white scale-[1.02]' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Mensal
                        </button>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total a pagar hoje</span>
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">R$ 0,00</span>
                        <div className="mt-3 bg-white dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-[10px] text-gray-500 dark:text-gray-300 font-medium">
                                Primeira cobrança de <strong>R$ {totalFutureDue.toFixed(2).replace('.', ',')}</strong> em <strong>{billingDateStr}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white">
                            <div ref={cardElementRef} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Nome no Cartão" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                        <input 
                            type="text" 
                            placeholder="CEP" 
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-bold shadow-xl active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Iniciar Teste Grátis</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </>
                        )}
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-medium">
                        <ShieldCheckIcon className="w-3 h-3" />
                        <span>Pagamento criptografado via Stripe.</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
