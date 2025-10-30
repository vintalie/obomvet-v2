/// <reference lib="webworker" />


self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body || "Nova notificação",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notificação", options)
  );
});

// Clicar na notificação abre a URL
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});

