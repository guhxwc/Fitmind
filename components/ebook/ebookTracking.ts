// Rastreio detalhado das páginas /ebook e /ebook/oferta no PostHog.
// Objetivo: saber ONDE cada visitante desiste (e o que acontecia naquele momento), com precisão.
// Nada aqui altera o visual ou o comportamento da página: só observa e envia eventos.
import { useEffect } from 'react';
import { track, posthogClient, registerSuperProperties } from '../../lib/analytics';

type Page = 'landing' | 'upsell';

/** Estado compartilhado entre os componentes e o rastreio (nunca renderiza nada). */
export const ebookState = {
  page: 'landing' as Page,
  startedAt: Date.now(),
  quizStarted: false,
  quizCompleted: false,
  quizStep: -1,
  questionShownAt: 0,
  clickedBuy: false,
  checkoutPhase: 'idle' as 'idle' | 'creating' | 'redirecting' | 'error',
  maxScroll: 0,
  maxSection: '',
  maxSectionIndex: -1,
  interactions: 0,
};

export function ebookTrack(name: string, props?: Record<string, any>): void {
  try {
    track(name, { ebook_page: ebookState.page, ...props });
  } catch {
    /* analytics nunca pode quebrar a página */
  }
}

// ── Contexto do visitante ───────────────────────────────────────────────
export function detectInAppBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'facebook';
  if (/TikTok|musical_ly|BytedanceWebview|trill/i.test(ua)) return 'tiktok';
  if (/WhatsApp/i.test(ua)) return 'whatsapp';
  if (/Line\//i.test(ua)) return 'line';
  return 'none';
}

function deviceClass(): string {
  const w = typeof window !== 'undefined' ? window.innerWidth : 0;
  return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

const secs = () => Math.round((Date.now() - ebookState.startedAt) / 100) / 10;

// ── Seções observadas (na ordem em que aparecem na página) ───────────────
const SECTIONS: Record<Page, Array<[string, string]>> = {
  landing: [
    ['mhero', '.fm-ebook .mhero'],
    ['hero', '.fm-ebook .hero'],
    ['pain', '.fm-ebook .pain'],
    ['inside', '.fm-ebook .inside'],
    ['preview', '.fm-ebook .preview'],
    ['authority', '.fm-ebook .auth'],
    ['offer', '.fm-ebook #oferta'],
    ['faq', '.fm-ebook .faq'],
    ['final', '.fm-ebook .final'],
  ],
  upsell: [
    ['versus', '.fm-ebook .versus'],
    ['app', '.fm-ebook .app'],
    ['gap', '.fm-ebook .gap'],
    ['allan', '.fm-ebook .allan'],
    ['plans', '.fm-ebook .plans'],
  ],
};

function sectionOf(el: Element | null): string {
  if (!el) return 'page';
  if (el.closest('.sticky')) return 'sticky_mobile';
  if (el.closest('.checkout-canceled')) return 'cancel_banner';
  for (const [name, sel] of SECTIONS[ebookState.page]) {
    const node = document.querySelector(sel);
    if (node && node.contains(el)) return name;
  }
  return 'page';
}

// ── Checkout: guarda quando foi para o Stripe e liga o visitante ao pagamento ──
export function markCheckoutStarted(sessionId?: string | null): void {
  ebookState.checkoutPhase = 'redirecting';
  try {
    sessionStorage.setItem('ebook_checkout_started_at', String(Date.now()));
  } catch { /* ignore */ }
  if (sessionId) {
    try {
      // Liga este visitante ao id da sessão do Stripe. Assim o evento "ebook_paid", enviado pelo
      // servidor (mesmo se a pessoa pagar o Pix no app do banco e nunca voltar), cai na MESMA pessoa.
      (posthogClient as any).alias(sessionId);
    } catch { /* ignore */ }
  }
}

export function secondsSinceCheckoutStarted(): number | null {
  try {
    const t = Number(sessionStorage.getItem('ebook_checkout_started_at'));
    return t ? Math.round((Date.now() - t) / 1000) : null;
  } catch {
    return null;
  }
}

// ── Hook principal ──────────────────────────────────────────────────────
export function useEbookTracking(page: Page): void {
  useEffect(() => {
    ebookState.page = page;
    ebookState.startedAt = Date.now();
    ebookState.maxScroll = 0;
    ebookState.maxSection = '';
    ebookState.maxSectionIndex = -1;
    ebookState.interactions = 0;

    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (/^utm_/.test(k)) utm[k] = v;
    });
    const inApp = detectInAppBrowser();
    const device = deviceClass();

    // Atributos que acompanham TODOS os eventos seguintes (inclusive na página de oferta,
    // onde a URL já não tem UTMs).
    if (page === 'landing') {
      try {
        registerSuperProperties({
          ebook_utm_source: utm.utm_source ?? null,
          ebook_utm_campaign: utm.utm_campaign ?? null,
          ebook_utm_content: utm.utm_content ?? null,
          ebook_has_fbclid: params.has('fbclid'),
          ebook_in_app_browser: inApp,
          ebook_device_class: device,
        });
      } catch { /* ignore */ }
    }

    let refDomain = '';
    try { refDomain = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* ignore */ }

    ebookTrack('ebook_page_view', {
      in_app_browser: inApp,
      device_class: device,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      referrer_domain: refDomain || null,
      ...utm,
    });

    // Volta do Stripe pelo "voltar": quanto tempo ficou na tela de pagamento
    if (page === 'landing' && params.get('checkout') === 'cancelado') {
      ebookTrack('ebook_checkout_canceled_return', { seconds_on_stripe: secondsSinceCheckoutStarted() });
    }

    // ── Qualidade da conexão e tempo de carregamento ──
    const sendTiming = () => {
      try {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        const conn = (navigator as any).connection || {};
        ebookTrack('ebook_page_timing', {
          ttfb_ms: nav ? Math.round(nav.responseStart) : null,
          dom_interactive_ms: nav ? Math.round(nav.domInteractive) : null,
          load_ms: nav ? Math.round(nav.loadEventEnd) : null,
          transfer_kb: nav ? Math.round((nav.transferSize || 0) / 1024) : null,
          connection_type: conn.effectiveType ?? null,
          downlink_mbps: conn.downlink ?? null,
          rtt_ms: conn.rtt ?? null,
          save_data: conn.saveData ?? null,
          device_memory_gb: (navigator as any).deviceMemory ?? null,
        });
      } catch { /* ignore */ }
    };
    let loadListener: (() => void) | null = null;
    if (document.readyState === 'complete') {
      setTimeout(sendTiming, 0);
    } else {
      loadListener = () => setTimeout(sendTiming, 0);
      window.addEventListener('load', loadListener, { once: true });
    }

    // ── Profundidade de rolagem ──
    // No app, quem rola é o elemento #root (html/body ficam com overflow:hidden); por isso o
    // evento de scroll é escutado em "captura" no document e a medida vem do #root.
    const getScroller = (): HTMLElement => {
      const root = document.getElementById('root') as HTMLElement | null;
      if (root && root.scrollHeight > root.clientHeight + 10) return root;
      return (document.scrollingElement as HTMLElement) || document.documentElement;
    };
    const firedDepth = new Set<number>();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const sc = getScroller();
        const total = Math.max(sc.scrollHeight, 1);
        const top = sc.scrollTop || window.scrollY || 0;
        const view = sc.clientHeight || window.innerHeight;
        const pct = Math.min(100, Math.round(((top + view) / total) * 100));
        if (pct > ebookState.maxScroll) ebookState.maxScroll = pct;
        [25, 50, 75, 100].forEach((m) => {
          if (pct >= m && !firedDepth.has(m)) {
            firedDepth.add(m);
            ebookTrack('ebook_scroll_depth', { depth_pct: m, seconds_since_load: secs() });
          }
        });
      });
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    onScroll();

    // ── Seções vistas + tempo de leitura em cada uma ──
    const defs = SECTIONS[page];
    const seen = new Set<string>();
    const visibleNow = new Set<string>();
    const since: Record<string, number> = {};
    const dwellMs: Record<string, number> = {};
    const flushDwell = () => {
      const now = Date.now();
      visibleNow.forEach((name) => {
        if (since[name]) {
          dwellMs[name] = (dwellMs[name] || 0) + (now - since[name]);
          since[name] = now;
        }
      });
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const name = (entry.target as HTMLElement).dataset.ebookSection || '';
            if (!name) return;
            const tall = entry.intersectionRect.height >= window.innerHeight * 0.4;
            const visible = entry.isIntersecting && (entry.intersectionRatio >= 0.2 || tall);
            if (visible && !visibleNow.has(name)) {
              visibleNow.add(name);
              since[name] = Date.now();
              if (!seen.has(name)) {
                seen.add(name);
                const idx = defs.findIndex(([n]) => n === name);
                if (idx > ebookState.maxSectionIndex) {
                  ebookState.maxSectionIndex = idx;
                  ebookState.maxSection = name;
                }
                ebookTrack('ebook_section_view', { section: name, order: idx + 1, seconds_since_load: secs() });
              }
            } else if (!visible && visibleNow.has(name)) {
              dwellMs[name] = (dwellMs[name] || 0) + (Date.now() - (since[name] || Date.now()));
              visibleNow.delete(name);
              since[name] = 0;
            }
          });
        },
        { threshold: [0, 0.2, 0.5, 0.8] }
      );
      // as seções são montadas junto com a página; tenta já e mais uma vez logo depois
      const attach = () => {
        defs.forEach(([name, sel]) => {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (el && !el.dataset.ebookSection) {
            el.dataset.ebookSection = name;
            observer!.observe(el);
          }
        });
      };
      attach();
      setTimeout(attach, 600);
    }

    // ── Cliques: botões (com a seção) e perguntas do FAQ (objeções) ──
    const onClick = (ev: MouseEvent) => {
      ebookState.interactions += 1;
      const t = ev.target as HTMLElement | null;
      if (!t || !t.closest) return;

      const faq = t.closest('.fm-ebook .faq summary') as HTMLElement | null;
      if (faq) {
        const d = faq.parentElement as HTMLDetailsElement | null;
        ebookTrack('ebook_faq_toggle', {
          question: (faq.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90),
          will_open: !(d && d.open),
        });
        return;
      }
      const el = t.closest('a,button') as HTMLElement | null;
      if (!el || el.classList.contains('q-opt') || el.classList.contains('q-back')) return;
      const isBuy = el.hasAttribute('data-checkout') || el.classList.contains('btn-buy');
      ebookTrack('ebook_cta_click', {
        label: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        section: sectionOf(el),
        kind: isBuy ? 'buy' : 'other',
        seconds_since_load: secs(),
      });
    };
    document.addEventListener('click', onClick, true);

    // ── Tempo realmente visível na tela (ignora aba/app em segundo plano) ──
    let visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
    let visibleMs = 0;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushDwell();
        visibleNow.forEach((n) => { since[n] = 0; });
        if (visibleSince) { visibleMs += Date.now() - visibleSince; visibleSince = 0; }
        ebookTrack('ebook_page_hidden', { seconds_since_load: secs(), checkout_phase: ebookState.checkoutPhase });
      } else {
        visibleSince = Date.now();
        visibleNow.forEach((n) => { since[n] = Date.now(); });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ── Erros de JavaScript (se a página quebrar para alguém, a gente vê) ──
    let errCount = 0;
    const onError = (e: ErrorEvent) => {
      if (errCount++ >= 5) return;
      ebookTrack('ebook_js_error', {
        message: String(e.message || '').slice(0, 200),
        source: String(e.filename || '').slice(-80),
        line: e.lineno ?? null,
      });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (errCount++ >= 5) return;
      ebookTrack('ebook_js_error', { message: String((e.reason && e.reason.message) || e.reason || '').slice(0, 200), source: 'promise' });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    // ── Saída: onde a pessoa estava quando foi embora ──
    let sent = false;
    const exitStage = (): string => {
      if (ebookState.checkoutPhase === 'redirecting') return 'went_to_checkout';
      if (ebookState.checkoutPhase === 'error') return 'checkout_error';
      if (ebookState.clickedBuy) return 'clicked_buy_then_left';
      if (page === 'upsell') return 'upsell_exit';
      if (ebookState.quizCompleted) return 'after_quiz_result';
      if (ebookState.quizStarted) return `quiz_question_${Math.max(ebookState.quizStep, 0) + 1}`;
      if (ebookState.maxScroll < 25 && Date.now() - ebookState.startedAt < 8000) return 'bounce_fast';
      return ebookState.maxSection ? `read_until_${ebookState.maxSection}` : 'no_scroll';
    };

    const sendExit = (viaBeacon: boolean) => {
      if (sent) return;
      sent = true;
      flushDwell();
      if (visibleSince) { visibleMs += Date.now() - visibleSince; visibleSince = 0; }
      const stage = exitStage();
      const dwellSec: Record<string, number> = {};
      Object.keys(dwellMs).forEach((k) => { dwellSec[k] = Math.round(dwellMs[k] / 100) / 10; });
      const name =
        stage === 'went_to_checkout' ? 'ebook_leave_to_checkout' : page === 'landing' ? 'ebook_abandon' : 'ebook_upsell_exit';
      const props = {
        ebook_page: page,
        exit_stage: stage,
        time_on_page_s: secs(),
        visible_s: Math.round(visibleMs / 100) / 10,
        max_scroll_pct: ebookState.maxScroll,
        max_section: ebookState.maxSection || null,
        sections_seen: seen.size,
        section_dwell_s: dwellSec,
        quiz_started: ebookState.quizStarted,
        quiz_question_reached: ebookState.quizStep >= 0 ? ebookState.quizStep + 1 : 0,
        quiz_completed: ebookState.quizCompleted,
        clicked_buy: ebookState.clickedBuy,
        interactions: ebookState.interactions,
        in_app_browser: inApp,
        device_class: device,
      };
      try {
        if ((posthogClient as any).__loaded) {
          (posthogClient as any).capture(name, props, viaBeacon ? { transport: 'sendBeacon' } : undefined);
        }
      } catch { /* ignore */ }
    };
    const onPageHide = () => sendExit(true);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      sendExit(false);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      if (loadListener) window.removeEventListener('load', loadListener);
      if (observer) observer.disconnect();
    };
  }, [page]);
}
