// src/services/webpush.ts
import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorkerAndSubscribe() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging não é suportado neste navegador.");
    return null;
  }

  try {
    // registra o SW (ajuste o path se necessário - ver nota abaixo)
    const registration = await navigator.serviceWorker.register(`${import.meta.env.VITE_PWA_URL}/sw.js`);

    console.log("Service Worker registrado:", registration);

    // solicita permissão
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Permissão de notificações não concedida.");
      return null;
    }

    // subscreve
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY) : undefined,
    });

    // envia subscription para backend
    await sendSubscriptionToServer(subscription);

    return subscription;
  } catch (err) {
    console.error("Erro ao registrar/subscrever service worker:", err);
    return null;
  }
}

export async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/save-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(subscription),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Erro ao salvar subscription no backend:", data);
      throw new Error(data.message || "Falha ao salvar subscription");
    }

    return await res.json();
  } catch (err) {
    console.error("Erro enviando subscription ao servidor:", err);
    throw err;
  }
}
