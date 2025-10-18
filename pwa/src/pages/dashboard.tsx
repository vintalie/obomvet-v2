import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getToken, clearTokenFallback } from "../utils/auth";
import {
  Home,
  Settings,
  AlertTriangle,
  Dog,
  ArrowLeft,
  UserCircle,
  PawPrint,
} from "lucide-react";

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
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("Token inválido ou expirado.");
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao buscar dados do usuário.");
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, API_URL]);

  function handleLogout() {
    clearTokenFallback();
    navigate("/");
  }

  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (error)
    return <p className="p-6 text-center text-red-500">{error}</p>;

  const isTutor = user?.tipo === "tutor";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>
       <Link to="/" className="flex items-center gap-3">
        <PawPrint className="w-9 h-9" />
        <span className="text-3xl font-extrabold">oBomVet</span>
      </Link>
        <UserCircle size={28} />
      </header>

      {/* Conteúdo */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-r flex flex-col justify-between">
          <nav className="p-3 space-y-2">
            <Link
              to="#"
              className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2"
            >
              <Home size={18} />
              Início
            </Link>
            {isTutor && (
              <Link
                to="#"
                className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
              >
                <Dog size={18} />
                Pets
              </Link>
            )}
            <Link
              to="#"
              className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
            >
              <AlertTriangle size={18} />
              Emergência
            </Link>
          </nav>
          <Link
            to="#"
            className="flex items-center gap-2 px-3 py-2 border-t hover:bg-gray-100"
          >
            <Settings size={18} />
            Configurações
          </Link>
        </aside>

        {/* Área principal */}
        <main className="flex-1 p-6">
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-white max-w-lg mx-auto shadow-sm">
            <h2 className="text-xl font-semibold">
              Olá, {isTutor ? "usuário" : "clínica"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget
              ligula.
            </p>

            <button
              onClick={() =>
                navigate(isTutor ? "/novaEmergencia" : "/verificarEmergencia")
              }
              className="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-medium"
            >
              {isTutor ? "Criar emergência" : "Verificar emergência"}
            </button>

            <button
              onClick={handleLogout}
              className="mt-4 block text-sm text-red-500 underline"
            >
              Sair
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
