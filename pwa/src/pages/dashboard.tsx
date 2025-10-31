import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearTokenFallback, getUser } from "../utils/auth";
import TutorDashboard from "../components/dashboard/tutorDashboard";
import VeterinarioDashboard from "../components/dashboard/veterinarioDashboard";
import ClinicaDashboard from "../components/dashboard/clinicaDashboard";
import PetDashboard from "../components/dashboard/petDashboard";
import { echo } from "../services/echo";

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
console.log("🔑 Token enviado:", token);
console.log("📡 Requisição para:", `${API_URL}/api/usuarios/${currentUser.id}`);

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

  let channel: any;

  const sendNotificationToSW = (event: any, titlePrefix = "🚨 Nova Emergência!") => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(titlePrefix, {
          body: "Emergência registrada",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          data: { url: `/emergencias/${event.id}` },
          vibrate: [200, 100, 200],
          requireInteraction: true,
        });
      });
    } else {
      alert("Nova emergência!");
    }
  };

  if (user.tipo === "veterinario") {
    channel = echo.private("veterinarios");

    channel.subscribed(() => console.log("✅ Subscrito ao canal privado veterinarios"));

    channel.listen(".NovaEmergencia", (event: any) => {
      console.log("🚨 Evento veterinário .NovaEmergencia recebido:", event);
      sendNotificationToSW(event, "🚨 Nova Emergência Veterinário!");
    });
  }

  if (user.tipo === "clinica") {
    channel = echo.private("clinicas");

    channel.subscribed(() => console.log("✅ Subscrito ao canal privado clinicas"));

    channel.listen(".NovaEmergencia", (event: any) => {
      console.log("🚨 Evento clínica .NovaEmergencia recebido:", event);
      sendNotificationToSW(event, "🚨 Nova Emergência Próxima!");
    });
  }

  // ❌ Remover unsubscribe automático
  // return () => {
  //   if (channel) channel.unsubscribe();
  // };

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

  // ---------- RENDER POR TIPO ----------
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
