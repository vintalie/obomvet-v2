import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
  <h1 className="text-3xl font-bold mb-4 text-blue-700">Bem-vindo ao oBomVet</h1>
  <p className="mb-2 text-lg text-blue-900 font-semibold">Plataforma para emergências veterinárias</p>
  <p className="mb-6 text-gray-700">Conectando tutores e veterinários para atendimento rápido em situações de emergência. Faça login ou cadastre-se para acessar os serviços!</p>
        <div className="flex flex-col gap-4">
          <Link to="/login" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Entrar</Link>
          <Link to="/register" className="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">Cadastrar-se</Link>
        </div>
      </div>
      <footer className="mt-8 text-xs text-gray-500">&copy; {new Date().getFullYear()} oBomVet</footer>
    </div>
  );
}
