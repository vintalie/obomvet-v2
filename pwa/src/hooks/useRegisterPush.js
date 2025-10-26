import { useEffect } from "react";

export default function useRegisterPush(API_URL, token) {
  useEffect(() => {
    async function registerPush() {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      });

      await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sub),
      });

      console.log("✅ Push registrado com sucesso");
    }

    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerPush().catch(console.error);
    }
  }, [API_URL, token]);
}
