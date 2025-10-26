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
    cnpj: "",
    nome_fantasia: "",
    razao_social: "",
    endereco: "",
    telefone_emergencia: "",
    horario_funcionamento: "08:00-18:00",
    disponivel_24h: false,
    publica: false,
    localizacao: "",
    email_contato: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  // Função para pegar coordenadas a partir do endereço
  async function getCoordinates(endereco: string): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        endereco
      )}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return `${lat},${lon}`;
      } else {
        return null;
      }
    } catch (err) {
      console.error("Erro ao obter coordenadas:", err);
      return null;
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value =
      target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setFormData((prev: any) => ({ ...prev, [target.name]: value }));
  }

  function isValidCPF(cpf: string) {
    return cpf.length === 11 && /^\d+$/.test(cpf);
  }

  function isValidCNPJ(cnpj: string) {
    return cnpj.length === 14 && /^\d+$/.test(cnpj);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validações simples
    if (tipo === "tutor" && !isValidCPF(formData.cpf)) {
      setError("CPF inválido. Deve conter 11 números.");
      setLoading(false);
      return;
    }
    if (tipo === "clinica" && !isValidCNPJ(formData.cnpj)) {
      setError("CNPJ inválido. Deve conter 14 números.");
      setLoading(false);
      return;
    }

    try {
      let payload: any = {};

      if (tipo === "tutor") {
        payload = {
          name: formData.nome_completo,
          email: formData.email,
          password: formData.password,
          tipo: "tutor",
          nome_completo: formData.nome_completo,
          telefone_principal: formData.telefone_principal,
          telefone_alternativo: formData.telefone_alternativo,
          cpf: formData.cpf,
        };
      } else {
        // Gera coordenadas automaticamente se o usuário não digitou
        let localizacao = formData.localizacao;
        if (!localizacao && formData.endereco) {
          const coords = await getCoordinates(formData.endereco);
          if (coords) localizacao = coords;
          else alert(
            "Não foi possível obter coordenadas a partir do endereço. Verifique o endereço."
          );
        }

        payload = {
          name: formData.nome_completo || formData.name,
          email: formData.email,
          password: formData.password,
          tipo: "clinica",
          cnpj: formData.cnpj,
          nome_fantasia: formData.nome_fantasia || formData.nome_completo,
          razao_social: formData.razao_social || formData.nome_completo,
          endereco: formData.endereco || "Endereço padrão",
          telefone_principal: formData.telefone_principal || formData.telefone_emergencia,
          telefone_emergencia: formData.telefone_emergencia,
          horario_funcionamento: formData.horario_funcionamento,
          disponivel_24h: formData.disponivel_24h,
          publica: formData.publica,
          localizacao,
          email_contato: formData.email_contato || formData.email,
        };
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            <label className="block mb-1 font-medium text-[#004E64]">Tipo de usuário</label>
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
          <input
            type="text"
            name="nome_completo"
            placeholder={tipo === "tutor" ? "Nome completo" : "Nome da clínica"}
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

          {/* Campos específicos */}
          {tipo === "tutor" && (
            <>
              <input
                type="text"
                name="cpf"
                placeholder="CPF (11 números)"
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
                name="cnpj"
                placeholder="CNPJ (14 números)"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                required
              />
              <input
                type="text"
                name="razao_social"
                placeholder="Razão social"
                value={formData.razao_social}
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
                name="telefone_emergencia"
                placeholder="Telefone emergência"
                value={formData.telefone_emergencia}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                required
              />
              <input
                type="text"
                name="endereco"
                placeholder="Endereço completo"
                value={formData.endereco}
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
                            <label className="flex items-center gap-2 text-[#004E64]">
                <input
                  type="checkbox"
                  name="publica"
                  checked={formData.publica}
                  onChange={handleChange}
                />
                Permitir que qualquer pessoa visualize a clinica no mapa
              </label>
            </>
          )}

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