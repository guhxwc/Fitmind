
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { LockIcon, ShieldCheckIcon, CheckCircleIcon, UserCircleIcon, CalendarIcon } from './core/Icons';
import { useAppContext } from './AppContext';

// CONFIGURAÇÃO STRIPE
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51STR9hQdX6ANfRVOFjGLFqO7MYNey2yZVVSDAoLl1irRvrPcc0nJs12XcDLx3jK9oBALnyUwrbKG6Qzq3BivCp3t006nJgpvwS';

const STRIPE_PRICES = {
    monthly: 'price_1SyGAmQdX6ANfRVOv6WAl27c',
    annual: 'price_1SyGFsQdX6ANfRVOkKskMwZ7'
};

declare global {
    interface Window {
        Stripe: any;
    }
}

interface PaymentPageProps {
  plan: 'annual' | 'monthly';
  initialHasTrial?: boolean; // Nova prop
  onClose: () => void;
  onPaymentSuccess: () => void;
}

// Ícones locais para esta tela
const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

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
            iconColor: isDarkMode ? '#FFFFFF' : '#6b7280',
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
    hidePostalCode: true,
});

export const PaymentPage: React.FC<PaymentPageProps> = ({ plan: initialPlan, initialHasTrial = false, onClose, onPaymentSuccess }) => {
  const { userData, session } = useAppContext();
  
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>(initialPlan);
  const [paymentMethodType, setPaymentMethodType] = useState<'credit' | 'debit'>('credit');
  const [hasTrial, setHasTrial] = useState(initialHasTrial); // Inicializa com a prop
  const [name, setName] = useState(userData?.name || '');
  const [postalCode, setPostalCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cardElementRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<any>(null);
  const cardElement = useRef<any>(null);

  // Cálculos de preço
  const priceValue = selectedPlan === 'annual' ? 389.22 : 49.00;
  const priceFormatted = `R$ ${priceValue.toFixed(2).replace('.', ',')}`;
  const priceLabel = selectedPlan === 'annual' ? `${priceFormatted} / ano` : `${priceFormatted} / mês`;
  const savingsLabel = selectedPlan === 'annual' ? 'Economia de 35%' : null;
  
  const trialDays = 7;
  const billingDate = new Date();
  if (hasTrial) {
      billingDate.setDate(billingDate.getDate() + trialDays);
  }
  const billingDateStr = billingDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

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
        
        if (!STRIPE_PUBLISHABLE_KEY) {
            setError("Chave pública do Stripe não configurada.");
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
    if (!stripeRef.current || !cardElement.current) return;
    
    // Validação básica frontend
    if (!name.trim()) { setError("Por favor, digite o nome impresso no cartão."); return; }
    if (!postalCode.trim()) { setError("Por favor, digite o CEP."); return; }

    const priceId = selectedPlan === 'annual' ? STRIPE_PRICES.annual : STRIPE_PRICES.monthly;

    if (!priceId) {
        setError("Erro interno: Plano não configurado.");
        return;
    }

    setIsProcessing(true);
    setError(null);

    try {
        // 1. Criar Assinatura no Backend (Edge Function)
        const { data, error: functionError } = await supabase.functions.invoke('create-payment-intent', {
            body: { 
                priceId: priceId, 
                email: session?.user?.email,
                userId: userData?.id,
                hasTrial: hasTrial // Envia a escolha do usuário
            }
        });

        if (functionError) {
            console.error('Edge Function Error:', functionError);
            let msg = 'Erro de conexão com o servidor de pagamento.';
            if (functionError.code === 'FUNCTIONS_HTTP_STATUS_404' || functionError.status === 404) {
                msg = 'Serviço de pagamento indisponível (404). Verifique se a função foi implantada.';
            } else if (functionError.code === 'FUNCTIONS_HTTP_STATUS_500' || functionError.status === 500) {
                msg = 'Erro interno do servidor. Tente novamente mais tarde.';
            }
            throw new Error(msg);
        }

        const { clientSecret, type } = data; 

        if (!clientSecret) {
            throw new Error('Erro na inicialização do pagamento. Chave secreta não recebida.');
        }

        // 2. Confirmar com a Stripe
        const result = await (type === 'setup' 
            ? stripeRef.current.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: cardElement.current,
                    billing_details: { name: name, address: { postal_code: postalCode } }
                }
            })
            : stripeRef.current.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement.current,
                    billing_details: { name: name, address: { postal_code: postalCode } }
                }
            })
        );

        if (result.error) {
            throw result.error;
        } else {
            onPaymentSuccess();
        }

    } catch (e: any) {
        let msg = e.message || "Ocorreu um erro inesperado.";

        // TRATAMENTO DE ERROS DO STRIPE (Mensagens em Português)
        if (e.code) {
            switch (e.code) {
                case 'card_declined':
                    if (e.decline_code === 'insufficient_funds') {
                        msg = "Pagamento recusado: Saldo insuficiente.";
                    } else if (e.decline_code === 'lost_card') {
                        msg = "Pagamento recusado: Cartão marcado como perdido.";
                    } else if (e.decline_code === 'stolen_card') {
                        msg = "Pagamento recusado: Cartão marcado como roubado.";
                    } else if (e.decline_code === 'do_not_honor') {
                        msg = "Pagamento recusado pelo banco emissor. Entre em contato com seu banco.";
                    } else {
                        msg = "Seu cartão foi recusado. Verifique os dados ou tente outro cartão.";
                    }
                    break;
                case 'expired_card':
                    msg = "Seu cartão está expirado.";
                    break;
                case 'incorrect_cvc':
                    msg = "O código de segurança (CVC) está incorreto.";
                    break;
                case 'incorrect_number':
                    msg = "O número do cartão é inválido.";
                    break;
                case 'processing_error':
                    msg = "Erro ao processar o cartão. Tente novamente mais tarde.";
                    break;
                case 'incomplete_number':
                    msg = "Preencha o número do cartão corretamente.";
                    break;
                case 'incomplete_expiry':
                    msg = "Preencha a data de validade corretamente.";
                    break;
                case 'incomplete_cvc':
                    msg = "Preencha o código CVC corretamente.";
                    break;
                default:
                    msg = e.message;
            }
        }

        setError(msg);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-black z-[80] overflow-y-auto animate-fade-in font-sans">
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Pagamento Seguro</h2>
                        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mt-1">
                            <LockIcon className="w-3 h-3" />
                            Ambiente Criptografado
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-6">
                    
                    {/* Trial Toggle Option (Discreet Version) */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button 
                                onClick={() => setHasTrial(true)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${hasTrial ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                7 Dias Grátis
                            </button>
                            <button 
                                onClick={() => setHasTrial(false)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!hasTrial ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Pagar Agora
                            </button>
                        </div>
                    </div>

                    {/* Plan Summary Card */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 mb-6 flex justify-between items-center relative overflow-hidden">
                        <div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Você selecionou</p>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">FitMind PRO {selectedPlan === 'annual' ? 'Anual' : 'Mensal'}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{priceLabel} {savingsLabel && <span className="text-green-600 dark:text-green-400 font-bold">({savingsLabel})</span>}</p>
                        </div>
                        <div className="text-right z-10">
                            <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">
                                {hasTrial ? 'R$ 0,00' : priceFormatted}
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">hoje</span>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-200/50 dark:bg-blue-600/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Payment Method Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                        <button 
                            onClick={() => setPaymentMethodType('credit')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${paymentMethodType === 'credit' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white scale-[1.02]' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            <CreditCardIcon className="w-4 h-4" /> Crédito
                        </button>
                        <button 
                            onClick={() => setPaymentMethodType('debit')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${paymentMethodType === 'debit' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white scale-[1.02]' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            <CreditCardIcon className="w-4 h-4" /> Débito
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Nome */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <UserCircleIcon className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Nome impresso no cartão" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>

                        {/* Cartão Stripe */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <CreditCardIcon className="w-5 h-5" />
                            </div>
                            <div className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all shadow-sm">
                                <div ref={cardElementRef} />
                            </div>
                        </div>

                        {/* CEP */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <MapPinIcon className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="CEP de cobrança" 
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg text-center animate-shake border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    {/* Pay Button */}
                    <button 
                        onClick={handlePay}
                        disabled={isProcessing || !isStripeLoaded}
                        className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-bold shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>{hasTrial ? 'Ativar Teste Grátis' : 'Assinar Agora'}</span>
                                <ShieldCheckIcon className="w-5 h-5 text-white/50 dark:text-black/50" />
                            </>
                        )}
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1s_infinite]"></div>
                    </button>
                    
                    {/* Disclaimer */}
                    <div className="mt-6 space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 py-2 rounded-lg">
                            <LockIcon className="w-3 h-3" />
                            <span>Seus dados são processados de forma segura pelo Stripe.</span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight px-4">
                            {hasTrial 
                                ? `Você não será cobrado hoje. A primeira cobrança de ${priceFormatted} ocorrerá em ${billingDateStr}, a menos que você cancele antes.`
                                : `Você será cobrado ${priceFormatted} hoje. Sua assinatura renovará automaticamente em ${billingDateStr}.`
                            }
                            Cancele a qualquer momento nas configurações do app.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};
