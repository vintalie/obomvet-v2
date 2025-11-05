// pwa/src/pages/dashboard.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearTokenFallback, getUser } from "../utils/auth";
import TutorDashboard from "../components/dashboard/tutorDashboard";
import VeterinarioDashboard from "../components/dashboard/veterinarioDashboard";
import ClinicaDashboard from "../components/dashboard/clinicaDashboard";
import PetDashboard from "../components/dashboard/petDashboard";
import { echo } from "../services/echo";
import { registerServiceWorkerAndSubscribe } from "../services/webpush";

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
  const [activeTab, setActiveTab] = useState<"home" | "pets" | "reports">("home");

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  // Ref para manter canal Pusher/Echo ativo
  const channelRef = useRef<any>(null);

  // === Carregar usuário autenticado ===
const initialized = useRef(false);

useEffect(() => {
  if (initialized.current) return; // evita execução duplicada
  initialized.current = true;
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

  // === Registrar Push Subscription ao carregar usuário ===
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        await registerServiceWorkerAndSubscribe();
        console.log("Web Push subscription registrada/enviada ao backend (se permitido).");
      } catch (err) {
        console.warn("Falha ao registrar Web Push:", err);
      }
    })();
  }, [user]);

  // === Echo / Pusher / Notificações ===
  useEffect(() => {
    if (!user) return;

    // Evita criar múltiplos canais
    if (channelRef.current) return;

    const sendNotificationToSW = (event: any, titlePrefix = "🚨 Nova Emergência!") => {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(titlePrefix, {
            body: event?.message || "Emergência registrada",
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-72x72.png",
            data: { url: `/emergencias/${event.id}` },
            vibrate: [200, 100, 200],
            requireInteraction: true,
          });
        });
      } else {
        alert(`${titlePrefix} ${event?.message || ""}`);
      }
    };

    try {
      let channel: any;

      if (user.tipo === "veterinario") {
        channel = echo.private("veterinarios");
        channel.subscribed(() => console.log("✅ Subscrito ao canal privado veterinarios"));
        channel.listen(".NovaEmergencia", (event: any) =>
          sendNotificationToSW(event, "🚨 Nova Emergência Veterinário!")
        );
      } else if (user.tipo === "clinica") {
        channel = echo.private("clinicas");
        channel.subscribed(() => console.log("✅ Subscrito ao canal privado clinicas"));
        channel.listen(".NovaEmergencia", (event: any) =>
          sendNotificationToSW(event, "🚨 Nova Emergência Próxima!")
        );
      } else {
        channel = echo.private(`usuarios.${user.id}`);
        channel.subscribed(() =>
          console.log(`✅ Subscrito canal usuarios.${user.id}`)
        );
        channel.listen(".NovaEmergencia", (event: any) =>
          sendNotificationToSW(event, "🚨 Nova Emergência!")
        );
      }

      channelRef.current = channel;
    } catch (err) {
      console.error("Erro ao configurar Echo/Pusher:", err);
    }

    // cleanup/unsubscribe ao desmontar
    return () => {
      try {
        if (channelRef.current && typeof channelRef.current.unsubscribe === "function") {
          channelRef.current.unsubscribe();
          console.log("Desinscrito do canal Pusher");
          channelRef.current = null;
        }
      } catch (e) {
        console.warn("Erro ao desinscrever do canal:", e);
      }
    };
  }, [user]);

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
      return (
        <TutorDashboard
          user={user}
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        >
          {activeTab === "pets" && <PetDashboard currentUser={user} />}
        </TutorDashboard>
      );

    case "veterinario":
      return <VeterinarioDashboard user={user} onLogout={handleLogout} />;

    case "clinica":
      return <ClinicaDashboard user={user} onLogout={handleLogout} />;

    default:
      return <p>Tipo de usuário inválido.</p>;
  }
}
