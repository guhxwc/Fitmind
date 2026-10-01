/**
 * Fitmind — Meta Pixel (browser)
 * ------------------------------
 * Ponto único de acesso ao `fbq`. O snippet base (init + PageView) continua em
 * index.html; aqui ficam os eventos de conversão.
 *
 * Regras importantes:
 *  1. NUNCA enviar dado de saúde como parâmetro (medicação, peso, dose, status GLP-1,
 *     idade, gênero...). A política de Business Tools da Meta proíbe, e o app é do
 *     nicho de saúde. Por isso só passam os campos da WHITELIST abaixo.
 *  2. Eventos de conversão usam `eventID` para deduplicar com a Conversions API
 *     (o servidor manda o mesmo event_id — ver supabase/functions/_shared/metaCapi.ts).
 *  3. Se o `fbq` não existir (bloqueador de anúncios, localhost), tudo vira no-op.
 *  4. PageView em rota de SPA: o fbevents.js já escuta history.pushState e dispara
 *     sozinho. NÃO disparar PageView manual aqui, senão duplica.
 */

export const META_PIXEL_ID = '1814654896218292';
export const META_CURRENCY = 'BRL';

/** Eventos padrão da Meta usados no Fitmind. */
export type MetaStandardEvent =
  | 'ViewContent'
  | 'Lead'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Subscribe';

/** Parâmetros que podem ir para a Meta. Qualquer outra chave é descartada. */
const ALLOWED_PARAMS = new Set([
  'value',
  'currency',
  'content_name',
  'content_category',
  'content_ids',
  'content_type',
  'num_items',
  'status',
]);

type Params = Record<string, unknown>;

function getFbq(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined') return null;
  const fbq = (window as any).fbq;
  return typeof fbq === 'function' ? fbq : null;
}

function sanitize(params?: Params): Params {
  if (!params) return {};
  const out: Params = {};
  for (const key of Object.keys(params)) {
    if (ALLOWED_PARAMS.has(key) && params[key] !== undefined && params[key] !== null) {
      out[key] = params[key];
    }
  }
  return out;
}

/** Gera um id de evento estável para deduplicação browser ↔ servidor. */
export function newEventId(prefix = 'evt'): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
  } catch {
    /* ignore */
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Dispara um evento padrão. Se `eventID` vier, o evento é enviado com ele
 * (necessário para deduplicar com a CAPI).
 */
export function metaTrack(event: MetaStandardEvent, params?: Params, eventID?: string): void {
  const fbq = getFbq();
  if (!fbq) return;
  try {
    const data = sanitize(params);
    if (eventID) fbq('track', event, data, { eventID });
    else fbq('track', event, data);
  } catch {
    /* nunca quebrar o app por causa de analytics */
  }
}

/**
 * Dispara um evento no máximo UMA vez por `onceKey` (persistido em localStorage).
 * Usado em Purchase, para que recarregar a página /success não conte duas vezes.
 */
export function metaTrackOnce(
  onceKey: string,
  event: MetaStandardEvent,
  params?: Params,
  eventID?: string,
): boolean {
  const storageKey = `meta_evt_${event}_${onceKey}`;
  try {
    if (localStorage.getItem(storageKey)) return false;
    localStorage.setItem(storageKey, String(Date.now()));
  } catch {
    /* storage indisponível: segue e dispara mesmo assim */
  }
  metaTrack(event, params, eventID);
  return true;
}

/**
 * Advanced Matching: associa o evento ao usuário logado (email + id) para melhorar
 * a taxa de correspondência. O fbevents.js normaliza e faz o hash (SHA-256) no
 * navegador antes de enviar — o email não sai em texto puro.
 */
export function metaIdentify(user: { email?: string | null; id?: string | null }): void {
  const fbq = getFbq();
  if (!fbq) return;
  try {
    const key = `meta_identified_${user.id || user.email || ''}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const matching: Record<string, string> = {};
    if (user.email) matching.em = user.email.trim().toLowerCase();
    if (user.id) matching.external_id = user.id;
    if (Object.keys(matching).length === 0) return;
    fbq('init', META_PIXEL_ID, matching);
  } catch {
    /* ignore */
  }
}

/** Lê os cookies _fbp / _fbc (usados pela CAPI para casar o clique do anúncio). */
export function getMetaBrowserIds(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};
  const read = (name: string) => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
  };
  let fbc = read('_fbc');
  // Se o cookie ainda não existe mas a URL trouxe fbclid, monta o fbc no formato oficial.
  if (!fbc) {
    try {
      const saved = sessionStorage.getItem('meta_fbclid') || new URLSearchParams(window.location.search).get('fbclid');
      if (saved) fbc = `fb.1.${Date.now()}.${saved}`;
    } catch {
      /* ignore */
    }
  }
  return { fbp: read('_fbp'), fbc };
}

/** Guarda o fbclid da URL logo na entrada (a URL é limpa depois pelo React Router). */
export function captureFbclid(): void {
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) sessionStorage.setItem('meta_fbclid', fbclid);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Contexto do checkout — guardado ao iniciar o pagamento para a página /success
// saber o VALOR e o PLANO (o Stripe volta só com session_id).
// ---------------------------------------------------------------------------
export interface CheckoutContext {
  kind: 'pro' | 'consultation';
  plan: string;
  value: number;
  currency: string;
  contentName: string;
  startedAt: number;
}

const CHECKOUT_CTX_KEY = 'fm_checkout_ctx';

export function saveCheckoutContext(ctx: Omit<CheckoutContext, 'startedAt' | 'currency'> & { currency?: string }): void {
  try {
    localStorage.setItem(
      CHECKOUT_CTX_KEY,
      JSON.stringify({ ...ctx, currency: ctx.currency || META_CURRENCY, startedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

export function readCheckoutContext(): CheckoutContext | null {
  try {
    const raw = localStorage.getItem(CHECKOUT_CTX_KEY);
    if (!raw) return null;
    const ctx = JSON.parse(raw) as CheckoutContext;
    // Contexto com mais de 24h é lixo de uma tentativa antiga.
    if (!ctx || Date.now() - ctx.startedAt > 24 * 60 * 60 * 1000) return null;
    return ctx;
  } catch {
    return null;
  }
}

// Preços de tabela do app (BRL). Mantidos aqui para o InitiateCheckout/Purchase
// terem valor mesmo se o servidor não devolver o total.
export const PRO_PRICES = { annual: 389.22, monthly: 49.0 } as const;
export const CONSULTATION_PRICES: Record<string, number> = {
  mensal: 197,
  trimestral: 561,
  semestral: 981,
};
