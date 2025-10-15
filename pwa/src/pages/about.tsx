import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Menu, X, PawPrint, User } from "lucide-react";

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-20 bg-white/70 backdrop-blur-sm shadow-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="text-blue-700 w-7 h-7" />
          <span className="text-2xl font-bold text-blue-700">oBomVet</span>
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-blue-700 font-semibold hover:underline">Home</Link>
          <Link to="/features" className="text-blue-700 font-semibold hover:underline">Funcionalidades</Link>
          <Link to="/about" className="text-blue-700 font-semibold hover:underline">Sobre Nós</Link>

          {/* Ícone de usuário */}
          <Link
            to="/login"
            className="bg-gray-500 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition"
          >
            <User size={20} />
          </Link>
        </div>

        {/* Menu Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-blue-700 focus:outline-none">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-blue-800 bg-opacity-90 flex flex-col items-center py-4 gap-4 md:hidden text-white">
            <Link to="/" onClick={() => setMenuOpen(false)} className="font-semibold hover:underline">Home</Link>
            <Link to="/features" onClick={() => setMenuOpen(false)} className="font-semibold hover:underline">Funcionalidades</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="font-semibold hover:underline">Sobre Nós</Link>

            {/* Ícone de usuário no menu mobile */}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-gray-500 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition"
            >
              <User size={20} />
            </Link>
          </div>
        )}
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-16 px-8 gap-12">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-6 text-center">
          Sobre Nós
        </h1>

        <div className="max-w-4xl text-center flex flex-col gap-6">
          <p className="text-lg text-gray-700">
            O <strong>oBomVet</strong> é um projeto desenvolvido por estudantes da ETEC de Praia Grande como parte do trabalho de conclusão de curso (TCC). Nosso objetivo é criar uma plataforma que conecte tutores e clínicas veterinárias de forma rápida e eficiente em situações de emergência animal.
          </p>

          <p className="text-lg text-gray-700">
            A equipe é formada por estudantes apaixonados por tecnologia e pela saúde animal, buscando sempre soluções inovadoras para reduzir o tempo de resposta em emergências e garantir que cada animal receba o cuidado necessário no momento certo.
          </p>

          <p className="text-lg text-gray-700">
            Com o <strong>oBomVet</strong>, tutores podem registrar emergências rapidamente e acessar clínicas próximas, tornando o processo de atendimento mais ágil e confiável.
          </p>
        </div>

        {/* Ilustração */}
        <div className="mt-8">
          <img
            src="/icons/about-us.svg"
            alt="Equipe de estudantes e veterinários"
            className="w-96 h-96 object-contain drop-shadow-xl"
          />
        </div>
      </main>

      {/* Rodapé */}
      <footer className="w-full text-center py-4 text-xs text-gray-600 bg-white shadow-inner">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
