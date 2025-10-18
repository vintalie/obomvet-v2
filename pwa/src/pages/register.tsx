import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type UserType = "tutor" | "clinica";

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let value: any =
      target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;

    setFormData((prev: any) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, ...formData }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
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
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="flex min-h-screen bg-gradient-to-br from-[#004E64] to-[#25A18E] items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="p-8 w-full max-w-xl bg-white shadow-xl rounded-2xl"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={22} className="mr-1" />
          <span className="text-sm">Voltar</span>
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-[#004E64]">
          Crie sua conta
        </h1>

        {error && (
          <motion.p
            className="text-red-500 mb-4 text-center bg-red-50 border border-red-200 rounded p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-[#004E64]">
              Tipo de usuário
            </label>
            <select
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as UserType)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E] transition"
            >
              <option value="tutor">Tutor</option>
              <option value="clinica">Clínica</option>
            </select>
          </div>

          {/* Campos comuns */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              type="text"
              name="name"
              placeholder="Nome curto"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E] transition"
              required
            />
            <input
              type="text"
              name="nome_completo"
              placeholder="Nome completo"
              value={formData.nome_completo}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
              required
            />
          </motion.div>

          {/* Campos específicos */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {tipo === "tutor" && (
              <>
                <input
                  type="text"
                  name="cpf"
                  placeholder="CPF"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                />
                <input
                  type="text"
                  name="telefone_principal"
                  placeholder="Telefone principal"
                  value={formData.telefone_principal}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                />
                <input
                  type="text"
                  name="telefone_alternativo"
                  placeholder="Telefone alternativo"
                  value={formData.telefone_alternativo}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                />
              </>
            )}

            {tipo === "clinica" && (
              <>
                <input
                  type="text"
                  name="crmv"
                  placeholder="CRMV"
                  value={formData.crmv}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                />
                <input
                  type="text"
                  name="localizacao"
                  placeholder="Localização"
                  value={formData.localizacao}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                />
                <input
                  type="text"
                  name="especialidade"
                  placeholder="Especialidade"
                  value={formData.especialidade}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                />
                <input
                  type="text"
                  name="telefone_emergencia"
                  placeholder="Telefone emergência"
                  value={formData.telefone_emergencia}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                />
                <label className="flex items-center gap-2 text-[#004E64]">
                  <input
                    type="checkbox"
                    name="disponivel_24h"
                    checked={formData.disponivel_24h}
                    onChange={handleChange}
                  />
                  Disponível 24h
                </label>
              </>
            )}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#25A18E] text-white p-3 rounded-lg font-semibold hover:bg-[#208B7C] transition"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
