import { Link } from "react-router-dom";
import { Home, PawPrint, Stethoscope, Settings } from "lucide-react";

interface SidebarProps {
  tipo: "tutor" | "clinica";
}

export default function Sidebar({ tipo }: SidebarProps) {
  return (
    <aside className="w-48 bg-white border-r p-4 flex flex-col justify-between">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link className="flex items-center gap-2 text-gray-700 hover:text-blue-600" to="/dashboard">
              <Home size={18} /> Início
            </Link>
          </li>

          {tipo === "tutor" && (
            <li>
              <Link className="flex items-center gap-2 text-gray-700 hover:text-blue-600" to="/pets">
                <PawPrint size={18} /> Pets
              </Link>
            </li>
          )}

          <li>
            <Link className="flex items-center gap-2 text-gray-700 hover:text-blue-600" to="/emergencia">
              <Stethoscope size={18} /> Emergência
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-4 border-t pt-2">
        <Link
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          to="/configuracoes"
        >
          <Settings size={18} /> Configurações
        </Link>
      </div>
    </aside>
  );
}
