"use client";

import React, { useEffect, useState } from "react";
import Map from "../components/Map";

interface BusLocation {
  OtobusId: number;
  Yon: number;
  KoorY: string;
  KoorX: string;
}

interface Props {
  params: Promise<{
    busNumber: string;
  }>;
}

const BusPage = ({ params }: Props) => {
  // `React.use` ile `params` Promise'ini çöz
  const { busNumber } = React.use(params);

  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        const res = await fetch(
          `https://openapi.izmir.bel.tr/api/iztek/hatotobuskonumlari/${busNumber}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Veri çekme hatası.");
        }

        const data = await res.json();
        setBusLocations(data.HatOtobusKonumlari || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu."
        );
      }
    };

    fetchBusLocations();
  }, [busNumber]);

  if (error) {
    return <div>Hata: {error}</div>;
  }
  console.log(busLocations);
  return (
    <div>
      <h1>Otobüs {busNumber} Konumları</h1>
      <Map />
    </div>
  );
};

export default BusPage;
