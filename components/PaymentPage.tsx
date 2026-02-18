
import React, { useState } from 'react';
import { LockIcon, ShieldCheckIcon, ArrowPathIcon } from './core/Icons';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

// =========================================================
// IDs REAIS DO STRIPE CONFIGURADOS
// =========================================================
const STRIPE_PRICE_IDS = {
    monthly: 'price_1SyGAmQdX6ANfRVOv6WAl27c',
    annual: 'price_1SyGFsQdX6ANfRVOkKskMwZ7'
};

interface PaymentPageProps {
  plan: 'annual' | 'monthly';
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ plan: selectedPlan, onClose }) => {
  const { userData, session } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceValue = selectedPlan === 'annual' ? 389.22 : 49.00;
  const priceFormatted = `R$ ${priceValue.toFixed(2).replace('.', ',')}`;
  const billingFrequency = selectedPlan === 'annual' ? 'Anual' : 'Mensal';

  const handleCheckout = async () => {
    setError(null);
    setIsProcessing(true);

    try {
        const userId = userData?.id || session?.user?.id;
        const userEmail = session?.user?.email;

        if (!userId || !userEmail) {
            throw new Error("Sessão expirada. Tente fazer login novamente.");
        }

        // Chamada para a Edge Function que cria a sessão de checkout dinâmica
        const { data, error: funcError } = await supabase.functions.invoke('create-payment-intent', {
            body: {
                priceId: selectedPlan === 'annual' ? STRIPE_PRICE_IDS.annual : STRIPE_PRICE_IDS.monthly,
                email: userEmail,
                userId: userId,
                // Onde o usuário deve cair após o pagamento (URL absoluta)
                returnUrl: window.location.origin + '/#/payment/success'
            }
        });

        if (funcError) throw funcError;
        if (data?.url) {
            // Redireciona para o checkout dinâmico do Stripe
            window.location.href = data.url;
        } else {
            throw new Error("Não foi possível gerar o link de pagamento.");
        }

    } catch (e: any) {
        console.error("Checkout Error:", e);
        setError(e.message || "Ocorreu um problema ao redirecionar para o Stripe.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-black z-[80] overflow-y-auto animate-fade-in font-sans">
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
                
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Finalizar Assinatura</h2>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                            <LockIcon className="w-3 h-3" />
                            Checkout 100% Seguro
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex gap-4 items-start mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <ShieldCheckIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">FitMind PRO</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{billingFrequency}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-3 mb-6 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Total Hoje</span>
                            <div className="text-right">
                                <span className="block font-extrabold text-xl text-blue-600 dark:text-blue-400">{priceFormatted}</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl text-center border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                        {isProcessing ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <span>Processando...</span>
                            </>
                        ) : (
                            <>
                                <span>Ir para Pagamento</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </>
                        )}
                    </button>
                    
                    <p className="text-[10px] text-gray-400 mt-4 text-center leading-relaxed">
                        Você será redirecionado para o ambiente seguro do Stripe.<br/>Sua assinatura renova automaticamente, cancele quando quiser.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};
