import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useMemo } from "react";
import { Building2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

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
  onHoverClinic?: (clinic: Clinic | null) => void;
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
// Função auxiliar: calcular distância entre coordenadas
// ==========================
function getDistance([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==========================
// Componente principal
// ==========================
export default function ClinicMap({ selectedClinic, onHoverClinic }: ClinicMapProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestClinic, setNearestClinic] = useState<Clinic | null>(null);

  // Buscar clínicas
  useEffect(() => {
    fetch("http://localhost:8000/api/clinicas-publicas")
      .then((res) => res.json())
      .then((data) => setClinics(data))
      .catch((err) => console.error("Erro ao buscar clínicas:", err));
  }, []);

  // Localização do usuário
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("Não foi possível pegar localização:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // Descobrir clínica mais próxima
  useEffect(() => {
    if (userLocation && clinics.length > 0) {
      let nearest = clinics[0];
      let nearestDist = Infinity;

      clinics.forEach((c) => {
        const [lat, lng] = c.localizacao.split(",").map(Number);
        const dist = getDistance(userLocation, [lat, lng]);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = c;
        }
      });

      setNearestClinic(nearest);
      onHoverClinic?.(nearest); // chama hover automático
    }
  }, [userLocation, clinics, onHoverClinic]);

  // Centro inicial do mapa
  const center: [number, number] = useMemo(() => {
    if (selectedClinic) {
      return selectedClinic.localizacao.split(",").map(Number) as [number, number];
    } else if (nearestClinic) {
      return nearestClinic.localizacao.split(",").map(Number) as [number, number];
    } else if (userLocation) {
      return userLocation;
    }
    return [-23.5025, -46.6161]; // fallback SP
  }, [selectedClinic, nearestClinic, userLocation]);

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

      {/* Centraliza dinamicamente */}
      {nearestClinic && !selectedClinic && (
        <MapCenter
          position={nearestClinic.localizacao.split(",").map(Number) as [number, number]}
        />
      )}
      {selectedClinic && (
        <MapCenter
          position={selectedClinic.localizacao.split(",").map(Number) as [number, number]}
        />
      )}

      {/* Marcador do usuário */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <strong>📍 Você está aqui</strong>
          </Popup>
        </Marker>
      )}

      {/* Marcadores das clínicas */}
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-bold text-[#004E64]">{clinic.nome_fantasia}</h3>
                <p className="text-sm mt-1">{clinic.endereco}</p>
                <p className="text-sm mt-1">☎️ Emergência: {clinic.telefone_emergencia}</p>
              </motion.div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
