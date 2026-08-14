import { useState } from "react";
import LocationPicker from "@/components/dashboard/LocationPicker";

/** Temporary probe page used to verify the Google Maps picker renders. */
const MapProbe = () => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  return (
    <div className="p-4">
      <LocationPicker
        lat={lat}
        lng={lng}
        onChange={(la, lo) => {
          setLat(String(la));
          setLng(String(lo));
        }}
      />
    </div>
  );
};

export default MapProbe;
