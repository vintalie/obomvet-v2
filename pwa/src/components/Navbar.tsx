import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, PawPrint, User } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 left-0 z-20 bg-white/70 backdrop-blur-sm shadow-md px-8 py-4 flex items-center justify-between">
      {/* Logo como link */}
      <Link to="/" className="flex items-center gap-2">
        <PawPrint className="text-blue-700 w-7 h-7" />
        <span className="text-2xl font-bold text-blue-700">oBomVet</span>
      </Link>

      {/* Menu Desktop */}
      <div className="hidden md:flex items-center gap-6">
        <Link to="/" className="text-blue-700 font-semibold hover:underline">Home</Link>
        <Link to="/features" className="text-blue-700 font-semibold hover:underline">Funcionalidades</Link>

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
  );
}
