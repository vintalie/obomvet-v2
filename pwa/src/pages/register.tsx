import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type UserType = "tutor" | "veterinario";

export default function Register() {
  const [tipo, setTipo] = useState<UserType>("tutor");
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    nome_completo: "",
    telefone_principal: "",
    telefone_alternativo: "",
    cpf: "",
    crmv: "",
    localizacao: "",
    especialidade: "",
    telefone_emergencia: "",
    disponivel_24h: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  console.log("API URL:", API_URL);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, type } = target;

    let value: any;
    if (type === "checkbox") {
      value = (target as HTMLInputElement).checked;
    } else {
      value = target.value;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // se usar cookies no backend
        body: JSON.stringify({ tipo, ...formData }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // Captura o primeiro erro de validação ou a mensagem geral
        let firstError = data.message || "Erro no cadastro";
        if (data.errors) {
          const fieldErrors = Object.values(data.errors).flat();
          if (fieldErrors.length > 0) firstError = fieldErrors[0];
        }
        throw new Error(firstError);
      }

      alert("Cadastro realizado com sucesso!");
      navigate("/");
    } catch (err: any) {
      console.error("Erro no registro:", err);
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Cadastro</h1>
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Tipo de usuário</label>
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as UserType)}
            className="w-full p-2 border rounded"
          >
            <option value="tutor">Tutor</option>
            <option value="veterinario">Veterinário</option>
          </select>
        </div>

        {/* Campos comuns */}
        <input type="text" name="name" placeholder="Nome curto" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="nome_completo" placeholder="Nome completo" value={formData.nome_completo} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />

        {/* Campos específicos */}
        {tipo === "tutor" && (
          <>
            <input type="text" name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="telefone_principal" placeholder="Telefone principal" value={formData.telefone_principal} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="telefone_alternativo" placeholder="Telefone alternativo" value={formData.telefone_alternativo} onChange={handleChange} className="w-full p-2 border rounded" />
          </>
        )}

        {tipo === "veterinario" && (
          <>
            <input type="text" name="crmv" placeholder="CRMV" value={formData.crmv} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="localizacao" placeholder="Localização" value={formData.localizacao} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="especialidade" placeholder="Especialidade" value={formData.especialidade} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="telefone_emergencia" placeholder="Telefone emergência" value={formData.telefone_emergencia} onChange={handleChange} className="w-full p-2 border rounded" required />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="disponivel_24h" checked={formData.disponivel_24h} onChange={handleChange} />
              Disponível 24h
            </label>
          </>
        )}

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
