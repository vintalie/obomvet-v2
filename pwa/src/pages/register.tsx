import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion } from "framer-motion";
// Importações do Google
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";

type UserType = "tutor" | "clinica";

// API URL (Corrigido de volta para import.meta.env)
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "SEU_GOOGLE_CLIENT_ID_AQUI";

/**
 * Função de geocoding (movida para fora do componente)
 */
async function getCoordinates(endereco: string): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      endereco
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      // API Nominatim retorna "lat", "lon"
      const { lat, lon } = data[0];
      // Adaptado ao formato "L:lat,G:lon" (assumindo que seu backend espera isso)
      return `L:${lat},G:${lon}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Erro ao obter coordenadas:", err);
    return null;
  }
}

export default function Register() {
  const [tipo, setTipo] = useState<UserType>("tutor");
  const [formData, setFormData] = useState<any>({
    nome_completo: "",
    email: "",
    password: "",
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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const navigate = useNavigate();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    setFormData((prev: any) => ({ ...prev, [target.name]: value }));
  }

  // Função para buscar coordenadas do endereço
  async function handleFindCoords() {
    if (!formData.endereco) {
      setError("Por favor, preencha o endereço primeiro.");
      return;
    }
    setLoadingCoords(true);
    setError(null);
    const coords = await getCoordinates(formData.endereco);
    if (coords) {
      setFormData((prev: any) => ({ ...prev, localizacao: coords }));
    } else {
      setError("Não foi possível encontrar as coordenadas para este endereço.");
    }
    setLoadingCoords(false);
  }

  function isValidCPF(cpf: string) {
    if (!cpf) return false;
    return cpf.length === 11 && /^\d+$/.test(cpf);
  }

  function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  // Função centralizada para lidar com o sucesso (login ou registo)
  function handleAuthSuccess(message: string = "Ação concluída!") {
    setSuccess(`${message} A redirecionar...`);
    setTimeout(() => {
      // Após o registo, enviamos para o Login
      navigate("/login");
    }, 2000); // Espera 2s
  }

  // Handle para registo normal (email/senha)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validações simples
    if (!isValidEmail(formData.email)) {
      setError("Email inválido.");
      setLoading(false);
      return;
    }
    if (tipo === "tutor" && !isValidCPF(formData.cpf)) {
      setError("CPF inválido. Deve conter 11 números.");
      setLoading(false);
      return;
    }

    try {
      let payload: any = {};
      let localizacao = formData.localizacao;

      // para tutor
      if (tipo === "tutor") {
        payload = {
          name: formData.nome_completo,
          nome_completo: formData.nome_completo,
          email: formData.email,
          password: formData.password,
          tipo: "tutor",
          telefone_principal: formData.telefone_principal,
          telefone_alternativo: formData.telefone_alternativo || null,
          cpf: formData.cpf,
        };
      } else {
        // clinica
        // Se a localização não foi preenchida manualmente ou pelo botão, busca agora
        if (!localizacao && formData.endereco) {
          setLoadingCoords(true);
          localizacao = await getCoordinates(formData.endereco);
          setLoadingCoords(false);
        }

        payload = {
          name: formData.nome_fantasia, // 'name' deve ser o nome principal
          nome_completo: formData.nome_fantasia, // Ajustado
          email: formData.email,
          password: formData.password,
          tipo: "clinica",
          cnpj: formData.cnpj || null,
          nome_fantasia: formData.nome_fantasia,
          razao_social: formData.razao_social || formData.nome_fantasia, // Fallback
          endereco: formData.endereco || "",
          telefone_principal: formData.telefone_principal,
          telefone_emergencia: formData.telefone_emergencia,
          horario_funcionamento: formData.horario_funcionamento,
          disponivel_24h: !!formData.disponivel_24h,
          publica: !!formData.publica,
          localizacao: localizacao || null, // Envia null se não encontrado
          email_contato: formData.email_contato || formData.email,
        };
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          throw new Error(firstError);
        } else {
          throw new Error(data.error || data.message || "Erro no cadastro");
        }
      }

      handleAuthSuccess("Cadastro realizado com sucesso!");
    } catch (err: any) {
      console.error("Erro no registro:", err);
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  // Handle para o sucesso do login com Google
  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Envia o token JWT do Google para o seu backend
      const res = await fetch(`${API_URL}/api/auth/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Erro na autenticação com Google"
        );
      }
      
      // No registo, não fazemos login automático, apenas informamos o sucesso
      // O backend deve ter criado o utilizador
      handleAuthSuccess("Conta Google vinculada com sucesso!");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    setError("Falha ao autenticar com o Google.");
  }

  return (
    // O GoogleOAuthProvider deve envolver o seu componente
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <motion.div
        className="flex min-h-screen bg-gradient-to-br from-[#004E64] to-[#25A18E] items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="p-6 sm:p-8 w-full max-w-xl bg-white shadow-xl rounded-2xl"
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

          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-[#004E64]">
            Crie sua conta
          </h1>

          {/* Mensagens de Erro/Sucesso */}
          {error && (
            <motion.p
              className="text-red-600 mb-4 text-center bg-red-50 border border-red-200 rounded-lg p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              className="text-green-700 mb-4 text-center bg-green-50 border border-green-200 rounded-lg p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {success}
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
                disabled={loading || !!success}
              >
                <option value="tutor">Tutor</option>
                <option value="clinica">Clínica</option>
              </select>
            </div>

            {/* Google Login (Apenas para Tutor) */}
            {tipo === "tutor" && (
              <>
                <div className="pt-2">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    // width="100%" // <-- REMOVIDO: Causava aviso. O botão adapta-se ao container.
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="continue_with"
                  />
                </div>
                {/* Divisor "OU" */}
                <div className="flex items-center pt-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">
                    OU CRIE COM EMAIL
                  </span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </>
            )}

            {/* Campos Comuns */}
            <input
              type="email"
              name="email"
              placeholder={
                tipo === "tutor" ? "Seu Email" : "Email principal da clínica"
              }
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
              required
              disabled={loading || !!success}
            />
            <input
              type="password"
              name="password"
              placeholder="Crie uma senha"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
              required
              disabled={loading || !!success}
            />

            {/* Campos de TUTOR */}
            {tipo === "tutor" && (
              <>
                <input
                  type="text"
                  name="nome_completo"
                  placeholder="Nome completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                  disabled={loading || !!success}
                />
                <input
                  type="text"
                  name="cpf"
                  placeholder="CPF (apenas 11 números)"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                  disabled={loading || !!success}
                  maxLength={11}
                />
                <input
                  type="tel"
                  name="telefone_principal"
                  placeholder="Telefone principal"
                  value={formData.telefone_principal}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                  disabled={loading || !!success}
                />
                <input
                  type="tel"
                  name="telefone_alternativo"
                  placeholder="Telefone alternativo (opcional)"
                  value={formData.telefone_alternativo}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  disabled={loading || !!success}
                />
              </>
            )}

            {/* Campos de CLÍNICA */}
            {tipo === "clinica" && (
              <>
                <input
                  type="text"
                  name="nome_fantasia"
                  placeholder="Nome fantasia (Ex: Clínica Vet ABC)"
                  value={formData.nome_fantasia}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                  disabled={loading || !!success}
                />
                <input
                  type="text"
                  name="razao_social"
                  placeholder="Razão social (opcional)"
                  value={formData.razao_social}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  disabled={loading || !!success}
                />
                <input
                  type="text"
                  name="cnpj"
                  placeholder="CNPJ (opcional)"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  disabled={loading || !!success}
                />
                <input
                  type="text"
                  name="endereco"
                  placeholder="Endereço completo (Rua, N°, Bairro, Cidade)"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  disabled={loading || !!success}
                />
                <input
                  type="text"
                  name="localizacao"
                  placeholder="Coordenadas (Ex: L:-23.1,G:-47.2) (opcional)"
                  value={formData.localizacao}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A1f-8]"
                  disabled={loading || !!success}
                />
                <button
                  type="button"
                  onClick={handleFindCoords}
                  disabled={loadingCoords || !formData.endereco}
                  className="w-full p-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
                >
                  <MapPin size={16} />
                  {loadingCoords
                    ? "A buscar..."
                    : "Buscar coordenadas pelo endereço"}
                </button>
                <input
                  type="tel"
                  name="telefone_principal"
                  placeholder="Telefone principal"
                  value={formData.telefone_principal}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  required
                  disabled={loading || !!success}
                />
                <input
                  type="tel"
                  name="telefone_emergencia"
                  placeholder="Telefone emergência (opcional)"
                  value={formData.telefone_emergencia}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E]"
                  disabled={loading || !!success}
                />
                <input
                  type="email"
                  name="email_contato"
                  placeholder="Email de contato (opcional)"
                  value={formData.email_contato}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A1E]"
                  disabled={loading || !!success}
                />
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    name="disponivel_24h"
                    checked={formData.disponivel_24h}
                    onChange={handleChange}
                    className="h-4 w-4 rounded text-[#25A18E] focus:ring-[#25A18E]"
                    disabled={loading || !!success}
                  />
                  Disponível 24h
                </label>
                <label className="flex items-start gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    name="publica"
                    checked={formData.publica}
                    onChange={handleChange}
                    className="h-4 w-4 rounded text-[#25A18E] focus:ring-[#25A18E] mt-1"
                    disabled={loading || !!success}
                  />
                  Permitir que qualquer pessoa visualize a clínica no mapa
                </label>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || !!success}
              className={`w-full p-3 rounded-lg font-semibold text-white transition-all
              ${
                loading
                  ? "bg-gray-400"
                  : success
                  ? "bg-green-600"
                  : "bg-[#25A18E] hover:bg-[#208B7C]"
              }
            `}
            >
              {loading
                ? "A cadastrar..."
                : success
                ? "Sucesso!"
                : "Cadastrar"}
            </motion.button>
          </form>

          {/* Link para Login */}
          <p className="mt-6 text-center text-sm text-gray-700">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#25A18E] hover:text-[#208B7C] underline"
            >
              Faça login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </GoogleOAuthProvider>
  );
}

