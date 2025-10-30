import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw, PawPrint, Clock } from "lucide-react";
import { Edit2, Trash2, Phone } from "lucide-react";
import { getToken, getUser } from "../../utils/auth"; // ajuste caminho se necessário

interface Emergencia {
  id: number;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
  pet?: { nome: string };
  tutor?: { id?: number; nome_completo?: string };
  created_at?: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// Maps para manter peerConnections/streams por emergência (caso precise de múltiplas)
const pcs = new Map<number, RTCPeerConnection>();
const localStreams = new Map<number, MediaStream>();

export default function EmergenciasClinica() {
  const [emergencias, setEmergencias] = useState<Emergencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEmergencias() {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const res = await fetch(`${API_URL}/api/clinica/emergencias`, {
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

  useEffect(() => {
    fetchEmergencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Inicia chamada para o tutor daquela emergência (áudio)
  async function iniciarChamada(emg: Emergencia) {
    try {
      if (!emg.tutor?.id) {
        alert("Tutor não disponível para chamada.");
        return;
      }

      const tutorId = emg.tutor.id;
      const token = getToken();
      const user = getUser();
      const senderId = user?.id || null;

      // Cria RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Gatilho de ICE: envia candidatos ao outro lado via API
      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          fetch(`${API_URL}/api/webrtc/signal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              target: tutorId,
              signal: { type: "candidate", candidate: ev.candidate },
            }),
          }).catch((e) => console.error("Erro enviando candidate:", e));
        }
      };

      // (Opcional) ontrack: se desejar reproduzir remoto na clínica, implemente
      pc.ontrack = (ev) => {
        // por enquanto, não reproduzimos do lado da clínica
        console.log("Recebeu track remoto", ev.streams);
      };

      // Pega áudio local (microfone)
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreams.set(emg.id, localStream);

      // Adiciona tracks
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      pcs.set(emg.id, pc);

      // Cria oferta
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Envia offer para backend -> backend broadcast via Pusher -> tutor recebe
      await fetch(`${API_URL}/api/webrtc/signal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target: tutorId,
          signal: {
            type: "offer",
            offer,
            senderId,
            emergencyId: emg.id,
          },
        }),
      });

      // Feedback visual pequeno
      alert(`Ligando para ${emg.tutor?.nome_completo || "Tutor"}...`);
    } catch (err: any) {
      console.error("Erro ao iniciar chamada:", err);
      alert("Erro ao iniciar chamada: " + (err.message || err));
    }
  }

  // Encerrar chamada localmente para uma emergência
  function encerrarChamada(emgId: number) {
    const pc = pcs.get(emgId);
    const stream = localStreams.get(emgId);
    pc?.close();
    pcs.delete(emgId);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      localStreams.delete(emgId);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-10 text-gray-500"><Loader2 className="animate-spin mr-2" /> Carregando emergências...</div>;

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
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
          {loading ? "Atualizando..." : "Recarregar"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
          <AlertTriangle size={16} /> {error}
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
                <span className={`text-xs px-2 py-1 border rounded-lg ${getUrgencyColor(emg.nivel_urgencia)}`}>
                  {emg.nivel_urgencia.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                {emg.descricao_sintomas}
              </p>

              <div className="text-xs text-gray-500 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {emg.created_at ? new Date(emg.created_at).toLocaleString("pt-BR") : "Data não informada"}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {/* Botão para ligar (visível somente se existir tutor e id) */}
                  {emg.tutor?.id && (
                    <button
                      onClick={() => iniciarChamada(emg)}
                      className="flex items-center gap-2 px-3 py-1 bg-[#25A18E] text-white rounded-md text-sm hover:bg-[#208B7C]"
                    >
                      <Phone size={16} /> Ligar
                    </button>
                  )}

                  <button
                    onClick={() => encerrarChamada(emg.id)}
                    title="Encerrar chamada (local)"
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Encerrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && (
          <p className="text-gray-500 text-sm py-8 text-center">Nenhuma emergência registrada ainda.</p>
        )
      )}
    </div>
  );
}
