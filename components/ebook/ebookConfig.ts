import { track as phTrack } from '../../lib/analytics';
import { supabase } from '../../supabaseClient';
import { metaTrack } from '../../lib/metaPixel';

export const EBOOK_CONFIG = {
  // Stripe (o checkout é criado pela Edge Function create-ebook-checkout)
  STRIPE_PRODUCT_ID: "prod_VMCwbylGjI8fKG",
  STRIPE_PRICE_ID: "price_1ULUWUQdX6ANfRVORNZ2Fumu",
  PRICE_VALUE: 9.99,
  CURRENCY: "BRL",
  // Todos os CTAs do upsell levam para cá
  UPSELL_REDIRECT_URL: "https://fitmindhealth.com.br",
  OBRIGADO_URL: "/ebook/obrigado",
  PASSAR_UTMS: true
};

/** Coleta UTMs / click ids da URL atual. */
export function collectUtms(): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof window === 'undefined') return out;
  new URLSearchParams(window.location.search).forEach((v, k) => {
    if (/^utm_|^fbclid$|^gclid$|^src$/.test(k)) out[k] = v;
  });
  return out;
}

/**
 * Cria a sessão de checkout do Stripe e redireciona o comprador.
 * Não exige login. Lança erro se não conseguir abrir o pagamento.
 */
export async function startEbookCheckout(opts: { quizProfile?: string | null } = {}): Promise<void> {
  let affiliateRef: string | null = null;
  try {
    affiliateRef = localStorage.getItem('affiliate_ref') || sessionStorage.getItem('affiliate_ref');
  } catch { /* storage indisponível */ }

  const { data, error } = await supabase.functions.invoke('create-ebook-checkout', {
    body: {
      utm: EBOOK_CONFIG.PASSAR_UTMS ? collectUtms() : {},
      quiz_profile: opts.quizProfile ?? null,
      affiliate_ref: affiliateRef,
    },
  });

  if (error || !data?.success || !data?.url) {
    throw new Error(data?.error || 'Não foi possível abrir o pagamento. Tente novamente.');
  }
  window.location.href = data.url;
}

/** Consulta o status do pedido (usado no upsell). */
export async function getEbookOrderStatus(sessionId: string): Promise<{
  found: boolean; status?: string; email_masked?: string | null; value?: number | null; currency?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('ebook-order-status', { body: { session_id: sessionId } });
    if (error || !data) return { found: false };
    return data;
  } catch {
    return { found: false };
  }
}

export function withParams(targetUrl: string): string {
  try {
    if (typeof window === 'undefined') return targetUrl;
    const isRelative = targetUrl.startsWith('/');
    const fullUrl = isRelative ? new URL(targetUrl, window.location.origin) : new URL(targetUrl);

    if (EBOOK_CONFIG.PASSAR_UTMS) {
      const here = new URLSearchParams(window.location.search);
      here.forEach((v, k) => {
        if (/^utm_|^email$|^src$|^fbclid$|^gclid$/.test(k)) {
          fullUrl.searchParams.set(k, v);
        }
      });
    }
    return isRelative ? fullUrl.pathname + fullUrl.search + fullUrl.hash : fullUrl.toString();
  } catch {
    return targetUrl;
  }
}

export function trackEvent(name: string, props?: Record<string, any>): void {
  try {
    phTrack(name, props);
  } catch (e) {
    // Ignore analytics errors
  }

  // Meta Pixel — só nome/valor do produto; as respostas do quiz NÃO vão para a Meta.
  try {
    if (name === 'quiz_complete') {
      metaTrack('Lead', { content_name: 'Ebook Prato Cheio de Proteína', content_category: 'ebook' });
    } else if (name === 'checkout_click') {
      metaTrack('InitiateCheckout', {
        value: EBOOK_CONFIG.PRICE_VALUE,
        currency: EBOOK_CONFIG.CURRENCY,
        content_name: 'Ebook Prato Cheio de Proteína',
        content_type: 'product',
        num_items: 1,
      });
    }
  } catch (e) {
    // Ignore fbq errors
  }
}
