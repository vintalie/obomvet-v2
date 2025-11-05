// services/geoService.ts
export async function getCoordinates(endereco: string): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return `${lat},${lon}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Erro ao obter coordenadas:", err);
    return null;
  }
}
