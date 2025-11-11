// src/hooks/useGeolocation.ts
import { useState, useEffect } from "react";
import { Location } from "../types/emergency.types";

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      setLocationError("Obtendo sua localização...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Localização obtida:", position.coords);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          console.warn("Erro ao obter geolocalização:", err.code, err.message);
          let errorMsg = "Não foi possível obter sua localização.";
          if (err.code === 1) errorMsg = "Permissão de localização negada.";
          else if (err.code === 2) errorMsg = "Sua localização não está disponível.";
          else if (err.code === 3) errorMsg = "Tempo esgotado ao obter localização.";
          setLocationError(errorMsg);
        },
        { timeout: 15000, enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocalização não suportada.");
    }
  }, []); // Array vazio, roda só uma vez

  return { location, locationError, setLocationError };
}