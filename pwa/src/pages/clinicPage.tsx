import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClinicMap from "../components/ClinicMap";
import { ArrowLeft, MapPin, Phone, Navigation } from "lucide-react";

interface Clinic {
  id: number;
  nome_fantasia: string;
  endereco: string;
  localizacao: string;
  telefone_emergencia: string;
  distancia?: number;
}

export default function ClinicPage() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null)
    );
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/clinicas-publicas")
      .then((res) => res.json())
      .then((data: Clinic[]) => {
        if (userLocation) {
          const dataComDistancia = data.map((c) => {
            const [lat, lng] = c.localizacao.split(",").map(Number);
            return { ...c, distancia: calcularDistancia(userLocation.lat, userLocation.lng, lat, lng) };
          });
          dataComDistancia.sort((a, b) => a.distancia! - b.distancia!);
          setClinics(dataComDistancia);
        } else setClinics(data);
      })
      .catch(console.error);
  }, [userLocation]);

  const abrirRota = (clinic: Clinic) => {
    const destino = clinic.localizacao;
    const origem = userLocation ? `${userLocation.lat},${userLocation.lng}` : "";
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E64] via-[#137D73] to-[#25A18E] flex flex-col">
      <div className="pt-6 px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white font-semibold hover:text-gray-200 transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
      </div>

      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-10">
  {/* Mapa */}
  <motion.div
    className="w-full md:w-2/3 h-[500px] md:h-[750px] rounded-3xl overflow-hidden shadow-xl bg-white/20 backdrop-blur-md border border-white/30"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <ClinicMap selectedClinic={selectedClinic} />
  </motion.div>

  {/* Lista de clínicas */}
  <div className="w-full md:w-1/3 flex flex-col gap-6">
    {clinics.map((clinic, i) => (
      <motion.div
        key={clinic.id}
        className={`p-6 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl border-l-4 ${
          i === 0 ? "border-yellow-400" : "border-transparent"
        }`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
      >
        <h2 className="text-2xl font-bold text-[#004E64] flex items-center gap-3">
          <MapPin size={20} /> {clinic.nome_fantasia}
        </h2>
        <p className="text-gray-600 mt-2">{clinic.endereco}</p>
        <p className="text-gray-600 flex items-center gap-2 mt-1">
          <Phone size={16} /> {clinic.telefone_emergencia}
        </p>
        {clinic.distancia && (
          <p className="mt-2 font-semibold text-[#FF6B6B]">
            {i === 0 ? "Mais próxima!" : `Distância: ${clinic.distancia.toFixed(1)} km`}
          </p>
        )}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setSelectedClinic(clinic)}
            className="flex-1 bg-gradient-to-r from-[#25A18E] to-[#1f857a] text-white rounded-xl py-3 font-semibold hover:from-[#208B7C] hover:to-[#1a6e63] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <MapPin size={18} /> Mostrar
          </button>
          <button
            onClick={() => abrirRota(clinic)}
            className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#e85a5a] text-white rounded-xl py-3 font-semibold hover:from-[#e85a5a] hover:to-[#d45252] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Navigation size={18} /> Rota
          </button>
        </div>
      </motion.div>
    ))}
  </div>
</main>


      <footer className="w-full text-center py-4 text-xs text-gray-100 bg-[#003b50] shadow-inner">
        &copy; {new Date().getFullYear()} oBomVet — Plataforma de Emergências Veterinárias
      </footer>
    </div>
  );
}
