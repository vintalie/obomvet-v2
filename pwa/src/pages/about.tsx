import { Link } from "react-router-dom";
import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E64] to-[#25A18E] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center pt-28 pb-16 px-6 gap-12">
        {/* Título animado */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg"
        >
          Sobre Nós
        </motion.h1>

        {/* Card de texto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-10 flex flex-col gap-6 text-center"
        >
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            O <strong>oBomVet</strong> é um projeto desenvolvido por estudantes da ETEC de Praia Grande como parte do trabalho de conclusão de curso (TCC). Nosso objetivo é criar uma plataforma que conecte tutores e clínicas veterinárias de forma rápida e eficiente em situações de emergência animal.
          </p>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            A equipe é formada por estudantes apaixonados por tecnologia e pela saúde animal, buscando sempre soluções inovadoras para reduzir o tempo de resposta em emergências e garantir que cada animal receba o cuidado necessário no momento certo.
          </p>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            Com o <strong>oBomVet</strong>, tutores podem registrar emergências rapidamente e acessar clínicas próximas, tornando o processo de atendimento mais ágil e confiável.
          </p>
        </motion.div>

        {/* Ilustração animada */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8"
        >
          <img
            src="/icons/about-us.svg"
            alt="Equipe de estudantes e veterinários"
            className="w-80 md:w-96 h-80 md:h-96 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </main>

      {/* Rodapé */}
      <footer className="w-full text-center py-4 text-xs text-white/90 bg-[#004E64] shadow-inner">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
