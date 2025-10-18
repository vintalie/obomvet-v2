import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getTokenFallback } from "../utils/auth"; // função que retorna o token salvo no login

Pusher.logToConsole = false;

const token = getTokenFallback(); // busca o access_token salvo após o login

const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: "http://localhost:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${token}`, // 🔥 envia o token do login
      Accept: "application/json",
    },
  },
});

export default echo;
