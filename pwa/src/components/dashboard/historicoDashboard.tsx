import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Clock, AlertTriangle, User2, ClipboardList } from "lucide-react";

interface Historico {
  id: number;
  acao_realizada: string;
  data_acao: string;
  emergencia?: {
    id: number;
    pet?: {
      nome: string;
    };
  };
  veterinario?: {
    nome: string;
  };
}

export default function HistoricoDashboardPage() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  const [historicos, setHistoricos] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchHistoricos() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/api/meus-historicos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar históricos");
        const data = await res.json();
        setHistoricos(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro inesperado");
      } finally {
        setLoading(false);
      }
    }

    fetchHistoricos();
  }, [API_URL, navigate]);

  if (loading) return <p className="p-6 text-center">Carregando histórico...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <ClipboardList size={28} /> Histórico de Atendimentos
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            <PawPrint size={18} /> Voltar
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Pet</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ação Realizada</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Veterinário</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historicos.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-2">
                    <PawPrint size={16} className="text-gray-500" />
                    {h.emergencia?.pet?.nome ?? "—"}
                  </td>
                  <td className="px-6 py-4">{h.acao_realizada}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <User2 size={16} className="text-gray-500" />
                    {h.veterinario?.nome ?? "—"}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    {new Date(h.data_acao).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
              {historicos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum histórico de atendimento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
