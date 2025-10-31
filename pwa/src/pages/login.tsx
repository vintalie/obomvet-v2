import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
// Importações do Google
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";

// Consistência com o ficheiro de Registo
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "SEU_GOOGLE_CLIENT_ID_AQUI";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Estado de Sucesso
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para solicitar permissão de notificação
  async function solicitarPermissao() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Usuário autorizou notificações.");
      }
    } else {
      console.warn("Este navegador não suporta notificações.");
    }
  }

  // Função centralizada para lidar com o sucesso do login
  function handleAuthSuccess(data: any) {
    localStorage.setItem("authToken", data.access_token);
    localStorage.setItem("user", JSON.stringify(data));
    solicitarPermissao();
    setSuccess("Login efetuado! A redirecionar...");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  }

  // Handle para login normal (email/senha)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || "Erro no login");
      }
      handleAuthSuccess(data); // Usa a função centralizada
    } catch (err: any) {
      setError(err.message);
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
        // O backend (Laravel Socialite) espera o 'credential'
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Erro no login com Google"
        );
      }
      handleAuthSuccess(data); // Usa a função centralizada
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle para falha do login com Google
  function handleGoogleError() {
    setError("Falha ao autenticar com o Google.");
  }

  return (
    // O GoogleOAuthProvider deve envolver o seu componente
    // Idealmente, isto fica no seu 'main.tsx' ou 'App.tsx' para não o carregar múltiplas vezes
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <motion.div
        className="flex min-h-screen bg-gradient-to-br from-[#004E64] to-[#25A18E] items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="p-6 sm:p-8 w-full max-w-md bg-white shadow-xl rounded-2xl"
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
            Entrar no oBomVet
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

          {/* Botão Google */}
          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              width="100%"
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>

          {/* Divisor "OU" */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Formulário de Email/Senha */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E] transition"
                required
                disabled={loading || !!success}
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A18E] transition"
                required
                disabled={loading || !!success}
              />
            </motion.div>

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
              {loading ? "Entrando..." : success ? "Sucesso!" : "Entrar"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-700">
            Não tem conta?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#25A18E] hover:text-[#208B7C] underline"
            >
              Cadastre-se
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </GoogleOAuthProvider>
  );
}

