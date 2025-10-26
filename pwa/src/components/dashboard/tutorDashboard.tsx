import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Home, Dog, AlertTriangle, History } from "lucide-react";
import PetDashboard from "./petDashboard";
import DashboardLayout from "./layout/DashboardLayout";

export default function TutorDashboard({ user, onLogout }: any) {
  const navigate = useNavigate();
  const [showPets, setShowPets] = useState(false);

  const sidebar = (
    <>
      <Link to="#" className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2">
        <Home size={18} /> Início
      </Link>

      <button
        onClick={() => setShowPets((v) => !v)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2 w-full text-left"
      >
        <Dog size={18} /> Meus Pets
      </button>

      <Link to="/novaEmergencia" className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2">
        <AlertTriangle size={18} /> Registrar Emergência
      </Link>

      <Link to="/historicoEmergencias" className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2">
        <History size={18} /> Histórico
      </Link>
    </>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo, {user?.name} 🐾</h2>
        <p className="text-gray-500">O que você deseja fazer hoje?</p>

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

        {showPets && (
          <div className="mt-8 border-t pt-6">
            <PetDashboard currentUser={user} />
          </div>
        )}

        <button onClick={onLogout} className="mt-6 text-sm text-red-500 underline">
          Sair
        </button>
      </div>
    </DashboardLayout>
  );
}
