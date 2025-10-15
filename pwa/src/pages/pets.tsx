import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/dashboardLayout";
import PetCard from "../components/dashboard/petDashboard";
import { getToken, getUser } from "../utils/auth";

interface Pet {
  id: number;
  nome: string;
  especie: string;
  idade: number;
  raca?: string;
}

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getUser();
  const token = getToken();
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/usuarios/tutor/pets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar pets");
        const data = await res.json();
        setPets(data.pets);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, token, API_URL]);

  if (loading) return <p className="p-6 text-center">Carregando pets...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <DashboardLayout tipo="tutor">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-xl font-semibold mb-4">Meus Pets</h1>

        {pets.length === 0 ? (
          <p>Nenhum pet cadastrado.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
