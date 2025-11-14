
import React, { useState } from 'react';

interface PaymentPageProps {
  plan: 'annual' | 'monthly';
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentInput: React.FC<{ label: string; placeholder: string; type?: string; icon?: React.ReactNode; }> = ({ label, placeholder, type = "text", icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <input 
                type={type}
                placeholder={placeholder}
                className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
            />
            {icon && <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">{icon}</div>}
        </div>
    </div>
);

export const PaymentPage: React.FC<PaymentPageProps> = ({ plan, onClose, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const planDetails = {
    annual: { price: '124,90', label: 'Anual' },
    monthly: { price: '39,90', label: 'Mensal' }
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
        onPaymentSuccess();
    }, 2000);
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
                
                <div className="flex gap-2 bg-gray-200 p-1 rounded-xl mb-6">
                    <button onClick={() => setActiveTab('card')} className={`w-1/2 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'card' ? 'bg-white shadow' : 'text-gray-600'}`}>Cartão de Crédito</button>
                    <button onClick={() => setActiveTab('pix')} className={`w-1/2 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'pix' ? 'bg-white shadow' : 'text-gray-600'}`}>Pix</button>
                </div>

                {activeTab === 'card' && (
                    <div className="space-y-4">
                        <PaymentInput label="Número do Cartão" placeholder="0000 0000 0000 0000" />
                        <PaymentInput label="Nome no Cartão" placeholder="Seu nome completo" />
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <PaymentInput label="Validade" placeholder="MM/AA" />
                            </div>
                             <div className="w-1/2">
                                <PaymentInput label="CVV" placeholder="123" />
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'pix' && (
                    <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                        <p className="font-semibold text-gray-800">Pague com Pix</p>
                        <p className="text-sm text-gray-500 mb-4">Aponte a câmera do seu celular para o QR Code.</p>
                        <div className="w-48 h-48 bg-gray-200 mx-auto rounded-lg flex items-center justify-center font-mono text-gray-400 text-sm">
                            [ Mock QR Code ]
                        </div>
                        <button className="mt-4 w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold">
                            Copiar Chave Pix
                        </button>
                    </div>
                )}
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