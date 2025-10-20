import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearTokenFallback, getUser } from "../utils/auth";
import TutorDashboard from "../components/dashboard/tutorDashboard";
import VeterinarioDashboard from "../components/dashboard/veterinarioDashboard";
import ClinicaDashboard from "../components/dashboard/clinicaDashboard";

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
