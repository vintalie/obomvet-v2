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
  History,
  Activity,
} from "lucide-react";
import PetDashboard from "../components/dashboard/petDashboard";
interface User {
  id: number;
  name: string;
  email: string;
  tipo: "tutor" | "veterinario";
}

interface Emergencia {
  id: number;
  status: string;
  descricao: string;
  pet_nome?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emergencias, setEmergencias] = useState<Emergencia[]>([]);
  const [showPets, setShowPets] = useState(false); // 👈 Estado para abrir/fechar o PetDashboard

  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/me`, {
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

  useEffect(() => {
    if (!user) return;
    const token = getToken();

    if (user.tipo === "veterinario") {
      fetch(`${API_URL}/api/emergencias`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setEmergencias)
        .catch(() => setEmergencias([]));
    }
  }, [user, API_URL]);

  function handleLogout() {
    clearTokenFallback();
    navigate("/");
  }

  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

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
        <aside className="w-56 bg-white border-r flex flex-col justify-between">
          <nav className="p-3 space-y-2">
            <Link
              to="#"
              className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2"
            >
              <Home size={18} />
              Início
            </Link>

            {isTutor ? (
              <>
                <Link
                  to="#"
                  onClick={() => setShowPets(true)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
                >
                  <Dog size={18} />
                  Meus Pets
                </Link>

                <Link
                  to="/novaEmergencia"
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
                >
                  <AlertTriangle size={18} />
                  Registrar Emergência
                </Link>

                <Link
                  to="/historicoEmergencias"
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
                >
                  <History size={18} />
                  Histórico
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/emergencias"
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
                >
                  <AlertTriangle size={18} />
                  Emergências Recebidas
                </Link>

                <Link
                  to="/emergencias-ativas"
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
                >
                  <Activity size={18} />
                  Em andamento
                </Link>
              </>
            )}
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
        <main className="flex-1 p-6 overflow-y-auto">
          {isTutor ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Bem-vindo, {user?.name} 🐾
              </h2>
              <p className="text-gray-500">
                O que você deseja fazer hoje?
              </p>

              {/* Botões principais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowPets((v) => !v)}
                  className="bg-white shadow rounded-xl p-4 hover:bg-gray-50 border"
                >
                  <Dog className="mx-auto mb-2" size={28} />
                  <span>{showPets ? "Fechar Pets" : "Cadastrar Pets"}</span>
                </button>

                <button
                  onClick={() => navigate("/novaEmergencia")}
                  className="bg-white shadow rounded-xl p-4 hover:bg-gray-50 border"
                >
                  <AlertTriangle className="mx-auto mb-2 text-red-500" size={28} />
                  <span>Registrar Emergência</span>
                </button>

                <button
                  onClick={() => navigate("/historicoEmergencias")}
                  className="bg-white shadow rounded-xl p-4 hover:bg-gray-50 border"
                >
                  <History className="mx-auto mb-2 text-blue-500" size={28} />
                  <span>Ver Histórico</span>
                </button>
              </div>

              {/* Aqui aparece o PetDashboard quando showPets = true */}
              {showPets && (
                <div className="mt-8 border-t pt-6">
                  <PetDashboard />
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Emergências Recentes 🚑
              </h2>

              {emergencias.length === 0 ? (
                <p className="text-gray-500">Nenhuma emergência ativa no momento.</p>
              ) : (
                <div className="space-y-3">
                  {emergencias.map((emg) => (
                    <div
                      key={emg.id}
                      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Emergência #{emg.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {emg.descricao || "Sem descrição"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            emg.status === "aberta"
                              ? "bg-red-100 text-red-600"
                              : emg.status === "em_andamento"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {emg.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-6 text-sm text-red-500 underline"
          >
            Sair
          </button>
        </main>
      </div>
    </div>
  );
}