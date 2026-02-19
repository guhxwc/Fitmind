
import React, { useState } from 'react';
import { LockIcon, ShieldCheckIcon, ArrowPathIcon } from './core/Icons';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';

const STRIPE_PRICE_IDS = {
    monthly: 'price_1STlzZQdX6ANfRVOkyXlfOvr',
    annual: 'price_1STlzzQdX6ANfRVOKsrT29TQ'
};

interface PaymentPageProps {
  plan: 'annual' | 'monthly';
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ plan: selectedPlan, onClose }) => {
  const { session } = useAppContext();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
        if (!session?.user) throw new Error("Usuário não autenticado.");

        const priceId = selectedPlan === 'annual' ? STRIPE_PRICE_IDS.annual : STRIPE_PRICE_IDS.monthly;
        
        // Construção da URL de retorno. Como usamos HashRouter, o Stripe precisa redirecionar para a raiz + a rota do hash.
        // O parâmetro session_id é adicionado pela Stripe automaticamente se usarmos {CHECKOUT_SESSION_ID}
        const returnUrl = `${window.location.origin}/#/payment/success`;

        const { data, error: funcError } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                priceId: priceId,
                email: session.user.email,
                userId: session.user.id,
                returnUrl: returnUrl
            }
        });

        if (funcError) throw new Error(data?.error || funcError.message);

        if (data?.url) {
            window.location.href = data.url;
        } else {
            throw new Error("Erro ao gerar link de pagamento.");
        }

    } catch (e: any) {
        console.error("[Checkout] Erro:", e);
        addToast(e.message || "Erro ao iniciar pagamento.", "error");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-black z-[80] overflow-y-auto animate-fade-in font-sans">
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout Seguro</h2>
                    <p className="text-gray-500 mb-8">Você será redirecionado para a Stripe para concluir sua assinatura com total segurança.</p>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-8 text-left border border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Plano Selecionado</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {selectedPlan === 'annual' ? 'Assinatura Anual FitMind PRO' : 'Assinatura Mensal FitMind PRO'}
                        </p>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        {isProcessing ? (
                            <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Processando...</>
                        ) : (
                            <><LockIcon className="w-5 h-5" /> Ir para Pagamento</>
                        )}
                    </button>
                    
                    <button onClick={onClose} disabled={isProcessing} className="mt-6 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">
                        Cancelar e voltar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
