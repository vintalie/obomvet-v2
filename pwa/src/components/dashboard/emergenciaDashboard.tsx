import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Plus, Trash2, Edit2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Emergency {
  id: number;
  pet_nome: string;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
  status: "aberta" | "em_atendimento" | "concluida" | "cancelada";
  data_abertura: string;
}

export default function EmergencyDashboardPage() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  const [emergencias, setEmergencias] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchEmergencias() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/api/minhas-emergencias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar emergências");
        const data = await res.json();
        setEmergencias(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro inesperado");
      } finally {
        setLoading(false);
      }
    }

    fetchEmergencias();
  }, [API_URL, navigate]);

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta emergência?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/emergencias/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir emergência");
      setEmergencias((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir emergência");
    }
  };

  if (loading) return <p className="p-6 text-center">Carregando emergências...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <PawPrint size={28} /> Emergências
          </h1>
          <button
            onClick={() => navigate("/reportInput")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <AlertTriangle size={18} /> Chamar Emergência
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Sintomas</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Urgência</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emergencias.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{e.pet_nome}</td>
                  <td className="px-6 py-4">{e.descricao_sintomas.slice(0, 30)}...</td>
                  <td className="px-6 py-4">{e.nivel_urgencia}</td>
                  <td className="px-6 py-4">{e.status}</td>
                  <td className="px-6 py-4">{new Date(e.data_abertura).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => navigate(`/report-input?edit=${e.id}`)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {emergencias.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma emergência registrada.
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
