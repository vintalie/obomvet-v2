import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle, Activity } from "lucide-react";
import DashboardLayout from "./layout/DashboardLayout";
import { getToken } from "../../utils/auth";

export default function VeterinarioDashboard({ user, onLogout }: any) {
  const [emergencias, setEmergencias] = useState<any[]>([]);
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    const token = getToken();
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/veterinarios/${user.veterinario_id}/emergencias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmergencias(data);
      } catch {
        setEmergencias([]);
      }
    })();
  }, [API_URL]);

  const sidebar = (
    <>
      <Link to="#" className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2">
        <Home size={18} /> Início
      </Link>

      <Link to="/emergencias" className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2">
        <AlertTriangle size={18} /> Emergências Recebidas
      </Link>

      <Link to="/emergencias-ativas" className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2">
        <Activity size={18} /> Em andamento
      </Link>
    </>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Emergências Recentes 🚑</h2>

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
                    <h3 className="font-semibold text-gray-800">Emergência #{emg.id}</h3>
                    <p className="text-sm text-gray-500">{emg.descricao || "Sem descrição"}</p>
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

        <button onClick={onLogout} className="mt-6 text-sm text-red-500 underline">
          Sair
        </button>
      </div>
    </DashboardLayout>
  );
}
