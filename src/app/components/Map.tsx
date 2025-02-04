/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L, { Map as LeafletMap, Icon } from "leaflet";
import { Polyline } from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface BusStop {
  DURAK_ID: number;
  DURAK_ADI: string;
  ENLEM: number;
  BOYLAM: number;
  DURAKTAN_GECEN_HATLAR: string;
}

interface RoutePoint {
  ENLEM: string;
  BOYLAM: string;
}

const LiveBusMap: React.FC = () => {
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [busIcon, setBusIcon] = useState<Icon | DivIcon | undefined>(undefined);
  const [favoriteStops, setFavoriteStops] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredStops, setFilteredStops] = useState<BusStop[]>([]);
  const [route, setRoute] = useState<[number, number][]>([]);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const busMarkerIcon = new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    setBusIcon(busMarkerIcon);

    const savedFavorites = JSON.parse(
      localStorage.getItem("favoriteStops") || "[]"
    );
    setFavoriteStops(savedFavorites);

    const fetchBusStops = async () => {
      try {
        const response = await fetch("/api/proxy");
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        if (!data.result || !data.result.records)
          throw new Error("Incomplete API data");

        const busStopData: BusStop[] = data.result.records.map((stop: any) => ({
          DURAK_ID: stop.DURAK_ID,
          DURAK_ADI: stop.DURAK_ADI,
          ENLEM: parseFloat(stop.ENLEM),
          BOYLAM: parseFloat(stop.BOYLAM),
          DURAKTAN_GECEN_HATLAR: stop.DURAKTAN_GECEN_HATLAR || "Unknown Route",
        }));

        setBusStops(busStopData);
        setFilteredStops(busStopData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBusStops();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchQuery.trim() !== "") {
      const matchingStops = busStops.filter((stop) =>
        stop.DURAKTAN_GECEN_HATLAR.includes(searchQuery)
      );

      if (matchingStops.length > 0 && mapRef.current) {
        mapRef.current.setView(
          [matchingStops[0].ENLEM, matchingStops[0].BOYLAM],
          15,
          { animate: true }
        );
      }
    }
  };

  const fetchRoute = async () => {
    if (!searchQuery) {
      alert("Please enter a bus route number!");
      return;
    }

    try {
      const response = await fetch(`/api/proxy?hat_no=${searchQuery}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (!data.result || !data.result.records)
        throw new Error("Incomplete API data");

      const filteredRoute: [number, number][] = data.result.records
        .map((route: RoutePoint) => [
          parseFloat(route.ENLEM),
          parseFloat(route.BOYLAM),
        ])
        .filter((coords: number[]) => !isNaN(coords[0]) && !isNaN(coords[1]));

      setRoute(filteredRoute);

      if (mapRef.current && filteredRoute.length > 0) {
        mapRef.current.setView(filteredRoute[0], 13, { animate: true });
      }
    } catch (error) {
      console.error("Error fetching route data:", error);
      alert("Route information could not be retrieved. Please try again!");
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Otobüs Hat No gir..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={fetchRoute}
          style={{
            marginLeft: "10px",
            padding: "10px",
            background: "blue",
            color: "white",
          }}
        >
          🚀 Güzergahı Göster
        </button>
      </div>

      <MapContainer
        center={[38.48604, 27.056975]}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"
          attribution="Google Maps Traffic"
        />

        {filteredStops.map((stop) => (
          <Marker
            key={stop.DURAK_ID}
            position={[stop.ENLEM, stop.BOYLAM]}
            icon={busIcon}
          >
            <Popup>
              <b>Durak Adı:</b> {stop.DURAK_ADI} <br />
              <b>Hat No:</b> {stop.DURAKTAN_GECEN_HATLAR} <br />
              <button onClick={() => alert("Favorilere Eklendi!")}>
                ⭐ Favorilere Ekle
              </button>
            </Popup>
          </Marker>
        ))}

        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default LiveBusMap;
