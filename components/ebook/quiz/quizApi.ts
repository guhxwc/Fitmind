// Ponte entre a tela do quiz e o backend (função quiz-api).
// Modos:
//  - "test":     nada sai do navegador (sem Supabase, sem PostHog, sem Meta). Rota /ebook/quiz-teste.
//  - "livetest": backend de verdade, mas com sessão de teste (e-mail fixo no servidor, sem pedido de ebook,
//                sem eventos para a Meta). Rota /ebook/quiz-live. Cobra o produto de teste do Stripe.
//  - "live":     comprador real do ebook (session_id do pedido). Será ligado em /ebook/oferta depois da aprovação.
import { supabase } from '../../../supabaseClient';
import { track as phTrack } from '../../../lib/analytics';
import { metaTrack } from '../../../lib/metaPixel';
import type { Answers } from './quizContent';

export type QuizMode = 'test' | 'live' | 'livetest';

export interface QuizStart {
  enabled: boolean;
  eligible: boolean;
  token?: string;
  emailMasked?: string | null;
  answers?: Answers;
}

export interface QuizStatus {
  paid: boolean;
  applied: boolean;
  needsReview: boolean;
  emailMasked?: string | null;
}

const TEST_EMAIL = 'ma****@gmail.com';
const OFFER_VALUE = 49;

export function createQuizApi(mode: QuizMode) {
  let token: string | undefined;

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('quiz-api', { body });
    if (error) throw error;
    return data;
  };

  return {
    mode,

    /** Abre (ou retoma) o quiz. Se vier um token (volta do Stripe), usa ele. */
    async start(sessionId: string | null, resumeToken?: string | null): Promise<QuizStart> {
      if (mode === 'test') return { enabled: true, eligible: true, emailMasked: TEST_EMAIL, answers: {} };
      try {
        if (mode === 'livetest') {
          const d = await call({ action: 'start', test: true });
          token = resumeToken || d?.token;
          return { enabled: !!d?.enabled, eligible: !!d?.eligible, token, emailMasked: d?.email_masked ?? null, answers: d?.answers ?? {} };
        }
        if (!sessionId && !resumeToken) return { enabled: true, eligible: false };
        if (resumeToken) token = resumeToken;
        if (!sessionId) return { enabled: true, eligible: true, token };
        const d = await call({ action: 'start', session_id: sessionId });
        token = d?.token ?? token;
        return { enabled: !!d?.enabled, eligible: !!d?.eligible, token, emailMasked: d?.email_masked ?? null, answers: d?.answers ?? {} };
      } catch {
        return { enabled: false, eligible: false };
      }
    },

    /** Salva respostas e registra um evento do funil. Nunca bloqueia a tela. */
    save(payload: { answers?: Answers; step?: number; event?: string; complete?: boolean; consent?: boolean }) {
      if (mode === 'test') {
        if (payload.event) console.debug('[quiz-teste]', payload.event, payload);
        return;
      }
      if (payload.event && mode === 'live') {
        // nomes próprios (upsell_*) para não cair nas regras de Lead/InitiateCheckout do ebook
        try { phTrack(`upsell_${payload.event}`, { step: payload.step }); } catch { /* ignore */ }
        if (payload.event === 'checkout_click') {
          try { metaTrack('InitiateCheckout', { value: OFFER_VALUE, currency: 'BRL', content_name: 'FitMind PRO', content_type: 'product', num_items: 1 }); } catch { /* ignore */ }
        }
      }
      if (!token) return;
      call({ action: 'save', token, ...payload }).catch(() => { /* não bloqueia */ });
    },

    /** Abre o checkout de assinatura. No teste local, só devolve null (a tela simula). */
    async checkout(): Promise<string | null> {
      if (mode === 'test') return null;
      if (!token) throw new Error('Sessão do quiz não encontrada.');
      const d = await call({ action: 'checkout', token });
      if (!d?.ok || !d?.url) throw new Error('Não foi possível abrir o pagamento.');
      return d.url as string;
    },

    /** Pergunta ao backend se o pagamento já foi confirmado e se o PRO já foi liberado. */
    async status(): Promise<QuizStatus | null> {
      if (mode === 'test' || !token) return null;
      try {
        const d = await call({ action: 'status', token });
        if (!d?.ok) return null;
        return { paid: !!d.paid, applied: !!d.applied, needsReview: !!d.needs_review, emailMasked: d.email_masked ?? null };
      } catch {
        return null;
      }
    },

    /** Subscribe no navegador (deduplica com o do servidor pelo id da sessão do Stripe). */
    trackSubscribed(stripeSessionId: string | null) {
      if (mode !== 'live') return;
      try {
        phTrack('upsell_subscribed', {});
        metaTrack('Subscribe', { value: OFFER_VALUE, currency: 'BRL', content_name: 'FitMind PRO', content_type: 'product' }, stripeSessionId ?? undefined);
      } catch { /* ignore */ }
    },
  };
}
