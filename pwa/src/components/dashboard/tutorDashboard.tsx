import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Home, Dog, AlertTriangle, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PetDashboard from "./petDashboard";
import DashboardLayout from "./layout/DashboardLayout";
import HistoricoDashboard from "./historicoDashboard";
import EmergencyDashboardPage from "./emergenciaDashboard";
import CallModal from "./layout/CallModal";
import { echo } from "../../services/echo"; // ajusta caminho se necessário
import { getToken } from "../../utils/auth";

export default function TutorDashboard({ user, onLogout }: any) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"home" | "pets" | "emergencias" | "historico">("home");
  const [tooltip, setTooltip] = useState<{ text: string; visible: boolean; y: number }>({
    text: "",
    visible: false,
    y: 0,
  });

  // ---------- Chamada states ----------
  const [incomingCall, setIncomingCall] = useState<{
    senderId: number;
    senderName?: string;
    offer?: any;
    emergencyId?: number;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<any[]>([]);

  // ---------- Pusher / WebRTC listener ----------
  useEffect(() => {
    if (!user?.tutor_id) return;

    const channel = echo.private(`webrtc.${user.tutor_id}`);

    channel.listen(".WebRTCSignal", async (event: any) => {
      try {
        const signal = event.signalData || event.signal || event;
        if (!signal || !signal.type) return;

        console.log("EVENTO RECEBIDO:", signal);

        // ----------------- OFFER -----------------
        if (signal.type === "offer") {
          setIncomingCall({
            senderId: signal.senderId,
            senderName: signal.senderName || "Clínica",
            offer: signal.offer,
            emergencyId: signal.emergencyId,
          });
          setModalVisible(true);
        }

        // ----------------- CANDIDATE -----------------
        if (signal.type === "candidate") {
          // Sempre guarda no pending
          pendingCandidates.current.push(signal.candidate);

          // Só adiciona se o PC existe **e** a remoteDescription já foi definida
          if (pcRef.current && pcRef.current.remoteDescription) {
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
              // remove do pending
              pendingCandidates.current = pendingCandidates.current.filter(c => c !== signal.candidate);
            } catch (e) {
              console.warn("Erro adicionando candidate:", e);
            }
          }
        }


        // ----------------- ANSWER -----------------
        if (signal.type === "answer" && pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.answer));
        }
      } catch (err) {
        console.error("Erro processando sinal:", err);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.tutor_id]);

  // ---------- Funções auxiliares ----------
  const handleTooltip = (text: string, visible: boolean, y = 0) => {
    setTooltip({ text, visible, y });
  };

  async function enviarSinal(targetId: number, signal: any) {
    const token = getToken();
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/webrtc/signal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target: targetId,
          signal,
        }),
      });
    } catch (err) {
      console.error("Erro enviando sinal:", err);
    }
  }

  // ---------- Aceitar chamada ----------
  async function aceitarChamada() {
    if (!incomingCall) return;
    try {
      const offer = incomingCall.offer;
      const senderId = incomingCall.senderId;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // ontrack -> fluxo remoto
      pc.ontrack = (ev) => {
        setRemoteStream(ev.streams[0]);
      };

      // onicecandidate -> envia candidato ao chamador
      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          enviarSinal(senderId, { type: "candidate", candidate: ev.candidate });
        }
      };

      // ----------------- Set Remote Description -----------------
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
        // após setRemoteDescription
        for (const c of pendingCandidates.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (e) {
            console.warn("Erro adicionando candidate pendente:", e);
          }
        }
        pendingCandidates.current = [];


      // Adiciona track de microfone
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      // Cria answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Envia answer ao chamador
      await enviarSinal(senderId, { type: "answer", answer });

      setModalVisible(false);
      setIncomingCall(null);
    } catch (err) {
      console.error("Erro ao aceitar chamada:", err);
      alert("Erro ao aceitar chamada: " + (err as any).message);
    }
  }

  // ---------- Recusar chamada ----------
  function recusarChamada() {
    if (!incomingCall) return;
    enviarSinal(incomingCall.senderId, { type: "rejected" });
    setModalVisible(false);
    setIncomingCall(null);
  }

  // ---------- JSX ----------
  return (
    <DashboardLayout
      sidebar={
        <div className="flex flex-col gap-3 p-4 bg-white shadow rounded-xl relative">
          <button
            onClick={() => setActiveSection("home")}
            onMouseEnter={(e) => handleTooltip("Página inicial do seu dashboard", true, e.currentTarget.offsetTop)}
            onMouseLeave={() => handleTooltip("", false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left font-medium transition ${
              activeSection === "home" ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <Home size={18} /> Início
          </button>

          <button
            onClick={() => setActiveSection("pets")}
            onMouseEnter={(e) =>
              handleTooltip("Gerencie seus pets: cadastrar, editar e excluir", true, e.currentTarget.offsetTop)
            }
            onMouseLeave={() => handleTooltip("", false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left font-medium transition ${
              activeSection === "pets" ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <Dog size={18} /> Meus Pets
          </button>

          <button
            onClick={() => setActiveSection("emergencias")}
            onMouseEnter={(e) => handleTooltip("Gerenciar emergências dos seus pets", true, e.currentTarget.offsetTop)}
            onMouseLeave={() => handleTooltip("", false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left font-medium transition ${
              activeSection === "emergencias" ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <AlertTriangle size={18} /> Emergências
          </button>

          <button
            onClick={() => setActiveSection("historico")}
            onMouseEnter={(e) => handleTooltip("Acompanhe o histórico de atendimentos e ações veterinárias", true, e.currentTarget.offsetTop)}
            onMouseLeave={() => handleTooltip("", false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left font-medium transition ${
              activeSection === "historico" ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <History size={18} /> Histórico
          </button>
        </div>
      }
    >
      {/* Tooltip animado */}
      <AnimatePresence>
        {tooltip.visible && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            style={{ top: tooltip.y, left: 220 }}
            className="absolute bg-gray-800 text-white text-sm rounded-md px-3 py-2 shadow-lg z-50 max-w-xs"
          >
            {tooltip.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto space-y-6">
        {activeSection === "home" && (
          <>
            <h2 className="text-2xl font-bold text-gray-800">Bem-vindo, {user?.name} 🐾</h2>
            <p className="text-gray-500">
              Use a barra lateral à esquerda para navegar entre seus pets, registrar emergências e acessar o histórico de atendimentos.
            </p>
          </>
        )}

        <AnimatePresence>
          {activeSection === "pets" && (
            <motion.div key="pet-dashboard" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="mt-6 border-t pt-6">
              <PetDashboard currentUser={user} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeSection === "emergencias" && (
            <motion.div key="emergency-dashboard" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="mt-6 border-t pt-6">
              <EmergencyDashboardPage />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeSection === "historico" && (
            <motion.div key="historico-dashboard" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="mt-6 border-t pt-6">
              <HistoricoDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={onLogout} className="mt-6 text-sm text-red-500 underline">
          Sair
        </button>
      </div>

      {/* Modal de chamada recebido */}
      <CallModal
        visible={modalVisible}
        callerName={incomingCall?.senderName || "Clínica"}
        onAccept={aceitarChamada}
        onReject={recusarChamada}
        remoteStream={remoteStream}
      />
    </DashboardLayout>
  );
}
