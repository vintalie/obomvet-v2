import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Home, Dog, AlertTriangle, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PetDashboard from "./petDashboard";
import DashboardLayout from "./layout/DashboardLayout";
import HistoricoDashboard from "./historicoDashboard";
import EmergencyDashboardPage from "./emergenciaDashboard";

export default function TutorDashboard({ user, onLogout }: any) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"home" | "pets" | "emergencias" | "historico">("home");
  const [tooltip, setTooltip] = useState<{ text: string; visible: boolean; y: number }>({
    text: "",
    visible: false,
    y: 0,
  });

  const handleTooltip = (text: string, visible: boolean, y = 0) => {
    setTooltip({ text, visible, y });
  };

  const sidebar = (
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
  );

  return (
    <DashboardLayout sidebar={sidebar}>
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

        {/* Pets */}
        <AnimatePresence>
          {activeSection === "pets" && (
            <motion.div
              key="pet-dashboard"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 border-t pt-6"
            >
              <PetDashboard currentUser={user} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergências */}
        <AnimatePresence>
          {activeSection === "emergencias" && (
            <motion.div
              key="emergency-dashboard"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 border-t pt-6"
            >
              <EmergencyDashboardPage />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Histórico */}
        <AnimatePresence>
          {activeSection === "historico" && (
            <motion.div
              key="historico-dashboard"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 border-t pt-6"
            >
              <HistoricoDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={onLogout} className="mt-6 text-sm text-red-500 underline">
          Sair
        </button>
      </div>
    </DashboardLayout>
  );
}
