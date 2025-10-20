import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

interface NavProps {
  tipo: "tutor" | "veterinario";
}

export default function NavegacaoContextual({ tipo }: NavProps) {
  const location = useLocation();

  const linksTutor = [
    { to: "/dashboard", label: "Início" },
    { to: "/pets", label: "Meus Pets" },
    { to: "/emergencias", label: "Emergências" },
  ];

  const linksVeterinario = [
    { to: "/dashboard", label: "Início" },
    { to: "/atendimentos", label: "Atendimentos" },
    { to: "/emergencias", label: "Chamados" },
  ];

  const activeStyle = (path: string) =>
    location.pathname === path
      ? "bg-blue-600 text-white"
      : "bg-transparent text-gray-700 hover:bg-blue-50 hover:text-blue-700";

  const links = tipo === "tutor" ? linksTutor : linksVeterinario;

  return (
    <motion.nav
      className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-sm flex justify-around py-2 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 80 }}
    >
      {links.map((link) => (
        <Link key={link.to} to={link.to}>
          <button
            className={`${activeStyle(link.to)} px-4 py-2 rounded-xl transition-all text-sm font-medium`}
          >
            {link.label}
          </button>
        </Link>
      ))}
    </motion.nav>
  );
}
