import { ArrowLeft, PawPrint, UserCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function DashboardTopbar() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 hover:text-gray-600 transition"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Voltar</span>
      </button>

      <Link to="/" className="flex items-center gap-3">
        <PawPrint className="w-9 h-9" />
        <span className="text-3xl font-extrabold">oBomVet</span>
      </Link>

      <UserCircle size={28} className="text-gray-600" />
    </header>
  );
}
