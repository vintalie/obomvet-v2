import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Ajuste o ícone do marcador padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
}));

interface Clinic {
  id: number;
  nome_fantasia: string;
  endereco: string;
  localizacao: string; // "lat,lng"
  telefone_emergencia: string;
}

export default function ClinicMap() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Pega a geolocalização do usuário
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("Não foi possível pegar localização:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // Busca clínicas do backend
  useEffect(() => {
    fetch("http://localhost:8000/api/clinicas")
      .then((res) => res.json())
      .then((data) => setClinics(data))
      .catch((err) => console.error("Erro ao buscar clínicas:", err));
  }, []);

  const center: [number, number] = userLocation || [ -24.007, -46.408 ]; // Centro padrão de Praia Grande

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marcador do usuário */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>Você está aqui</Popup>
        </Marker>
      )}

      {/* Marcadores das clínicas */}
      {clinics.map((clinic) => {
        const [lat, lng] = clinic.localizacao.split(",").map(Number);
        return (
          <Marker key={clinic.id} position={[lat, lng]}>
            <Popup>
              <strong>{clinic.nome_fantasia}</strong>
              <br />
              {clinic.endereco}
              <br />
              Emergência: {clinic.telefone_emergencia}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
