import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, PawPrint, Bell, MapPin, Shield, Clock } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex flex-col">
              <Navbar />
        
      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col items-center justify-start pt-32 pb-16 px-6">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-6 text-center">
          Funcionalidades Principais
        </h1>
        <p className="text-lg text-blue-900 font-medium mb-12 text-center max-w-3xl">
          Descubra como o <strong>oBomVet</strong> conecta tutores e clínicas
          veterinárias em situações de emergência, garantindo rapidez,
          segurança e eficiência no atendimento.
        </p>

        {/* Grade de funcionalidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* Item 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition">
            <PawPrint className="w-14 h-14 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-blue-700">Gestão de Pets</h2>
            <p className="text-gray-700">
              Cadastre e gerencie múltiplos pets com informações completas como
              espécie, raça, idade e histórico médico.
            </p>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition">
            <Bell className="w-14 h-14 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-blue-700">Alertas de Emergência</h2>
            <p className="text-gray-700">
              Crie alertas rápidos em situações de emergência e notifique
              clínicas próximas instantaneamente.
            </p>
          </div>

          {/* Item 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition">
            <MapPin className="w-14 h-14 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-blue-700">Geolocalização</h2>
            <p className="text-gray-700">
              O sistema localiza automaticamente clínicas veterinárias num raio
              próximo ao local da emergência.
            </p>
          </div>

          {/* Item 4 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition">
            <CheckCircle className="w-14 h-14 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-blue-700">
              Confirmação Instantânea
            </h2>
            <p className="text-gray-700">
              Clínicas recebem as notificações e podem aceitar o atendimento com
              apenas um clique.
            </p>
          </div>

          {/* Item 5 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition">
            <Shield className="w-14 h-14 text-purple-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-blue-700">Segurança e Privacidade</h2>
            <p className="text-gray-700">
              Dados do tutor e localização só são compartilhados após aceitação
              da clínica, garantindo proteção total.
            </p>
          </div>

          {/* Item 6 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition">
            <Clock className="w-14 h-14 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-blue-700">
              Histórico de Atendimentos
            </h2>
            <p className="text-gray-700">
              Registre e acompanhe todos os atendimentos realizados, mantendo o
              histórico completo do seu pet.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-gray-500 bg-white shadow-inner">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
