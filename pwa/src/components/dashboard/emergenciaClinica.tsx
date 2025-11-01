import { useEffect, useState } from "react";
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  PawPrint,
  Clock,
  CheckCircle,
  MapPin,
  XCircle,
} from "lucide-react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

interface Emergencia {
  id: number;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
  status: "pendente" | "em_andamento" | "finalizada" | "cancelada";
  visita_tipo?: "domicilio" | "clinica";
  latitude?: number;
  longitude?: number;
  pet?: { nome: string };
  tutor?: { nome_completo: string };
  created_at?: string;
}

export default function EmergenciasClinica() {
  const [emergencias, setEmergencias] = useState<Emergencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusValidos = ["pendente", "em_andamento", "finalizada", "cancelada"] as const;

  const statusLabelMap: Record<string, string> = {
    pendente: "Pendente",
    em_andamento: "Aceita",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  async function fetchEmergencias() {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const res = await fetch(
        "http://127.0.0.1:8000/api/clinica/emergencias",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`Erro ao buscar emergências (${res.status})`);

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

  async function atualizarStatus(id: number, novoStatus: typeof statusValidos[number]) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      const statusFormatado = novoStatus.trim().toLowerCase() as typeof statusValidos[number];

      if (!statusValidos.includes(statusFormatado)) {
        throw new Error("Status inválido.");
      }

      const res = await fetch(`http://127.0.0.1:8000/api/emergencias/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusFormatado }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro do backend:", data);
        throw new Error(data.errors?.status?.[0] || res.statusText);
      }

      setEmergencias((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: data.emergencia.status } : e))
      );
    } catch (err: any) {
      console.error(err);
      alert("Erro ao atualizar emergência: " + err.message);
    }
  }

  function abrirRota(lat?: number, lng?: number) {
    if (!lat || !lng) return alert("Localização do cliente não disponível.");
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  }

  useEffect(() => {
    fetchEmergencias();

    const clinicaId = localStorage.getItem("clinica_id");
    if (!clinicaId) return;

    window.Pusher = Pusher;
    const echo = new Echo({
      broadcaster: "pusher",
      key: "local",
      wsHost: window.location.hostname,
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
    });

    const canal = echo.channel(`emergencias.clinica.${clinicaId}`);

    canal.listen(".EmergenciaAtualizada", (data: any) => {
      setEmergencias((prev) => {
        const existe = prev.find((e) => e.id === data.id);
        if (existe) {
          return prev.map((e) => (e.id === data.id ? { ...e, ...data } : e));
        }
        return [data, ...prev];
      });
    });

    return () => {
      canal.stopListening(".EmergenciaAtualizada");
      echo.disconnect();
    };
  }, []);

  const getUrgencyColor = (nivel: Emergencia["nivel_urgencia"]) => {
    switch (nivel) {
      case "baixa": return "bg-green-100 text-green-700 border-green-300";
      case "media": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "alta": return "bg-orange-100 text-orange-800 border-orange-300";
      case "critica": return "bg-red-100 text-red-700 border-red-300 font-semibold";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusColor = (status: Emergencia["status"]) => {
    switch (status) {
      case "pendente": return "bg-gray-100 text-gray-700 border-gray-300";
      case "em_andamento": return "bg-blue-100 text-blue-700 border-blue-300";
      case "finalizada": return "bg-green-100 text-green-700 border-green-300";
      case "cancelada": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-[#25A18E]" /> Emergências Recebidas
        </h2>
        <button
          onClick={fetchEmergencias}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-[#25A18E] text-white rounded-lg hover:bg-[#208B7C] transition disabled:opacity-60 text-sm"
        >
          <RefreshCw size={16} className={`transition ${loading ? "animate-spin" : ""}`} />
          {loading ? "Atualizando..." : "Recarregar"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading && !emergencias.length && (
        <div className="flex items-center justify-center py-10 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Carregando emergências...
        </div>
      )}

      {!loading && emergencias.length > 0 ? (
        <div className="grid gap-4">
          {emergencias.map((emg) => (
            <div key={emg.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
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

                <div className="flex flex-col gap-1 items-end">
                  <span className={`text-xs px-2 py-1 border rounded-lg ${getUrgencyColor(emg.nivel_urgencia)}`}>
                    {emg.nivel_urgencia.toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 border rounded-lg ${getStatusColor(emg.status)}`}>
                    {statusLabelMap[emg.status] || emg.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-3 leading-relaxed">{emg.descricao_sintomas}</p>

              <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                <Clock size={14} />
                {emg.created_at ? new Date(emg.created_at).toLocaleString("pt-BR") : "Data não informada"}
              </div>

              <div className="flex flex-wrap gap-2">
                {emg.status === "pendente" && (
                  <button
                    onClick={() => atualizarStatus(emg.id, "em_andamento")}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <CheckCircle size={14} /> Aceitar Atendimento
                  </button>
                )}

                {emg.status === "em_andamento" && emg.visita_tipo === "domicilio" && (
                  <button
                    onClick={() => abrirRota(emg.latitude, emg.longitude)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <MapPin size={14} /> Ver Rota
                  </button>
                )}

                {emg.status === "em_andamento" && (
                  <button
                    onClick={() => atualizarStatus(emg.id, "finalizada")}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <XCircle size={14} /> Finalizar
                  </button>
                )}

                {emg.status === "finalizada" && (
                  <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> Atendimento Finalizado
                  </span>
                )}

                {emg.status === "cancelada" && (
                  <span className="text-sm text-red-700 font-medium flex items-center gap-1">
                    <XCircle size={14} /> Atendimento Cancelado
                  </span>
                )}
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
