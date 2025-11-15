import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { LockIcon } from './core/Icons';
import { useAppContext } from './AppContext';

// Using user-provided TEST keys for sandbox environment.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51STR9hQdX6ANfRVO0hpDkaTDe6Mj0WLrjFsXh57T4TX9fhWEhfWAriLC5s4Ti2WorlL57YYZOS42lhqBuDxc6Cuf003enTSGnn';

// Using user-provided TEST Price IDs.
const PRICE_IDS = {
  annual: 'price_1STlzzQdX6ANfRVOKsrT29TQ',
  monthly: 'price_1STlzZQdX6ANfRVOkyXlfOvr',
};

// Stripe's types are not available globally without imports, so we define this for TypeScript.
declare global {
    interface Window {
        Stripe: any;
    }
}

interface PaymentPageProps {
  plan: 'annual' | 'monthly';
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
                color: isDarkMode ? '#9ca3af' : '#aab7c4',
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

const StripeSetupMessage: React.FC = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-yellow-900 dark:text-yellow-200">
      <div className="w-16 h-16 bg-yellow-200 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-300 rounded-2xl flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Ação Necessária: Configure a Stripe (Modo de Teste)</h1>
      <p className="mt-2 max-w-md">
        O aplicativo está pronto para testar! Agora, você precisa criar os produtos no seu ambiente de teste da Stripe.
      </p>
      <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-left w-full max-w-md">
        <p className="font-semibold">Passo a passo:</p>
        <ol className="list-decimal list-inside mt-2 text-sm space-y-2">
            <li>Acesse seu <a href="https://dashboard.stripe.com/test/products" target="_blank" rel="noopener noreferrer" className="font-bold underline text-yellow-800 dark:text-yellow-100">Painel de Produtos da Stripe</a> e verifique se o <strong>"Modo de teste"</strong> está ativado.</li>
            <li>Crie um produto chamado <code className="bg-yellow-200 dark:bg-yellow-700/50 px-1 py-0.5 rounded font-mono">Fitmind PRO</code>.</li>
            <li>Adicione dois preços a este produto:
                <ul className="list-disc list-inside pl-4 mt-1">
                    <li><strong>Mensal:</strong> R$ 39,90 (recorrente)</li>
                    <li><strong>Anual:</strong> R$ 226,80 (recorrente)</li>
                </ul>
            </li>
            <li>Copie o <strong>ID de Preço</strong> de cada um (eles começam com <code className="bg-yellow-200 dark:bg-yellow-700/50 px-1 py-0.5 rounded font-mono">price_...</code>).</li>
            <li>Forneça-me os dois <strong>IDs de Preço de Teste</strong> para ativar o formulário de pagamento.</li>
        </ol>
      </div>
       <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-4 max-w-md">
        Lembre-se: você precisa dos IDs de <strong>Preço</strong>, não dos IDs de Produto.
      </p>
    </div>
  );
  
const InitializingView: React.FC<{ message: string }> = ({ message }) => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <svg className="animate-spin h-8 w-8 text-gray-700 dark:text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{message}</h1>
    </div>
);


export const PaymentPage: React.FC<PaymentPageProps> = ({ plan, onClose, onPaymentSuccess }) => {
  const { userData, session, fetchData } = useAppContext();
  
  const [name, setName] = useState(userData?.name || '');
  const [postalCode, setPostalCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  const cardElementRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<any>(null);
  const cardElement = useRef<any>(null);

  const keysAreSet = STRIPE_PUBLISHABLE_KEY && PRICE_IDS.annual && PRICE_IDS.monthly;

  useEffect(() => {
    const checkAndCreateCustomer = async () => {
        if (!userData || !session) {
             setError("Sessão ou dados do usuário não encontrados.");
             setInitializing(false);
             return;
        }

        if (userData.stripeCustomerId) {
            setInitializing(false);
            return;
        }
        
        const { error: funcError } = await supabase.functions.invoke('create-stripe-customer');

        if (funcError) {
            setError('Falha ao inicializar o perfil de pagamento. Tente novamente mais tarde.');
            console.error('Error creating stripe customer:', funcError);
            setInitializing(false);
        } else {
            await fetchData();
        }
    };
    
    checkAndCreateCustomer();
  }, [userData, session, fetchData]);

  useEffect(() => {
    if (initializing || !keysAreSet || !cardElementRef.current) return;

    const initStripe = () => {
        if (!window.Stripe) {
            console.error("Stripe.js has not loaded yet.");
            setError("Falha ao carregar o formulário de pagamento. Tente novamente.");
            return;
        }

        const isDarkMode = document.documentElement.classList.contains('dark');
        const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        stripeRef.current = stripe;
        
        const elements = stripe.elements({ locale: 'pt-BR' });
        
        cardElement.current = elements.create('card', getCardElementOptions(isDarkMode));
        
        cardElement.current.mount(cardElementRef.current);

        cardElement.current.on('ready', () => {
            setIsStripeLoaded(true);
        });

        cardElement.current.on('change', (event: any) => {
            if (event.error) {
                setError(event.error.message);
            } else {
                setError(null);
            }
        });
    };
    
    const stripeScript = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (window.Stripe) {
        initStripe();
    } else if (stripeScript) {
        stripeScript.addEventListener('load', initStripe);
    }
    
    const observer = new MutationObserver(() => {
        if (cardElement.current) {
            const isDarkMode = document.documentElement.classList.contains('dark');
            cardElement.current.update(getCardElementOptions(isDarkMode));
        }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
        observer.disconnect();
        if (cardElement.current) {
            try {
              cardElement.current.destroy();
            } catch (e) { /* ignore */ }
        }
    };
  }, [initializing, keysAreSet]);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    const stripe = stripeRef.current;
    const card = cardElement.current;

    if (!isStripeLoaded || !stripe || !card || !userData?.stripeCustomerId || !session?.user) {
      setError('Falha na inicialização do pagamento. Por favor, recarregue a página.');
      setIsProcessing(false);
      return;
    }

    try {
      const { data: subData, error: subError } = await supabase.functions.invoke('create-subscription', {
        body: {
          priceId: PRICE_IDS[plan],
          customerId: userData.stripeCustomerId,
          metadata: { user_id: userData.id },
        },
      });

      if (subError) throw new Error(subError.message || "Não foi possível criar a assinatura.");
      
      const subscription = subData;
      const clientSecret = subscription?.latest_invoice?.payment_intent?.client_secret;

      if (clientSecret) {
        const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: name,
              email: session.user.email,
              address: {
                postal_code: postalCode,
              },
            },
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message || 'Ocorreu um erro com o pagamento.');
        }
      }
      
      onPaymentSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const planDetails = {
    annual: { price: '226,80', label: 'Anual' },
    monthly: { price: '39,90', label: 'Mensal' }
  };
  
  const isLoading = isProcessing || (!isStripeLoaded && keysAreSet && !initializing);

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center">
        <div className="bg-gray-100 dark:bg-gray-900 w-full max-w-md h-[95%] rounded-t-3xl flex flex-col animate-slide-up">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {initializing ? 'Inicializando' : keysAreSet ? "Pagamento" : "Configuração Necessária"}
                </h2>
                 <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </header>
            
            {initializing ? (
                <InitializingView message="Inicializando pagamento seguro..." />
            ) : !keysAreSet ? (
                <StripeSetupMessage />
            ) : (
                <>
                    <main className="flex-grow overflow-y-auto p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <div className="p-3 bg-gray-200 dark:bg-gray-800 rounded-lg">
                                <p className="text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Informações do Cartão</label>
                            <div className={`p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-opacity ${isStripeLoaded ? 'opacity-100' : 'opacity-50'}`}>
                                <div ref={cardElementRef}></div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome no Cartão</label>
                            <input
                                id="name-on-card"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nome como aparece no cartão"
                                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">País ou região</label>
                            <div className="p-3 bg-gray-200 dark:bg-gray-800 rounded-lg">
                                <p className="text-gray-600 dark:text-gray-400">Brasil</p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CEP</label>
                            <input
                                id="postal-code"
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="00000-000"
                                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    </main>
                    
                    <footer className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={handlePay}
                            disabled={isLoading}
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <LockIcon className="w-5 h-5" />
                                    <span>Pagar R$ {planDetails[plan].price}</span>
                                </>
                            )}
                        </button>
                    </footer>
                </>
            )}
        </div>
    </div>
  );
};