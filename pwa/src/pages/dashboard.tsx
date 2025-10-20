import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearTokenFallback, getUser } from "../utils/auth";
import TutorDashboard from "../components/dashboard/tutorDashboard";
import VeterinarioDashboard from "../components/dashboard/veterinarioDashboard";
import ClinicaDashboard from "../components/dashboard/clinicaDashboard";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

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
        setUser(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, API_URL]);

  // 🔔 Conexão Pusher / Echo para veterinário e clínica
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
      console.log("Token Echo:", token);

      if (user.tipo === "veterinario") {

        
        echo.private("veterinarios").listen("NovaEmergenciaCriada", (data: any) => {
          console.log("Nova emergência veterinário:", data);
          alert(`🚨 Nova emergência registrada: ${data.emergencia.titulo}`);
        });
      }

      if (user.tipo === "clinica") {

        echo.private("clinicas").listen("NovaEmergenciaCriada", (data: any) => {
          console.log("Nova emergência clínica:", data);
          alert(`🚨 Nova emergência próxima: ${data.emergencia.titulo}`);
        });
      }
    } catch (e) {
      console.error("Erro ao inicializar Pusher/Echo:", e);
    }


    return () => {
      if (echo) echo.disconnect();
    };
  }, [user, API_URL]);

  function handleLogout() {
    clearTokenFallback();
    setUser(null);
    navigate("/");
  }

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
