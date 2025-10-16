import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, PawPrint, User } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 left-0 z-30 bg-white/90 backdrop-blur-md shadow-lg px-12 py-6 flex items-center justify-between">
      {/* Logo como link */}
      <Link to="/" className="flex items-center gap-3">
        <PawPrint className="text-blue-700 w-9 h-9" />
        <span className="text-3xl font-extrabold text-blue-700">oBomVet</span>
      </Link>

      {/* Menu Desktop */}
      <div className="hidden md:flex items-center gap-10 text-lg">
        <Link to="/" className="text-blue-700 font-semibold hover:underline">Home</Link>
        <Link to="/features" className="text-blue-700 font-semibold hover:underline">Funcionalidades</Link>
        <Link to="/about" className="text-blue-700 font-semibold hover:underline">Sobre Nós</Link>

        {/* Ícone de usuário */}
        <Link
          to="/login"
          className="bg-gray-500 w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition"
        >
          <User size={24} />
        </Link>
      </div>

      {/* Menu Mobile */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-blue-700 focus:outline-none">
        {menuOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-blue-800 bg-opacity-95 flex flex-col items-center py-6 gap-6 md:hidden text-white text-lg">
          <Link to="/" onClick={() => setMenuOpen(false)} className="font-semibold hover:underline">Home</Link>
          <Link to="/features" onClick={() => setMenuOpen(false)} className="font-semibold hover:underline">Funcionalidades</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="font-semibold hover:underline">Sobre Nós</Link>

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-gray-500 w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition"
          >
            <User size={24} />
          </Link>
        </div>
      )}
    </nav>
  );
}
