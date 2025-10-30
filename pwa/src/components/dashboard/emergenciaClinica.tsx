import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw, PawPrint, Clock } from "lucide-react";

interface Emergencia {
  id: number;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
  pet?: { nome: string };
  tutor?: { nome_completo: string };
  created_at?: string;
}

export default function EmergenciasClinica() {
  const [emergencias, setEmergencias] = useState<Emergencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === Carregar emergências da clínica ===
  async function fetchEmergencias() {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const res = await fetch("http://127.0.0.1:8000/api/clinica/emergencias", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar emergências (${res.status}): ${text}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Resposta inesperada da API.");

      setEmergencias(data);
    } catch (err: any) {
      console.error("Erro ao carregar emergências:", err);
      setError(err.message || "Erro ao carregar emergências.");
    } finally {
      setLoading(false);
    }
  }

  // Carrega emergências ao montar o componente
  useEffect(() => {
    fetchEmergencias();
  }, []);

  // === Função para cor do nível de urgência ===
  const getUrgencyColor = (nivel: Emergencia["nivel_urgencia"]) => {
    switch (nivel) {
      case "baixa":
        return "bg-green-100 text-green-700 border-green-300";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "alta":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "critica":
        return "bg-red-100 text-red-700 border-red-300 font-semibold";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-[#25A18E]" /> Emergências Recebidas
        </h2>
        <button
          onClick={fetchEmergencias}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-[#25A18E] text-white rounded-lg hover:bg-[#208B7C] transition disabled:opacity-60 text-sm"
        >
          <RefreshCw
            size={16}
            className={`transition ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Atualizando..." : "Recarregar"}
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Carregando */}
      {loading && !emergencias.length && (
        <div className="flex items-center justify-center py-10 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Carregando emergências...
        </div>
      )}

      {/* Lista de emergências */}
      {!loading && emergencias.length > 0 ? (
        <div className="grid gap-4">
          {emergencias.map((emg) => (
            <div
              key={emg.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <PawPrint className="text-[#25A18E]" size={18} />
                    {emg.pet?.nome || "Pet não informado"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tutor: {emg.tutor?.nome_completo || "Desconhecido"}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 border rounded-lg ${getUrgencyColor(
                    emg.nivel_urgencia
                  )}`}
                >
                  {emg.nivel_urgencia.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                {emg.descricao_sintomas}
              </p>

              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={14} />
                {emg.created_at
                  ? new Date(emg.created_at).toLocaleString("pt-BR")
                  : "Data não informada"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="text-gray-500 text-sm py-8 text-center">
            Nenhuma emergência registrada ainda.
          </p>
        )
      )}
    </div>
  );
}
