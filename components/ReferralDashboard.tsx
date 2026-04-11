import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle2, Gift, Sparkles, Trophy, ChevronLeft, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

export const ReferralDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAppContext();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [referralCount, setReferralCount] = useState(0);
  const referralCode = userData?.id?.substring(0, 8).toUpperCase() || 'TESTER';
  const referralLink = `https://fitmindhealth.com.br/?ref=${referralCode}`;

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!userData?.id) return;
      
      try {
        // Contamos apenas indicações que converteram para PRO (status = 'completed')
        const { count, error } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('affiliate_ref', referralCode)
          .eq('status', 'completed');
          
        if (!error && count !== null) {
          setReferralCount(count);
        }
      } catch (err) {
        console.error('Erro ao buscar indicações:', err);
      }
    };

    fetchReferrals();
  }, [userData?.id, referralCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite Exclusivo - FitMind',
          text: 'Comece sua jornada no FitMind comigo e ganhe benefícios exclusivos!',
          url: referralLink,
        });
      } catch (err) {
        console.log('Erro ao compartilhar', err);
      }
    } else {
      handleCopy();
    }
  };

  const tiers = [
    {
      id: 1,
      title: 'Bronze',
      friends: '1 Amigo',
      reward: '+7 dias grátis',
      description: 'Uma semana extra de acesso total liberada para você.',
      icon: <Gift />,
      reached: referralCount >= 1,
    },
    {
      id: 2,
      title: 'Prata',
      friends: '2 Amigos',
      reward: '30% de Desconto',
      description: 'Desconto exclusivo garantido na sua próxima assinatura.',
      icon: <Sparkles />,
      reached: referralCount >= 2,
    },
    {
      id: 3,
      title: 'Ouro',
      friends: '3 Amigos',
      reward: '1 Mês Grátis',
      description: 'Um mês inteiro de acesso premium por nossa conta.',
      icon: <Trophy />,
      reached: referralCount >= 3,
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-black dark:text-white font-sans selection:bg-[#007AFF]/30 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-[#007AFF] flex items-center gap-1 active:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 -ml-2" />
          <span className="text-[17px] font-medium">Voltar</span>
        </button>
      </header>

      <main className="px-5 pt-8 max-w-md mx-auto">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-[34px] font-bold leading-tight tracking-tight mb-3">
            Compartilhe saúde.<br />
            <span className="text-[#007AFF]">Ganhe Premium.</span>
          </h1>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Convide seus amigos para o FitMind. Eles ganham um empurrãozinho, e você desbloqueia recompensas exclusivas.
          </p>
        </div>

        {/* Share Card */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-sm mb-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mb-4">
              <Share className="w-8 h-8 text-[#007AFF] ml-[-2px]" />
            </div>
            <h2 className="text-[20px] font-semibold mb-1">Seu Link de Convite</h2>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              Toque para copiar ou compartilhar diretamente.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 bg-gray-100 dark:bg-[#2C2C2E] text-black dark:text-white rounded-xl py-3.5 font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleShare}
              className="flex-[2] bg-[#007AFF] text-white rounded-xl py-3.5 font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-[#007AFF]/20"
            >
              <Share className="w-5 h-5" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* Progress & Rewards */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-4 px-1">
            <h3 className="text-[20px] font-semibold tracking-tight">Suas Recompensas</h3>
            <span className="text-[15px] text-gray-500 font-medium">{referralCount} de 3 amigos</span>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] overflow-hidden shadow-sm">
            {/* Progress Bar */}
            <div className="px-6 pt-6 pb-5 border-b border-gray-100 dark:border-[#2C2C2E]">
              <div className="h-2 bg-gray-100 dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#007AFF] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((referralCount / 3) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[13px] text-gray-500 mt-3 font-medium text-center">
                {referralCount === 0 ? 'Convide 1 amigo para a primeira recompensa.' :
                 referralCount < 3 ? `Faltam ${3 - referralCount} amigos para o prêmio máximo.` :
                 'Você alcançou o prêmio máximo!'}
              </p>
            </div>

            {/* Tiers */}
            <div className="flex flex-col">
              {tiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`p-6 flex items-start gap-4 ${
                    index !== tiers.length - 1 ? 'border-b border-gray-100 dark:border-[#2C2C2E]' : ''
                  } ${tier.reached ? 'bg-[#007AFF]/5 dark:bg-[#007AFF]/10' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    tier.reached
                      ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/20'
                      : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-400'
                  }`}>
                    {React.cloneElement(tier.icon as React.ReactElement, { className: 'w-5 h-5' })}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[12px] font-bold uppercase tracking-wider ${
                        tier.reached ? 'text-[#007AFF]' : 'text-gray-400'
                      }`}>
                        {tier.friends}
                      </span>
                      {tier.reached && <CheckCircle2 className="w-5 h-5 text-[#007AFF]" />}
                    </div>
                    <h4 className={`text-[17px] font-semibold mb-1 ${tier.reached ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {tier.reward}
                    </h4>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-snug">
                      {tier.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 text-center">
          <p className="text-[13px] text-gray-400 leading-relaxed">
            Recompensas ativadas automaticamente após o convidado se tornar PRO. Válido para novas assinaturas.
          </p>
        </div>
      </main>
    </div>
  );
};
