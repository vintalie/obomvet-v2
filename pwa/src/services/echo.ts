import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getToken } from "../utils/auth";

Pusher.logToConsole = true;
(window as any).Pusher = Pusher;

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const token = getToken();

export const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: `${API_URL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  },
});

// Debug global
echo.connector.pusher.connection.bind("connected", () => console.log("✅ Pusher conectado"));
echo.connector.pusher.connection.bind("disconnected", () => console.log("⚠️ Pusher desconectado"));
echo.connector.pusher.connection.bind("error", (err: any) => console.error("❌ Erro no Pusher:", err));
