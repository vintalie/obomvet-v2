import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    // Aqui você poderia buscar info do usuário via API
    // fetch("http://localhost:8000/api/me", { headers: { Authorization: `Bearer ${token}` }})
    //   .then(res => res.json())
    //   .then(data => setUserType(data.tipo));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bem-vindo! Tipo de usuário: {userType || "não definido"}</p>

      <div className="mt-4 flex gap-4">
        <Link to="/report" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Enviar Relatório
        </Link>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Sair
        </button>
      </div>
    </div>
  );
}
