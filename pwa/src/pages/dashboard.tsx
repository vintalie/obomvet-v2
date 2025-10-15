import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getToken } from "../utils/auth";
import DashboardLayout from "../components/layout/dashboardLayout";
import TutorHome from "../components/dashboard/tutorDashboard";
import ClinicaHome from "../components/dashboard/clinicaDashboard";

interface Pet {
  id: number;
  nome: string;
  especie: string;
  idade: number;
}

interface User {
  id: number;
  name: string;
  tipo: "tutor" | "clinica";
  pets?: Pet[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (!token || !userData) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/usuarios/${userData.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.data))
      .catch(() => navigate("/"));
  }, [navigate, API_URL]);

  if (!user) return <p>Carregando...</p>;

  return (
    <DashboardLayout tipo={user.tipo}>
      {user.tipo === "tutor" ? (
        <TutorHome name={user.name} pets={user.pets ?? []} />
      ) : (
        <ClinicaHome name={user.name} />
      )}
    </DashboardLayout>
  );
}
