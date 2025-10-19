import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  PawPrint,
  Bell,
  MapPin,
  Shield,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function Features() {
  const features = [
    {
      icon: <PawPrint className="w-14 h-14 text-[#25A18E] mb-4" />,
      title: "Gestão de Pets",
      desc: "Cadastre e gerencie múltiplos pets com informações completas como espécie, raça, idade e histórico médico.",
    },
    {
      icon: <Bell className="w-14 h-14 text-[#E63946] mb-4" />,
      title: "Alertas de Emergência",
      desc: "Crie alertas rápidos em situações de emergência e notifique clínicas próximas instantaneamente.",
    },
    {
      icon: <MapPin className="w-14 h-14 text-[#208B7C] mb-4" />,
      title: "Geolocalização",
      desc: "O sistema localiza automaticamente clínicas veterinárias num raio próximo ao local da emergência.",
    },
    {
      icon: <CheckCircle className="w-14 h-14 text-[#FFD166] mb-4" />,
      title: "Confirmação Instantânea",
      desc: "Clínicas recebem as notificações e podem aceitar o atendimento com apenas um clique.",
    },
    {
      icon: <Shield className="w-14 h-14 text-[#5E60CE] mb-4" />,
      title: "Segurança e Privacidade",
      desc: "Dados do tutor e localização só são compartilhados após aceitação da clínica, garantindo proteção total.",
    },
    {
      icon: <Clock className="w-14 h-14 text-[#004E64] mb-4" />,
      title: "Histórico de Atendimentos",
      desc: "Registre e acompanhe todos os atendimentos realizados, mantendo o histórico completo do seu pet.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F1F2] to-[#C9F0E1] flex flex-col">
      <Navbar />

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col items-center justify-start pt-32 pb-16 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-[#004E64] mb-6 text-center"
        >
          Funcionalidades Principais
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-lg text-[#207178] font-medium mb-12 text-center max-w-3xl"
        >
          Descubra como o <strong className="text-[#25A18E]">oBomVet</strong> conecta tutores e clínicas
          veterinárias em situações de emergência, garantindo rapidez,
          segurança e eficiência no atendimento.
        </motion.p>

        {/* Grade de funcionalidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl w-full">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-transform duration-300"
            >
              {feature.icon}
              <h2 className="text-2xl font-bold mb-2 text-[#004E64]">
                {feature.title}
              </h2>
              <p className="text-[#207178]">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Botão de navegação */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14"
        >
          <Link
            to="/about"
            className="bg-[#25A18E] hover:bg-[#208B7C] text-white font-semibold px-8 py-3 rounded-full shadow-md transition-colors"
          >
            Saiba Mais Sobre o Projeto
          </Link>
        </motion.div>
      </main>

      <footer className="w-full text-center py-4 text-sm text-[#207178] bg-white shadow-inner">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
