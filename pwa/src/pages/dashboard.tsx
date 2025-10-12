import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser, getToken, clearTokenFallback, clearUserFallback } from '../utils/auth';

interface User {
  id: number;
  name: string;
  email: string;
  tipo: "tutor" | "veterinario";
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
    
    fetch(`${API_URL}/api/usuarios/${getUser().id}`, { // tem um erro acontecendo aqui? alguem me ajuda /mario
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("Token inválido ou expirado.");
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao buscar dados do usuário.");
        }
        return res.json();
      })
      .then(data => setUser(data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, API_URL]);

  function handleLogout() {
    clearTokenFallback();
    clearUserFallback();
    navigate("/");
  }

  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>
        Bem-vindo, <strong>{user?.name}</strong>! Tipo de usuário:{" "}
        <strong>{user?.tipo}</strong>
      </p>

      <div className="mt-4 flex gap-4">
        <Link
          to="/reportInput"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Enviar Relatório
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
