import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getToken } from "../utils/auth";

Pusher.logToConsole = true; // Ativa logs detalhados do Pusher

const token = getToken();
console.log("JWT token usado no Echo:", token);

const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: "http://localhost:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  },
});

// =========================
// Debug da conexão Pusher
// =========================
echo.connector.pusher.connection.bind('connected', () => {
  console.log('✅ Pusher conectado com sucesso');
});

echo.connector.pusher.connection.bind('disconnected', () => {
  console.log('⚠️ Pusher desconectado');
});

echo.connector.pusher.connection.bind('error', (err: any) => {
  console.error('❌ Erro na conexão Pusher:', err);
});

// =========================
// Escuta canal privado 'clinicas'
// =========================
const channel = echo.private("clinicas");

channel.subscribed(() => {
  console.log('✅ Subscrito ao canal privado clinicas');
});

channel.subscription_error((status: any) => {
  console.error('❌ Falha ao subscrever ao canal clinicas:', status);
});

channel.listen("NotificacaoDeTeste", (event: any) => {
  console.log("📣 Evento NotificacaoDeTeste recebido:", event);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      console.log("🔔 Enviando notificação pelo Service Worker...");
      registration.showNotification(event.title || "Nova Notificação", {
        body: event.body || "Clique para mais detalhes",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        data: event.data || {},
        vibrate: [100, 50, 100],
        requireInteraction: true,
      });
    });
  }
});

// =========================
// Debug para qualquer outro evento
// =========================
channel.bind_global((event: string, data: any) => {
  console.log(`🌐 Evento global recebido [${event}]:`, data);
});

export default echo;
