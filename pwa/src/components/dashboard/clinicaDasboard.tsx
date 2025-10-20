import PetCard from "./petDashboard";
import { Link } from "react-router-dom";

interface Pet {
  id: number;
  nome: string;
  especie: string;
  idade: number;
}

interface TutorHomeProps {
  name: string;
  pets: Pet[];
}

export default function TutorHome({ name, pets }: TutorHomeProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">Olá, {name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        Veja seus pets cadastrados e envie novas emergências.
      </p>

      <Link
        to="/criar-emergencia"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Criar emergência
      </Link>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
}
