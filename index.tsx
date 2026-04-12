
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './components/ToastProvider';
import { AppContextProvider } from './components/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// ─── CAPTURA SÍNCRONA DO ?ref= ───────────────────────────────────────────────
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
      params.delete('ref');
      const newSearch = params.toString() ? '?' + params.toString() : '';
      window.history.replaceState(null, '', window.location.pathname + newSearch + window.location.hash);
      console.log('[Referral] Código capturado e salvo:', code);
    }
  } catch(e) { /* não quebra o app */ }
})();
// ─────────────────────────────────────────────────────────────────────────────

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

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
