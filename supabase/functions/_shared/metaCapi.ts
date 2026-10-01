/**
 * Meta Conversions API (server-side) — Fitmind
 * ---------------------------------------------
 * Envia eventos direto do servidor para a Meta. Complementa o Pixel do navegador:
 * recupera conversões perdidas por bloqueador de anúncios, Safari/iOS (ITP) e aba
 * fechada antes da página /success.
 *
 * Deduplicação: o navegador dispara `fbq('track','Purchase', ..., { eventID })` e o
 * servidor manda o MESMO `event_id` (o id da sessão do Stripe). A Meta conta uma vez.
 *
 * Secrets necessários (Supabase → Edge Functions → Secrets):
 *   META_PIXEL_ID            ex.: 4440563289541452
 *   META_CAPI_ACCESS_TOKEN   token gerado em Events Manager → Configurações → Conversions API
 * Opcionais:
 *   META_TEST_EVENT_CODE     código da aba "Testar eventos" (remova em produção)
 *   META_GRAPH_VERSION       padrão v23.0
 *
 * Sem os secrets a função vira no-op (não quebra o webhook).
 *
 * PRIVACIDADE: nunca inclua dados de saúde em custom_data. Só value/currency/nome do produto.
 */

declare const Deno: {
  env: { get(key: string): string | undefined };
};

export interface MetaCapiEvent {
  eventName: 'Purchase' | 'Lead' | 'CompleteRegistration' | 'InitiateCheckout' | 'Subscribe';
  eventId: string;
  eventTime?: number; // epoch em segundos
  eventSourceUrl?: string;
  email?: string | null;
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  value?: number;
  currency?: string;
  contentName?: string;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sendMetaCapiEvent(evt: MetaCapiEvent): Promise<void> {
  const pixelId = Deno.env.get('META_PIXEL_ID');
  const token = Deno.env.get('META_CAPI_ACCESS_TOKEN');
  if (!pixelId || !token) {
    console.log('[meta-capi] META_PIXEL_ID/META_CAPI_ACCESS_TOKEN não configurados; evento ignorado.');
    return;
  }

  const userData: Record<string, unknown> = {};
  if (evt.email) userData.em = [await sha256(evt.email.trim().toLowerCase())];
  if (evt.externalId) userData.external_id = [await sha256(evt.externalId)];
  if (evt.fbp) userData.fbp = evt.fbp;
  if (evt.fbc) userData.fbc = evt.fbc;
  if (evt.clientIp) userData.client_ip_address = evt.clientIp;
  if (evt.clientUserAgent) userData.client_user_agent = evt.clientUserAgent;

  const customData: Record<string, unknown> = {};
  if (typeof evt.value === 'number') {
    customData.value = evt.value;
    customData.currency = (evt.currency || 'BRL').toUpperCase();
  }
  if (evt.contentName) {
    customData.content_name = evt.contentName;
    customData.content_type = 'product';
  }

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: evt.eventName,
        event_time: evt.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: evt.eventId,
        // 'website' exige client_user_agent. Se por algum motivo não veio (ex.: sessão antiga),
        // enviamos como 'system_generated' para não ser rejeitado (perde só um pouco de match).
        action_source: evt.clientUserAgent ? 'website' : 'system_generated',
        event_source_url: evt.eventSourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  const testCode = Deno.env.get('META_TEST_EVENT_CODE');
  if (testCode) body.test_event_code = testCode;

  const version = Deno.env.get('META_GRAPH_VERSION') || 'v23.0';
  const url = `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[meta-capi] ${evt.eventName} falhou (${res.status}): ${text}`);
    } else {
      console.log(`[meta-capi] ${evt.eventName} enviado (event_id=${evt.eventId}): ${text}`);
    }
  } catch (err) {
    console.error('[meta-capi] erro de rede:', err instanceof Error ? err.message : String(err));
  }
}
