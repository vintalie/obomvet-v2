import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearTokenFallback, getUser } from "../utils/auth";
import TutorDashboard from "../components/dashboard/tutorDashboard";
import VeterinarioDashboard from "../components/dashboard/veterinarioDashboard";
import ClinicaDashboard from "../components/dashboard/clinicaDashboard";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import echo from "../services/echo";


interface User {
  id: number;
  name: string;
  email: string;
  tipo: "tutor" | "veterinario" | "clinica";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  // === Carregar usuário autenticado ===
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    const currentUser = getUser();
    if (!currentUser) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/usuarios/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao buscar dados do usuário.");

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, API_URL]);

  // === Echo / Pusher / Notificações ===
  useEffect(() => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    let echo: Echo | null = null;

    try {
      window.Pusher = Pusher;

      echo = new Echo({
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

      const sendNotificationToSW = (data: any) => {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SHOW_NOTIFICATION",
            payload: data
          });
        } else {
          // Fallback: mostra alerta caso SW não esteja ativo
          alert(data.body || "Você recebeu uma notificação!");
        }
      };

      // === Veterinário ===
      if (user.tipo === "veterinario") {
        echo.private("veterinarios")
          .listen("NovaEmergencia", (data: any) => {
            console.log("Nova emergência veterinário:", data);
            sendNotificationToSW({
              title: "🚨 Nova Emergência!",
              body: `Emergência registrada: ${data.emergencia.titulo}`,
              data: { url: `/emergencias/${data.emergencia.id}` },
            });
          })
          .listen("NotificacaoDeTeste", (data: any) => {
            console.log("Notificação de teste veterinário:", data);
            sendNotificationToSW(data);
          });
      }

      // === Clínica ===
      if (user.tipo === "clinica") {
        
        echo.private("clinicas")
          .listen("NovaEmergencia", (data: any) => {
            console.log("Nova emergência clínica:", data);
            sendNotificationToSW({
              title: "🚨 Nova Emergência Próxima!",
              body: `Emergência: ${data.emergencia.titulo}`,
              data: { url: `/emergencias/${data.emergencia.id}` },
            });
          })
          .listen("NotificacaoDeTeste", (data: any) => {
            console.log("Notificação de teste clínica:", data);
            sendNotificationToSW(data);
          });
      }

    } catch (e) {
      console.error("Erro ao inicializar Pusher/Echo:", e);
    }

    return () => {
      if (echo) echo.disconnect();
    };
  }, [user, API_URL]);

  // === Logout ===
  function handleLogout() {
    clearTokenFallback();
    setUser(null);
    navigate("/");
  }

  // === Render ===
  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!user) return null;

  switch (user.tipo) {
    case "tutor":
      return <TutorDashboard user={user} onLogout={handleLogout} />;
    case "veterinario":
      return <VeterinarioDashboard user={user} onLogout={handleLogout} />;
    case "clinica":
      return <ClinicaDashboard user={user} onLogout={handleLogout} />;
    default:
      return <p>Tipo de usuário inválido.</p>;
  }
}
