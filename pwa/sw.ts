/// <reference lib="webworker" />

// Força o TS a tratar self como ServiceWorkerGlobalScope
const swSelf = self as unknown as ServiceWorkerGlobalScope;

swSelf.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {
    title: 'Nova Notificação',
    body: 'Você recebeu uma notificação!',
    data: {}
  };

  const options: NotificationOptions = {
    body: data.body || 'Clique para mais detalhes',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.data || {},
    vibrate: [100, 50, 100],
    requireInteraction: true,
  };

  event.waitUntil(
    swSelf.registration.showNotification(data.title || 'Nova Notificação', options)
  );
});

swSelf.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    swSelf.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return swSelf.clients.openWindow(url);
    })
  );
});
