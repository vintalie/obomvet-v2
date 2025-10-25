import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Plus, Trash2 } from "lucide-react";

interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  idade?: number;
  peso?: number;
  tutor_id: number;
  alergias?: string | null;
  medicamentos_continuos?: string | null;
  cuidados_especiais?: string | null;
}

interface User {
  id: number;
  tipo: "tutor" | "veterinario";
}

interface Props {
  currentUser: User;
}

export default function PetDashboard({ currentUser }: Props) {
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
    alergias: "",
    alergiasSim: false,
    medicamentos_continuos: "",
    medicamentosSim: false,
    cuidados_especiais: "",
    cuidadosSim: false,
  });

  // ---------- BUSCAR PETS ----------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!currentUser && !currentUser.tutor_id) return;
    setLoading(true);
    fetch(`${API_URL}/api/tutores/${currentUser.tutor_id}/pets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar pets");
        const data = await res.json();
        const allPets = Array.isArray(data) ? data : data?.data || [];
        setPets(allPets.filter((pet: Pet) => true));
      })
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, [API_URL, currentUser.id]);

  // ---------- HANDLE CHANGE ----------
  function handleChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  const { name, value, type } = e.target;

  if (type === "checkbox") {
    const target = e.target as HTMLInputElement; // cast para ter checked
    setFormData((prev) => ({
      ...prev,
      [name]: target.checked,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
}


  // ---------- HANDLE SUBMIT ----------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Campos obrigatórios
    const nome = formData.nome.trim();
    const especie = formData.especie.trim();
    const raca = formData.raca.trim();

    if (!nome || !especie || !raca) {
      alert("Preencha todos os campos obrigatórios: Nome, Espécie e Raça");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const nullableField = (condition: boolean, value?: string) =>
      condition && value?.trim() ? value.trim() : null;

    // Converter idade para data_nascimento aproximada
    let data_nascimento: string | null = null;
    const idadeNum = Number(formData.idade);
    if (!isNaN(idadeNum) && idadeNum > 0 && idadeNum < 150) {
      const anoNascimento = new Date().getFullYear() - idadeNum;
      data_nascimento = `${anoNascimento}-01-01`;
    }

    const payload = {
  nome: nome || undefined, // nunca vazio
  especie: especie || undefined,
  raca: raca || undefined,
  data_nascimento,
  peso: formData.peso ? Number(formData.peso) : null,
  alergias: formData.alergiasSim && formData.alergias ? formData.alergias : null,
  medicamentos_continuos: formData.medicamentosSim && formData.medicamentos_continuos ? formData.medicamentos_continuos : null,
  cuidados_especiais: formData.cuidadosSim && formData.cuidados_especiais ? formData.cuidados_especiais : null,
  tutor_id: currentUser.id,
};


    try {
      const res = await fetch(`${API_URL}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Erro no backend:", data);
        alert(data.message || "Erro ao cadastrar pet.");
        return;
      }

      setPets((prev) => [...prev, data]);
      setFormVisible(false);

      // Reset form
      setFormData({
        nome: "",
        especie: "",
        raca: "",
        idade: "",
        peso: "",
        alergias: "",
        alergiasSim: false,
        medicamentos_continuos: "",
        medicamentosSim: false,
        cuidados_especiais: "",
        cuidadosSim: false,
      });
    } catch (error) {
      console.error("Erro ao enviar pet:", error);
      alert("Falha ao conectar com o servidor.");
    }
  }

  // ---------- HANDLE DELETE ----------
  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este pet?")) return;
    const token = localStorage.getItem("token");
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

  // ---------- RENDER ----------
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

        {formVisible && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-50 border p-4 rounded-lg mb-6"
          >
            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome do pet"
              required
              className="w-full border rounded-md p-2"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                placeholder="Espécie"
                required
                className="border rounded-md p-2"
              />
              <input
                name="raca"
                value={formData.raca}
                onChange={handleChange}
                placeholder="Raça"
                required
                className="border rounded-md p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="idade"
                value={formData.idade}
                onChange={handleChange}
                placeholder="Idade (anos)"
                className="border rounded-md p-2"
              />
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                placeholder="Peso (kg)"
                className="border rounded-md p-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label>
                <input
                  type="checkbox"
                  name="alergiasSim"
                  checked={formData.alergiasSim}
                  onChange={handleChange}
                />{" "}
                Possui alergias?
              </label>
              {formData.alergiasSim && (
                <textarea
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleChange}
                  placeholder="Descreva as alergias"
                  className="border rounded-md p-2"
                />
              )}

              <label>
                <input
                  type="checkbox"
                  name="medicamentosSim"
                  checked={formData.medicamentosSim}
                  onChange={handleChange}
                />{" "}
                Usa medicamentos contínuos?
              </label>
              {formData.medicamentosSim && (
                <textarea
                  name="medicamentos_continuos"
                  value={formData.medicamentos_continuos}
                  onChange={handleChange}
                  placeholder="Descreva os medicamentos"
                  className="border rounded-md p-2"
                />
              )}

              <label>
                <input
                  type="checkbox"
                  name="cuidadosSim"
                  checked={formData.cuidadosSim}
                  onChange={handleChange}
                />{" "}
                Possui cuidados especiais?
              </label>
              {formData.cuidadosSim && (
                <textarea
                  name="cuidados_especiais"
                  value={formData.cuidados_especiais}
                  onChange={handleChange}
                  placeholder="Descreva os cuidados"
                  className="border rounded-md p-2"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mt-3 transition"
            >
              Salvar Pet
            </button>
          </form>
        )}

        <div className="space-y-3">
          {pets.length === 0 ? (
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
