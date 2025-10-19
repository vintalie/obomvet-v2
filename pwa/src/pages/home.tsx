import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import InstallPwaCard from "../components/InstallPwaCard";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E64] to-[#25A18E] flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center pt-32 pb-16 px-8 gap-12">
        {/* Card principal */}
        <motion.div
          className="flex justify-center items-start mt-10 px-4 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="relative bg-white rounded-2xl border border-[#25A18E] p-10 max-w-3xl w-full
                       shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                       before:absolute before:-z-10 before:inset-0 before:translate-x-2 before:translate-y-2
                       before:rounded-2xl before:bg-[#25A18E] before:opacity-40 before:blur-sm
                       hover:before:translate-x-3 hover:before:translate-y-3 transition-all duration-300"
          >
            <motion.h1
              className="text-5xl font-extrabold mb-4 text-[#004E64] leading-tight drop-shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Plataforma de Emergências Veterinárias
            </motion.h1>

            <motion.p
              className="mb-4 text-2xl text-[#004E64] font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Conectando tutores e clínicas com rapidez e segurança.
            </motion.p>

            <motion.p
              className="mb-8 text-slate-700 text-lg max-w-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              O <strong>oBomVet</strong> ajuda a reduzir o tempo de resposta em situações de
              emergência animal, conectando automaticamente tutores a clínicas
              veterinárias próximas via geolocalização.
            </motion.p>

            {/* Botões padrão */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              {[
                {
                  label: "Entrar",
                  to: "/login",
                  bg: "bg-[#25A18E]",
                  hover: "hover:bg-[#208B7C]",
                },
                {
                  label: "Cadastrar-se",
                  to: "/register",
                  bg: "bg-[#004E64]",
                  hover: "hover:bg-[#003b50]",
                },
              ].map((btn, idx) => (
                <motion.div
                  key={btn.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={btn.to}
                    className={`px-8 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition ${btn.bg} ${btn.hover}`}
                  >
                    {btn.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Ilustração */}
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <img
            src="/icons/vet-hero.svg"
            alt="Veterinário atendendo pet"
            className="w-96 h-96 object-contain hidden md:block drop-shadow-xl"
          />
        </motion.div>
      </main>

      {/* Botão de EMERGÊNCIA flutuante — versão desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="
          hidden sm:flex
          fixed z-50 bottom-8 right-8
        "
      >
        <Link to="/reportInput">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 rgba(239,68,68,0.5)",
                "0 0 30px rgba(239,68,68,0.8)",
                "0 0 0 rgba(239,68,68,0.5)"
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="
              flex items-center justify-center gap-3
              px-8 py-5 rounded-full text-white font-bold text-lg
              bg-gradient-to-r from-red-600 to-red-500
              shadow-[0_0_25px_rgba(239,68,68,0.8)]
              hover:shadow-[0_0_35px_rgba(239,68,68,1)]
              transition-all duration-300
            "
          >
            <AlertTriangle className="w-7 h-7" />
            EMERGÊNCIA
          </motion.button>
        </Link>
      </motion.div>

      {/* Botão estilo “fitinha” — versão mobile */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="
          sm:hidden
          fixed top-1/3 right-0 z-50
          rotate-[-90deg] origin-bottom-right
        "
      >
        <Link to="/reportInput">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="
              flex items-center gap-2
              bg-gradient-to-r from-red-600 to-red-500
              text-white font-bold px-4 py-2 rounded-t-lg
              shadow-[0_0_15px_rgba(239,68,68,0.7)]
              hover:shadow-[0_0_25px_rgba(239,68,68,1)]
              transition-all duration-300
            "
          >
            <AlertTriangle className="w-5 h-5" />
            <span>EMERGÊNCIA</span>
          </motion.div>
        </Link>
      </motion.div>

      {/* Card de instalação PWA */}
      <InstallPwaCard />

      <footer className="w-full text-center py-4 text-xs text-gray-100 bg-[#004E64] shadow-inner">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}