import Map from "./components/Map";

// async function getBusLocations() {
//   const res = await fetch(
//     "https://openapi.izmir.bel.tr/api/iztek/hatotobuskonumlari/423",
//     {
//       cache: "no-store",
//     }
//   );
//   const data = await res.json();

//   console.log("Otobüs Konumları:", data.HatOtobusKonumlari); // Gelen veriyi kontrol edin
//   return data.HatOtobusKonumlari || [];
// }

export default async function Home() {
  // const busLocations = await getBusLocations();

  return (
    <div>
      <h1>İzmir Otobüs Konumları</h1>
      <Map />
    </div>
  );
}
