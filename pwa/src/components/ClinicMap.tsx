// ClinicMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Ajuste o ícone do marcador padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface Clinic {
  id: number;
  nome_fantasia: string;
  endereco: string;
  localizacao: string; // "lat,lng"
  telefone_emergencia: string;
}

interface ClinicMapProps {
  selectedClinic?: Clinic | null;
}

function MapCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function ClinicMap({ selectedClinic }: ClinicMapProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("Não foi possível pegar localização:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/clinicas-publicas")
      .then((res) => res.json())
      .then((data) => setClinics(data))
      .catch((err) => console.error("Erro ao buscar clínicas:", err));
  }, []);

  const center: [number, number] = selectedClinic
    ? selectedClinic.localizacao.split(",").map(Number) as [number, number]
    : userLocation || [-23.5025, -46.6161]; // fallback SP

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker position={userLocation}>
          <Popup>Você está aqui</Popup>
        </Marker>
      )}

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

      {selectedClinic && (
        <MapCenter position={selectedClinic.localizacao.split(",").map(Number) as [number, number]} />
      )}
    </MapContainer>
  );
}
