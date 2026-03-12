
/* eslint-disable no-restricted-globals */

// Atualize a versão do cache para forçar a limpeza do cache antigo
const CACHE_NAME = 'fitmind-v2';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpa caches antigos quando uma nova versão do SW é ativada
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Estratégia Network First para navegação (HTML)
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Estratégia Cache First para outros recursos (imagens, etc)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Manipulador de Push (Compatível com FCM e Web Push padrão)
self.addEventListener('push', function(event) {
  let data = {};
  
  if (event.data) {
    try {
      // Tenta parsear JSON (FCM geralmente envia JSON)
      const json = event.data.json();
      
      // Se for payload do Firebase, os dados úteis costumam estar em 'notification' ou 'data'
      if (json.notification) {
          data = {
              title: json.notification.title,
              body: json.notification.body,
              ...json.data // Dados extras como URL
          };
      } else {
          // Payload direto
          data = json;
      }
    } catch (e) {
      // Se não for JSON, usa texto puro como corpo
      data = { title: 'FitMind', body: event.data.text() };
    }
  } else {
    data = { title: 'FitMind', body: 'Nova notificação' };
  }

  const options = {
    body: data.body,
    icon: 'https://i.imgur.com/ODw5n6r.png',
    badge: 'https://i.imgur.com/ODw5n6r.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/', // URL de destino
      dateOfArrival: Date.now()
    },
    actions: [
      {action: 'explore', title: 'Abrir App'}
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FitMind', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      // Se já tiver uma aba aberta, foca nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
