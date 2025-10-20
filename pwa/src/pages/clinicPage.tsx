import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClinicMap from "../components/ClinicMap";
import { ArrowLeft } from "lucide-react";

interface Clinic {
  id: number;
  nome_fantasia: string;
  endereco: string;
  localizacao: string; // "lat,lng"
  telefone_emergencia: string;
  distancia?: number; // distância em km
}

export default function ClinicPage() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  // Função para calcular distância em km entre dois pontos
  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => setUserLocation(null)
      );
    }
  }, []);

  // Carregar clínicas do backend e calcular distância
  useEffect(() => {
    fetch("http://localhost:8000/api/clinicas-publicas")
      .then((res) => res.json())
      .then((data: Clinic[]) => {
        if (userLocation) {
          const dataComDistancia = data.map((clinic) => {
            const [lat, lng] = clinic.localizacao.split(",").map(Number);
            return { ...clinic, distancia: calcularDistancia(userLocation.lat, userLocation.lng, lat, lng) };
          });
          dataComDistancia.sort((a, b) => (a.distancia! - b.distancia!));
          setClinics(dataComDistancia);
        } else {
          setClinics(data);
        }
      })
      .catch((err) => console.error(err));
  }, [userLocation]);

  // Função para abrir rota no Google Maps
  const abrirRota = (clinic: Clinic) => {
    const destino = clinic.localizacao;
    let origem = "";
    if (userLocation) {
      origem = `${userLocation.lat},${userLocation.lng}`;
    }
    const url = origem
      ? `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${destino}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E64] to-[#25A18E] flex flex-col">
      {/* Back Button */}
      <div className="pt-6 px-6">
        <button
          className="flex items-center gap-2 text-white font-semibold hover:text-gray-200 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} /> Voltar
        </button>
      </div>

      <main className="flex-1 flex flex-col md:flex-row items-start justify-center pt-6 px-6 md:px-16 gap-6">
        {/* Mapa */}
        <div className="w-full md:w-2/3 h-[500px] md:h-[700px] rounded-2xl overflow-hidden shadow-lg">
          <ClinicMap selectedClinic={selectedClinic} />
        </div>

        {/* Lista de clínicas */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {clinics.map((clinic, index) => (
            <motion.div
              key={clinic.id}
              className={`rounded-3xl shadow-xl p-6 flex flex-col transition-transform
                ${index === 0 ? "bg-yellow-100 border-2 border-yellow-400 scale-[1.04]" : "bg-white hover:scale-[1.02]"}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-bold text-xl text-[#004E64] mb-1">{clinic.nome_fantasia}</h2>
              <p className="text-sm text-gray-600 mb-1">{clinic.endereco}</p>
              <p className="text-sm text-gray-600 mb-1">
                Emergência: <span className="font-semibold">{clinic.telefone_emergencia}</span>
              </p>
              {clinic.distancia && (
                <p className="text-sm font-semibold text-[#FF6B6B] mb-4">
                  {index === 0 ? "Mais próxima!" : `Distância: ${clinic.distancia.toFixed(1)} km`}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-[#25A18E] text-white rounded-xl py-2 font-medium hover:bg-[#208B7C] transition"
                  onClick={() => setSelectedClinic(clinic)}
                >
                  Mostrar no mapa
                </button>
                <button
                  className="flex-1 bg-[#FF6B6B] text-white rounded-xl py-2 font-medium hover:bg-[#e85a5a] transition"
                  onClick={() => abrirRota(clinic)}
                >
                  Abrir rota
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-gray-100 bg-[#003b50] shadow-inner mt-10">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
