import { Link } from "react-router-dom";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-md py-4 px-8 flex items-center justify-between fixed top-0 left-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-700">oBomVet</span>
        </div>
        <div className="flex gap-6">
          <Link to="/" className="text-blue-700 font-semibold hover:underline">Home</Link>
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">Entrar</Link>
          <Link to="/register" className="text-green-700 font-semibold hover:underline">Cadastrar-se</Link>
          <Link to="/criar-emergencia" className="text-red-700 font-semibold hover:underline">Emergência</Link>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-12">
        <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-3xl flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 text-left">
            <h1 className="text-4xl font-extrabold mb-4 text-blue-700">Bem-vindo ao oBomVet</h1>
            <p className="mb-4 text-xl text-blue-900 font-semibold">Plataforma para emergências veterinárias</p>
            <p className="mb-8 text-gray-700 text-lg">Conectando tutores e veterinários para atendimento rápido em situações de emergência. Faça login ou cadastre-se para acessar os serviços!</p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold">Entrar</Link>
              <Link to="/register" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition font-semibold">Cadastrar-se</Link>
              <Link to="/criar-emergencia" className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition font-semibold">Descrever emergência</Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* Imagem ilustrativa ou ícone grande */}
            <img src="/icons/vet-hero.svg" alt="Veterinário" className="w-64 h-64 object-contain hidden md:block" />
          </div>
        </div>
      </main>
      <footer className="w-full text-center py-4 text-xs text-gray-500 bg-white shadow-inner">&copy; {new Date().getFullYear()} oBomVet</footer>
    </div>
  );
}
