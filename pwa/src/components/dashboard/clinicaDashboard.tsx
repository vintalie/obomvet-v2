import { Link } from "react-router-dom";
import { Home, Activity } from "lucide-react";
import DashboardLayout from "./layout/DashboardLayout";

export default function ClinicaDashboard({ user, onLogout }: any) {
  const sidebar = (
    <>
      <Link to="#" className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2">
        <Home size={18} /> Início
      </Link>

      <Link to="/emergencias" className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2">
        <Activity size={18} /> Emergências Ativas
      </Link>
    </>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo, {user.name} 🏥</h2>
        <p className="text-gray-500 mb-6">
          Aqui você poderá acompanhar as emergências e informações da clínica.
        </p>

        <button onClick={onLogout} className="text-sm text-red-500 underline">
          Sair
        </button>
      </div>
    </DashboardLayout>
  );
}
