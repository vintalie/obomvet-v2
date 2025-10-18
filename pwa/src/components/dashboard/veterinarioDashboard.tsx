export default function VeterinarioHome({ name }: { name: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">Olá, {name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        Acompanhe as emergências enviadas pelos tutores.
      </p>

      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Verificar emergência
      </button>
    </div>
  );
}
