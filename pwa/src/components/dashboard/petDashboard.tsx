import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Plus, Trash2, Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // Tooltip styles

interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  data_nascimento?: string | null;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

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

  // ---------- VALIDAÇÃO DO TOKEN ----------
  function isTokenValid(token: string | null) {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  }

  // ---------- FUNÇÃO PARA CALCULAR IDADE ----------
  function calcularIdade(dataNascimento: string) {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  // ---------- BUSCAR PETS ----------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      alert("Sua sessão expirou. Faça login novamente.");
      navigate("/login");
      return;
    }

    async function fetchPets() {
      setLoading(true);
      try {
        const tutorRes = await fetch(`${API_URL}/api/tutores/usuario/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tutorData = await tutorRes.json();
        const tutorId = tutorData.id;

        const petsRes = await fetch(`${API_URL}/api/tutores/${tutorId}/pets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const petsData = await petsRes.json();
        const petsArray = Array.isArray(petsData) ? petsData : petsData.data || [];
        // Preenche a idade a partir da data_nascimento
        petsArray.forEach((p: Pet) => {
          if (p.data_nascimento) p.idade = calcularIdade(p.data_nascimento);
        });
        setPets(petsArray);
      } catch (err) {
        console.error(err);
        setPets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPets();
  }, [API_URL, currentUser, navigate]);

  // ---------- HANDLE CHANGE ----------
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    }
  }

  // ---------- ABRIR MODAL ----------
  function openModal(pet?: Pet) {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        idade: pet.idade?.toString() || "",
        peso: pet.peso?.toString() || "",
        alergias: pet.alergias || "",
        alergiasSim: !!pet.alergias,
        medicamentos_continuos: pet.medicamentos_continuos || "",
        medicamentosSim: !!pet.medicamentos_continuos,
        cuidados_especiais: pet.cuidados_especiais || "",
        cuidadosSim: !!pet.cuidados_especiais,
      });
    } else {
      setEditingPet(null);
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
    }
    setModalOpen(true);
  }

  // ---------- HANDLE SUBMIT ----------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      alert("Sua sessão expirou. Faça login novamente.");
      navigate("/login");
      return;
    }

    const nome = formData.nome.trim();
    const especie = formData.especie.trim();
    const raca = formData.raca.trim();
    if (!nome || !especie || !raca) {
      alert("Preencha os campos obrigatórios: Nome, Espécie e Raça");
      return;
    }

    try {
      const tutorRes = await fetch(`${API_URL}/api/tutores/usuario/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tutorData = await tutorRes.json();
      const tutorId = tutorData.id;

      const payload = {
        nome,
        especie,
        raca,
        data_nascimento: formData.idade ? `${new Date().getFullYear() - Number(formData.idade)}-01-01` : null,
        peso: formData.peso ? Number(formData.peso) : null,
        alergias: formData.alergiasSim ? formData.alergias : null,
        medicamentos_continuos: formData.medicamentosSim ? formData.medicamentos_continuos : null,
        cuidados_especiais: formData.cuidadosSim ? formData.cuidados_especiais : null,
        tutor_id: tutorId,
      };

      let res, data;
      if (editingPet) {
        res = await fetch(`${API_URL}/api/pets/${editingPet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erro ao atualizar pet");
        data.idade = formData.idade ? Number(formData.idade) : undefined;
        setPets((prev) => prev.map((p) => (p.id === editingPet.id ? data : p)));
        setSuccessMessage(`✏️ Pet "${data.nome}" atualizado com sucesso!`);
      } else {
        res = await fetch(`${API_URL}/api/pets`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erro ao cadastrar pet");
        data.idade = formData.idade ? Number(formData.idade) : undefined;
        setPets((prev) => [...prev, data]);
        setSuccessMessage(`🐾 Pet "${data.nome}" cadastrado com sucesso!`);
      }

      setModalOpen(false);
      setEditingPet(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar pet.");
    }
  }

  // ---------- HANDLE DELETE ----------
  async function handleDelete(id: number) {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      alert("Sua sessão expirou. Faça login novamente.");
      navigate("/login");
      return;
    }
    if (!confirm("Deseja realmente excluir este pet?")) return;

    try {
      const res = await fetch(`${API_URL}/api/pets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir pet");
      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erro ao excluir pet.");
    }
  }

  if (loading) return <p className="p-6 text-center">Carregando pets...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <PawPrint size={28} /> Meus Pets
          </h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} /> Novo Pet
          </button>
        </div>

        {/* SUCCESS ALERT */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2"
            >
              <Check size={20} /> {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PETS TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Espécie</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Raça</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Idade</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Peso</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50 transition relative">
                  <Tippy
                    content={
                      <div className="text-sm">
                        {pet.alergias && <p>🩹 Alergias: {pet.alergias}</p>}
                        {pet.medicamentos_continuos && <p>💊 Medicamentos: {pet.medicamentos_continuos}</p>}
                        {pet.cuidados_especiais && <p>⚠️ Cuidados: {pet.cuidados_especiais}</p>}
                      </div>
                    }
                  >
                    <td className="px-6 py-4 cursor-pointer">{pet.nome}</td>
                  </Tippy>
                  <td className="px-6 py-4">{pet.especie}</td>
                  <td className="px-6 py-4">{pet.raca}</td>
                  <td className="px-6 py-4">{pet.idade || "-"}</td>
                  <td className="px-6 py-4">{pet.peso || "-"}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openModal(pet)} className="text-blue-500 hover:text-blue-700">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(pet.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-2xl overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
                {editingPet ? "Editar Pet" : "Cadastrar Novo Pet"} <PawPrint size={28} className="text-blue-600" />
              </h2>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "nome", label: "Nome do Pet", required: true },
                    { name: "especie", label: "Espécie", required: true },
                    { name: "raca", label: "Raça", required: true },
                    { name: "idade", label: "Idade", type: "number", required: false },
                    { name: "peso", label: "Peso (kg)", type: "number", required: false },
                  ].map(({ name, label, type, required }) => (
                    <div className="relative" key={name}>
                      <input
                        name={name}
                        type={type || "text"}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder=" "
                        required={required}
                        className="peer w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 text-gray-800 transition"
                      />
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>

                {[{ key: "alergiasSim", label: "Possui alergias?", inputName: "alergias" },
                  { key: "medicamentosSim", label: "Usa medicamentos contínuos?", inputName: "medicamentos_continuos" },
                  { key: "cuidadosSim", label: "Possui cuidados especiais?", inputName: "cuidados_especiais" }].map(({ key, label, inputName }) => (
                  <div key={key}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name={key} checked={formData[key as keyof typeof formData] as boolean} onChange={handleChange} className="accent-blue-600 w-5 h-5"/>
                      <span className="text-gray-700 font-medium">{label}</span>
                    </label>
                    {formData[key as keyof typeof formData] && (
                      <input
                        name={inputName}
                        value={formData[inputName as keyof typeof formData] as string}
                        onChange={handleChange}
                        placeholder={`Descreva ${label.toLowerCase()}`}
                        className="mt-1 w-full border rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-200 transition"
                      />
                    )}
                  </div>
                ))}

                <div className="flex gap-3 mt-4">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">
                    {editingPet ? "Atualizar Pet" : "Salvar Pet"}
                  </button>
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl shadow transition transform hover:-translate-y-0.5">
                    Cancelar
                  </button>
                </div>

                <button type="button" onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl">
                  ✕
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
