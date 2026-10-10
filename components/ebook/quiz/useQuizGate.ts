// Decide, na /ebook/oferta, se mostra o quiz de upsell ou a página antiga.
// Regra: quiz só se a chave quiz_upsell_enabled estiver ligada E o pedido do ebook estiver pago.
// Qualquer erro, chave desligada ou demora cai na página antiga (nunca deixa a pessoa sem a oferta).
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

export type QuizGate = 'loading' | 'quiz' | 'legacy';

export function useQuizGate(): QuizGate {
  const [gate, setGate] = useState<QuizGate>(() => {
    if (typeof window === 'undefined') return 'legacy';
    const p = new URLSearchParams(window.location.search);
    if (p.get('qt') && (p.get('quiz') === 'ok' || p.get('quiz') === 'voltar')) return 'quiz'; // volta do Stripe
    return p.get('session_id') ? 'loading' : 'legacy';
  });

  useEffect(() => {
    if (gate !== 'loading') return;
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    let cancelled = false;

    const run = async () => {
      // o webhook do Stripe pode levar alguns segundos para marcar o pedido como pago: tenta até 3 vezes
      for (let i = 0; i < 3; i++) {
        try {
          const { data, error } = await supabase.functions.invoke('quiz-api', { body: { action: 'start', session_id: sessionId } });
          if (cancelled) return;
          if (error || !data) break;
          if (!data.enabled) return setGate('legacy');
          if (data.eligible) return setGate('quiz');
        } catch {
          break;
        }
        await new Promise((r) => setTimeout(r, 2500));
        if (cancelled) return;
      }
      setGate('legacy');
    };
    run();
    return () => { cancelled = true; };
  }, [gate]);

  return gate;
}
