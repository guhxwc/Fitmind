import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PostHogProvider } from 'posthog-js/react';
import App from './App';
import { ToastProvider } from './components/ToastProvider';
import { AppContextProvider } from './components/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initAnalytics, posthogClient, track, AnalyticsEvent } from './lib/analytics';

// Initialize PostHog as early as possible so the very first events are not lost.
initAnalytics();


// ─── CAPTURA SÍNCRONA DO ?ref= ────────────────────────────────────────────────
// Roda ANTES do React montar qualquer coisa.
// Quando o usuário abre /?ref=CODIGO, o React Router ainda não renderizou nada,
// então é seguro salvar aqui e depois limpar a URL.
;(function captureReferralCode() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.trim().length >= 4) {
      const code = ref.trim().toUpperCase();
      localStorage.setItem('affiliate_ref', code);
      sessionStorage.setItem('affiliate_ref', code);
      // Remove o ?ref= da URL imediatamente (antes do React montar)
      params.delete('ref');
      const newSearch = params.toString() ? '?' + params.toString() : '';
      window.history.replaceState(null, '', window.location.pathname + newSearch + window.location.hash);
      console.log('[Referral] Código capturado e salvo:', code);
      track(AnalyticsEvent.referralCodeCaptured, { referral_code: code, source: 'url_query' });
    }
  } catch(e) { /* não quebra o app */ }
})();
// ────────────────────────────────────────────────────────────────────────────────

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <PostHogProvider client={posthogClient}>
        <BrowserRouter>
          <ToastProvider>
            <AppContextProvider>
              <App />
            </AppContextProvider>
          </ToastProvider>
        </BrowserRouter>
      </PostHogProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register Service Worker for PWA capabilities and Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
