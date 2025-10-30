import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import InstallPwaCard from "../components/InstallPwaCard";
import { AlertTriangle, MapPin } from "lucide-react";
import { useState } from "react";
import homeImg from "../assets/img-home.jpg?w=800&format=webp&as=src";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false); // você pode sincronizar com Navbar se quiser

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300
        ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-[#004E64] to-[#25A18E] text-[#004E64]"}`}
    >
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
            className={`relative rounded-2xl border p-10 max-w-3xl w-full
              shadow-[0_10px_40px_rgba(0,0,0,0.08)]
              before:absolute before:-z-10 before:inset-0 before:translate-x-2 before:translate-y-2
              before:rounded-2xl before:opacity-40 before:blur-sm
              hover:before:translate-x-3 hover:before:translate-y-3 transition-all duration-300
              ${darkMode
                ? "bg-gray-800 border-gray-700 before:bg-gray-700"
                : "bg-white border-[#25A18E] before:bg-[#25A18E]"
              }`}
          >
            <motion.h1
              className={`text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm ${darkMode ? "text-white" : "text-[#004E64]"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Plataforma de Emergências Veterinárias
            </motion.h1>

            <motion.p
              className={`mb-4 text-2xl font-semibold ${darkMode ? "text-gray-200" : "text-[#004E64]"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Conectando tutores e clínicas com rapidez e segurança.
            </motion.p>

            <motion.p
              className={`mb-8 text-lg max-w-xl ${darkMode ? "text-gray-300" : "text-slate-700"}`}
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
                  bg: darkMode ? "bg-teal-600" : "bg-[#25A18E]",
                  hover: darkMode ? "hover:bg-teal-500" : "hover:bg-[#208B7C]",
                },
                {
                  label: "Cadastrar-se",
                  to: "/register",
                  bg: darkMode ? "bg-gray-700" : "bg-[#004E64]",
                  hover: darkMode ? "hover:bg-gray-600" : "hover:bg-[#003b50]",
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
            src={homeImg} // Aqui usamos a importação TSX
            alt="Veterinário atendendo pet"
            loading="lazy"
            className="w-96 h-96 object-contain hidden md:block drop-shadow-xl"
          />
        </motion.div>
      </main>

      {/* Botão de EMERGÊNCIA flutuante — versão desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="hidden sm:flex fixed z-50 bottom-8 right-8"
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
                "0 0 0 rgba(239,68,68,0.5)",
                "0 0 0 rgba(239,68,68,0.5)",
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
        className="sm:hidden fixed top-1/3 right-0 z-50 rotate-[-90deg] origin-bottom-right"
        
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

      {/* FAB para abrir o mapa de clínicas — versão mobile */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3 }}
        className="sm:hidden fixed top-1/2 right-0 z-60 rotate-[-90deg] origin-bottom-right"
      >
        <Link to="/clinicPage">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="
              flex items-center gap-2
              bg-gradient-to-r from-blue-600 to-teal-500
              text-white font-bold px-4 py-2 rounded-t-lg
              shadow-[0_0_15px_rgba(0,128,255,0.7)]
              hover:shadow-[0_0_25px_rgba(0,128,255,1)]
              transition-all duration-300
            "
          >
            <MapPin className="w-5 h-5" />
            <span>Clínicas Próximas</span>
          </motion.div>
        </Link>
      </motion.div>

      {/* Botão Clínicas Desktop */}
      <motion.div className="hidden sm:flex fixed z-60 bottom-32 right-8">
        <Link to="/clinicPage">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-4 rounded-full text-white font-bold text-lg
                 bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg hover:shadow-xl
                 transition-all duration-300"
          >
            <MapPin className="w-6 h-6" />
            Clínicas Próximas
          </motion.button>
        </Link>
      </motion.div>

      {/* Card de instalação PWA */}
      <InstallPwaCard />

      <footer
        className={`w-full text-center py-4 text-xs shadow-inner transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-[#004E64] text-gray-100"}`}
      >
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
