"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Leaflet varsayılan ikon ayarlarını düzelt
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface BusLocation {
  OtobusId: number;
  Yon: number;
  KoorY: string; // Boylam olarak düzeltilmiş
  KoorX: string; // Enlem olarak düzeltilmiş
}

interface MapProps {
  busLocations: BusLocation[];
}

const Map: React.FC<MapProps> = ({ busLocations }) => {
  useEffect(() => {
    console.log("Leaflet varsayılan ikonlar başarıyla yüklendi.");
  }, []);

  // Otobüsler için özel ikon
  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/635/635705.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  // Geçerli koordinatlara sahip otobüsleri filtrele ve enlem-boylamı dönüştür
  const validBusLocations = busLocations
    .filter((bus) => bus.KoorX !== "0" && bus.KoorY !== "0") // Geçersiz koordinatları çıkar
    .map((bus) => ({
      ...bus,
      latitude: parseFloat(bus.KoorX.replace(",", ".")), // Enlem olarak KoorX'i kullan
      longitude: parseFloat(bus.KoorY.replace(",", ".")), // Boylam olarak KoorY'yi kullan
    }));

  return (
    <MapContainer
      center={[38.48604, 27.056975]} // İzmir merkez koordinatları
      zoom={13}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validBusLocations.map((bus, index) => (
        <Marker
          key={`${bus.OtobusId}-${index}`} // Benzersiz bir key oluştur
          position={[bus.latitude, bus.longitude]} // Enlem ve boylamı kullan
          icon={busIcon}
        >
          <Popup>
            <strong>Otobüs ID:</strong> {bus.OtobusId} <br />
            <strong>Yön:</strong> {bus.Yon === 1 ? "Gidiş" : "Dönüş"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
