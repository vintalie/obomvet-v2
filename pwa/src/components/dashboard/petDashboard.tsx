interface PetCardProps {
  pet: {
    id: number;
    nome: string;
    especie: string;
    idade: number;
  };
}

export default function PetCard({ pet }: PetCardProps) {
  return (
    <div className="border rounded-lg p-3 bg-gray-100 hover:shadow">
      <h3 className="font-semibold">{pet.nome}</h3>
      <p className="text-sm text-gray-600 capitalize">{pet.especie}</p>
      <p className="text-xs text-gray-500">Idade: {pet.idade} anos</p>
    </div>
  );
}
