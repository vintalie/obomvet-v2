import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Menu, X, PawPrint, User } from "lucide-react";
import Navbar from "../components/Navbar";

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex flex-col">
      <Navbar />

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
