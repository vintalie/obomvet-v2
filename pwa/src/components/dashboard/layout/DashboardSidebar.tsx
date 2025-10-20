import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

interface DashboardSidebarProps {
  children: ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  return (
    <aside className="w-56 bg-white border-r flex flex-col justify-between">
      <nav className="p-3 space-y-2">{children}</nav>

      <Link
        to="#"
        className="flex items-center gap-2 px-3 py-2 border-t hover:bg-gray-100"
      >
        <Settings size={18} />
        Configurações
      </Link>
    </aside>
  );
}
