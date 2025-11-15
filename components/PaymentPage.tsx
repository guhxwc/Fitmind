
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { UserData } from '../types';
import type { Session } from '@supabase/supabase-js';

// IMPORTANT: Replace these with your actual Stripe keys and price IDs from your environment variables.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51HPvopJ187gYQhA8zH3tCoS9cftgnt2Zod28oJF20z3Qk2cMSOpSj5CoLqAn3aVWFFSBmmSoCVbAy8u7aT5EV4dC0035N8LQ3l';
const PRICE_IDS = {
  annual: 'price_1PQUzHJ187gYQhA8k6LzSf5K',
  monthly: 'price_1PQUzHJ187gYQhA8sI8L3YfX',
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
  userData: UserData;
  session: Session;
}

const CardElementStyle = {
    style: {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
};

export const PaymentPage: React.FC<PaymentPageProps> = ({ plan, onClose, onPaymentSuccess, userData, session }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<any>(null);
  const cardElement = useRef<any>(null);

  useEffect(() => {
    if (window.Stripe) {
        const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        stripeRef.current = stripe;
        const elements = stripe.elements();
        cardElement.current = elements.create('card', CardElementStyle);
        if (cardElementRef.current) {
            cardElement.current.mount(cardElementRef.current);
        }
    }

    return () => {
        if (cardElement.current) {
            cardElement.current.destroy();
        }
    };
  }, []);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    const stripe = stripeRef.current;
    const card = cardElement.current;

    if (!stripe || !card || !userData.stripeCustomerId) {
      setError('Falha na inicialização do pagamento. Por favor, recarregue a página.');
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Call the edge function to create a subscription
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

      // 2. If payment is required, confirm it on the client
      if (clientSecret) {
        const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: userData.name,
              email: session.user.email,
            },
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message || 'Ocorreu um erro com o pagamento.');
        }
      }
      
      // 3. On success, call the success handler
      onPaymentSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const planDetails = {
    annual: { price: '124,90', label: 'Anual' },
    monthly: { price: '39,90', label: 'Mensal' }
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center">
        <div className="bg-gray-50 w-full max-w-md h-[90%] rounded-t-3xl p-6 flex flex-col animate-slide-up">
            <div className="flex-shrink-0 flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Pagamento</h2>
                 <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto">
                <div className="bg-white border border-gray-200 p-4 rounded-xl mb-6">
                    <p className="font-semibold text-gray-800">Plano FitMind PRO - {planDetails[plan].label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">R$ {planDetails[plan].price}</p>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Dados do Cartão de Crédito</label>
                    <div className="p-3 bg-white border border-gray-300 rounded-lg">
                        <div ref={cardElementRef}></div>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            </div>
            
            <div className="mt-auto pt-6">
                 <button 
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center disabled:bg-gray-400"
                >
                    {isProcessing ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                        </>
                    ) : (
                        `Pagar R$ ${planDetails[plan].price}`
                    )}
                 </button>
            </div>
        </div>
    </div>
  );
};
