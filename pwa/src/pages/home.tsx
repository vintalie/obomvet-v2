import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import InstallPwaCard from "../components/InstallPwaCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center pt-32 pb-16 px-8 gap-12">
        {/* Card principal com texto e botões */}
        <div className="flex justify-center items-start mt-16 px-4 w-full">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-3xl w-full">
            <h1 className="text-5xl font-extrabold mb-4 text-blue-700 leading-tight">
              Plataforma de Emergências Veterinárias
            </h1>
            <p className="mb-4 text-2xl text-blue-900 font-semibold">
              Conectando tutores e clínicas com rapidez e segurança.
            </p>
            <p className="mb-8 text-gray-700 text-lg max-w-xl">
              O <strong>oBomVet</strong> ajuda a reduzir o tempo de resposta em situações de
              emergência animal, conectando automaticamente tutores a clínicas
              veterinárias próximas via geolocalização.
            </p>

            {/* Botões */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                Cadastrar-se
              </Link>
              <Link
                to="/reportInput"
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition font-semibold flex flex-col items-center"
              >
                <span className="text-xl font-bold text-center">EMERGÊNCIA</span>
                <span className="mt-1 text-sm text-center">Clique aqui para registrar uma emergência</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Ilustração */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/icons/vet-hero.svg"
            alt="Veterinário atendendo pet"
            className="w-96 h-96 object-contain hidden md:block drop-shadow-xl"
          />
        </div>
      </main>

      {/* Card de instalação PWA */}
      <InstallPwaCard />

      <footer className="w-full text-center py-4 text-xs text-gray-600 bg-white shadow-inner">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
