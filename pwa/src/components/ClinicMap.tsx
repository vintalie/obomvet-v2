// src/components/ClinicMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==========================
// Ícones customizados com profundidade
// ==========================
function createDivIcon(Icon: React.FC<{ size?: number; color?: string }>, bgColor: string) {
  const html = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:40px;
      height:40px;
      border-radius:50%;
      background-color:${bgColor};
      box-shadow:0 4px 10px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    ">
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='white' stroke-width='2'
        viewBox='0 0 24 24' width='22' height='22'>
        ${
          Icon === MapPin
            ? "<path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z'/><circle cx='12' cy='10' r='3'/>"
            : "<path d='M3 21V8l9-5 9 5v13H3z'/><path d='M9 22V12h6v10'/>"
        }
      </svg>
    </div>`;
  return L.divIcon({ html, className: "" });
}

const clinicIcon = createDivIcon(Building2, "#25A18E");
const userIcon = createDivIcon(MapPin, "#FF6B6B");

// ==========================
// Tipos
// ==========================
interface Clinic {
  id: number;
  nome_fantasia: string;
  endereco: string;
  localizacao: string;
  telefone_emergencia: string;
}

interface ClinicMapProps {
  selectedClinic?: Clinic | null;
  onHoverClinic?: (clinic: Clinic | null) => void; // Para interatividade com cards
}

// ==========================
// Centralizar mapa com animação
// ==========================
function MapCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
}

// ==========================
// Componente principal
// ==========================
export default function ClinicMap({ selectedClinic, onHoverClinic }: ClinicMapProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Localização do usuário
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("Não foi possível pegar localização:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // Buscar clínicas
  useEffect(() => {
    fetch("http://localhost:8000/api/clinicas-publicas")
      .then((res) => res.json())
      .then((data) => setClinics(data))
      .catch((err) => console.error("Erro ao buscar clínicas:", err));
  }, []);

  const center: [number, number] = selectedClinic
    ? (selectedClinic.localizacao.split(",").map(Number) as [number, number])
    : userLocation || [-23.5025, -46.6161]; // fallback SP

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      style={{ height: "85vh", width: "100%" }}
      className="rounded-3xl shadow-2xl border border-white/20"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marcador do usuário */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <strong>📍 Você está aqui</strong>
          </Popup>
        </Marker>
      )}

      {/* Marcadores das clínicas com hover */}
      {clinics.map((clinic) => {
        const [lat, lng] = clinic.localizacao.split(",").map(Number);
        return (
          <Marker
            key={clinic.id}
            position={[lat, lng]}
            icon={clinicIcon}
            eventHandlers={{
              mouseover: () => onHoverClinic?.(clinic),
              mouseout: () => onHoverClinic?.(null),
            }}
          >
            <Popup className="bg-white/95 text-gray-800 rounded-xl p-3 shadow-lg">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-bold text-[#004E64]">{clinic.nome_fantasia}</h3>
                <p className="text-sm mt-1">{clinic.endereco}</p>
                <p className="text-sm mt-1">☎️ Emergência: {clinic.telefone_emergencia}</p>
              </motion.div>
            </Popup>
          </Marker>
        );
      })}

      {selectedClinic && (
        <MapCenter
          position={selectedClinic.localizacao.split(",").map(Number) as [number, number]}
        />
      )}
    </MapContainer>
  );
}
