import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../utils/auth";
import { PawPrint, Plus, Trash2 } from "lucide-react";

interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  idade?: number;
  peso?: number;
}

export default function PetDashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    idade: "",
    peso: "",
  });

  //  Buscar pets do tutor
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/pets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar pets");
        return res.json();
      })
      .then((data) => {
        // 🔹 Garantir que pets seja sempre um array
        if (Array.isArray(data)) {
          setPets(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setPets(data.data);
        } else {
          setPets([]);
        }
      })
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, [API_URL, navigate]);

  //  Lidar com mudanças no formulário
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  //  Enviar novo pet
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro no backend:", data);
        alert(data.message || "Erro ao cadastrar pet.");
        return;
      }

      //  Garantir que o pet retornado seja um objeto válido
      if (data?.id) {
        setPets((prev) => [...prev, data]);
      }

      setFormVisible(false);
      setFormData({
        nome: "",
        especie: "",
        raca: "",
        idade: "",
        peso: "",
      });
    } catch (error) {
      console.error("Erro ao enviar pet:", error);
      alert("Falha ao conectar com o servidor.");
    }
  }

  //  Excluir pet
  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este pet?")) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/pets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir pet");
      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Erro ao excluir pet.");
    }
  }

  if (loading) return <p className="p-6 text-center">Carregando pets...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PawPrint size={26} /> Meus Pets
          </h1>
          <button
            onClick={() => setFormVisible((v) => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition"
          >
            <Plus size={18} />
            {formVisible ? "Cancelar" : "Novo Pet"}
          </button>
        </div>

        {/* Formulário */}
        {formVisible && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-50 border p-4 rounded-lg mb-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome do Pet
              </label>
              <input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full border rounded-md p-2 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Espécie
                </label>
                <input
                  name="especie"
                  value={formData.especie}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md p-2 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Raça
                </label>
                <input
                  name="raca"
                  value={formData.raca}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md p-2 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Idade (anos)
                </label>
                <input
                  type="number"
                  name="idade"
                  value={formData.idade}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mt-3 transition"
            >
              Salvar Pet
            </button>
          </form>
        )}

        {/* Lista de pets */}
        <div className="space-y-3">
          {Array.isArray(pets) && pets.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhum pet cadastrado ainda.</p>
          ) : (
            pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-gray-100 border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{pet.nome}</h3>
                  <p className="text-sm text-gray-600">
                    {pet.especie} • {pet.raca}{" "}
                    {pet.idade && `• ${pet.idade} anos`}{" "}
                    {pet.peso && `• ${pet.peso} kg`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(pet.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Excluir"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
