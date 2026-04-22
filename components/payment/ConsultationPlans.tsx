import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Check, Sparkles, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';

interface ConsultationPlansProps {
  onPlanSelected: (planId: string) => void;
  onBack: () => void;
}

const plans = [
  {
    id: 'mensal',
    title: 'Mensal',
    pricePrefix: 'R$',
    price: '197',
    total: 'Por mês',
    highlight: '',
    savings: '',
    priceId: 'price_1TP5QDQdX6ANfRVOyGh6llu7',
    productId: 'prod_UNr8Fb9r6Gz1rz',
    benefits: [
      'Avaliação inicial completa',
      'Plano alimentar personalizado',
      'Ajustes mensais estratégicos',
      'Suporte direto prioritário',
      'Integração com sua jornada no FitMind'
    ]
  },
  {
    id: 'trimestral',
    title: 'Trimestral',
    pricePrefix: '3x R$',
    price: '187',
    total: 'Total: R$ 561,00',
    highlight: 'MAIS ESCOLHIDO',
    savings: '',
    priceId: 'price_1TP5V2QdX6ANfRVOGjPnYBf9',
    productId: 'prod_UNrDfpi3C3OTUe',
    benefits: [
      'Tudo do plano mensal',
      '3 meses de acompanhamento contínuo',
      'Reajustes conforme evolução',
      'Estratégia progressiva de resultados',
      'Prioridade no suporte'
    ]
  },
  {
    id: 'semestral',
    title: 'Semestral',
    pricePrefix: '3x R$',
    price: '327',
    total: 'Total: R$ 981,00',
    highlight: 'MAIOR ECONOMIA',
    savings: 'Você economiza R$ 201,00 comparado ao plano mensal.',
    priceId: 'price_1TP5q4QdX6ANfRVOzzrn5Iwt',
    productId: 'prod_UNrZlDZNB5MDGQ',
    benefits: [
      'Tudo do plano trimestral',
      '6 meses de acompanhamento premium',
      'Planejamento avançado de longo prazo',
      'Ajustes contínuos e refinamento total',
      'Maior constância e performance',
      'Melhor custo-benefício'
    ]
  }
];

export const ConsultationPlans: React.FC<ConsultationPlansProps> = ({ onPlanSelected, onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('trimestral');
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutRedirect, setShowCheckoutRedirect] = useState(false);
  const { session } = useAppContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.scrollTop = 0;
        rootElement.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const handleContinue = () => {
    setShowCheckoutRedirect(true);
  };

  const handleFinalCheckout = async () => {
    setIsLoading(true);
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    try {
        const returnUrl = `${window.location.origin}/success`;
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: { 
                priceId: plan.priceId,
                productId: plan.productId,
                planType: plan.id,
                userId: session?.user?.id,
                is_consultation: true,
                returnUrl: returnUrl
            }
        });

        console.log('Response data:', data);
        console.log('Response error:', error);

        if (error) throw error;
        if (data?.url) {
            window.location.href = data.url;
        } else if (data?.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Nenhuma URL de checkout retornada');
        }
    } catch (error) {
        console.error('Erro ao iniciar checkout:', error);
        alert('Erro ao processar sua consulta. Tente novamente.');
        setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  };

  if (showCheckoutRedirect) {
    const plan = plans.find(p => p.id === selectedPlan);
    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-black z-[80] overflow-y-auto animate-fade-in font-sans">
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout Seguro</h2>
                        <p className="text-gray-500 mb-8 font-medium">Você será redirecionado para a Stripe para concluir seu pagamento com total segurança.</p>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-8 text-left border border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Serviço Selecionado</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                Consultoria Especializada - Plano {plan?.title}
                            </p>
                            <p className="text-sm font-semibold text-[#2972F5] mt-1">
                                {plan?.pricePrefix} {plan?.price} {plan?.total}
                            </p>
                        </div>

                        <button 
                            onClick={handleFinalCheckout}
                            disabled={isLoading}
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                            ) : (
                                <><Lock className="w-5 h-5" /> Ir para Pagamento</>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => setShowCheckoutRedirect(false)} 
                            disabled={isLoading} 
                            className="mt-6 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                        >
                            Cancelar e voltar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
      className="w-full min-h-[100dvh] flex justify-center bg-[#2972F5] dark:bg-[#1E56C0] font-sans"
    >
       <motion.div 
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] min-h-[100dvh] bg-[#2972F5] dark:bg-[#1E56C0] relative flex flex-col shadow-2xl sm:border-x sm:border-white/10 pb-[120px]"
       >
          
          {/* Header */}
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
             className="px-4 pt-6 pb-3 flex items-center justify-between sticky top-0 bg-[#2972F5]/90 dark:bg-[#1E56C0]/90 backdrop-blur-xl z-30"
          >
             <button 
                onClick={onBack}
                className="w-10 h-10 flex flex-col items-center justify-center -ml-2 rounded-full active:bg-white/10 transition-colors"
              >
                 <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2.5} />
             </button>
             <span className="font-semibold text-[17px] tracking-tight text-white">Assinatura</span>
             <div className="w-10" />
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-5 pt-3"
          >
              <motion.div variants={itemVariants} className="mb-8 mx-1">
                  <h1 className="text-[34px] leading-[1.1] font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">
                      Escolha seu plano
                  </h1>
                  <p className="text-[16px] leading-[1.4] font-medium text-blue-100">
                      Assinaturas mais longas possuem descontos exclusivos e aceleram seus resultados.
                  </p>
              </motion.div>

              <div className="space-y-6">
                  {plans.map((plan) => {
                      const isSelected = selectedPlan === plan.id;

                      return (
                          <motion.div 
                              variants={itemVariants}
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan.id)}
                              className={`relative p-6 rounded-[28px] transition-all duration-300 cursor-pointer overflow-hidden bg-white dark:bg-[#1C1C1E] ${
                                  isSelected 
                                    ? 'ring-[4px] ring-white/50 dark:ring-white/30 scale-100 shadow-[0_24px_48px_rgba(0,0,0,0.25)]' 
                                    : 'scale-[0.96] opacity-90 shadow-lg hover:scale-[0.98]'
                              }`}
                          >
                              {/* Highlight Ribbon */}
                              {plan.highlight && (
                                  <div className="mb-4">
                                      <span className="inline-block bg-[#2972F5]/10 text-[#2972F5] dark:bg-[#0A84FF]/15 dark:text-[#0A84FF] text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                          {plan.highlight}
                                      </span>
                                  </div>
                              )}

                              {/* Plan Header Info */}
                              <div className="flex justify-between items-start">
                                  <h3 className="text-[24px] font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                                      {plan.title}
                                  </h3>
                                  
                                  {/* Select Indicator */}
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                      isSelected ? 'bg-[#2972F5]' : 'bg-gray-200 dark:bg-[#3A3A3C]'
                                  }`}>
                                      {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                  </div>
                              </div>

                              {/* Price */}
                              <div className="flex items-baseline gap-1.5 mt-1.5">
                                  <span className="text-[16px] font-semibold text-gray-400 dark:text-gray-500">
                                      {plan.pricePrefix}
                                  </span>
                                  <span className="text-[38px] font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">
                                      {plan.price}
                                  </span>
                              </div>
                              <p className="text-[14px] font-medium text-[#8E8E93] mt-2">
                                  {plan.total}
                              </p>

                              {/* Savings Label */}
                              {plan.savings && (
                                  <div className="mt-4 mb-1 inline-flex items-center bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] text-[13px] font-bold px-3 py-1.5 rounded-xl">
                                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                      {plan.savings}
                                  </div>
                              )}
                              
                              <div className="w-full h-[1px] bg-gray-100 dark:bg-gray-800 my-5" />
                              
                              {/* Benefits (Always Open) */}
                              <ul className="space-y-4">
                                  {plan.benefits.map((ben, i) => (
                                      <li key={i} className="flex items-start">
                                          <div className={`mt-[2px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mr-3 ${
                                              isSelected ? 'bg-[#EEF4FF] dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                          }`}>
                                              <Check className={`w-3 h-3 stroke-[3.5] ${
                                                  isSelected ? 'text-[#2972F5]' : 'text-gray-400 dark:text-gray-500'
                                              }`} />
                                          </div>
                                          <span className="text-[15px] font-medium text-gray-800 dark:text-gray-200 leading-snug">
                                              {ben}
                                          </span>
                                      </li>
                                  ))}
                              </ul>
                          </motion.div>
                      );
                  })}
              </div>

              <motion.p variants={itemVariants} className="text-[13px] text-center text-blue-100/70 mt-8 mb-4 font-medium px-4">
                 Você pode cancelar a assinatura a qualquer momento através do nosso suporte.
              </motion.p>
          </motion.div>

          {/* Sticky Gradient Footer */}
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              className="fixed sm:absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#2972F5] via-[#2972F5] dark:from-[#1E56C0] dark:via-[#1E56C0] to-transparent pt-12 pb-8 px-5 z-40"
          >
              <button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full bg-white active:bg-gray-100 dark:active:bg-gray-200 transition-colors text-[#2972F5] font-bold text-[18px] h-[64px] rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                  {isLoading ? (
                      <div className="w-7 h-7 border-[3px] border-[#2972F5]/30 border-t-[#2972F5] rounded-full animate-spin shrink-0" />
                  ) : (
                      "Continuar e Assinar"
                  )}
              </button>
          </motion.div>

       </motion.div>
    </motion.div>
  );
};
