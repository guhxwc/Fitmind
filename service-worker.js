
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'fitmind-v1';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
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
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/', // URL de destino
      dateOfArrival: Date.now()
    },
    actions: [
      {action: 'explore', title: 'Abrir App', icon: 'images/checkmark.png'}
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
