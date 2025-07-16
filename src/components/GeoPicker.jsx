import { MapContainer, TileLayer, Marker, useMapEvents, useMap  } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const defaultCenter = [50.45, 30.52];

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function GeoPicker({ value, onChange }) {
  const [position, setPosition] = useState(value && value.length === 2 ? value : defaultCenter);
  const [zoom, setZoom] = useState(
      value && value.length === 2 && (value[0] !== defaultCenter[0] || value[1] !== defaultCenter[1]) ? 16 : 6
    );


  useEffect(() => {
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      (value[0] !== position[0] || value[1] !== position[1])
    ) {
      setPosition(value);

      if (value[0] !== defaultCenter[0] || value[1] !== defaultCenter[1]) {
        setZoom(16);
      } else {
        setZoom(6);
      }
    }
    // eslint-disable-next-line
  }, [value]);

  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600, marginTop: 20 }}>Set hotel location :</div>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: 300, width: "100%", borderRadius: 12, marginBottom: 10 }}
      >
        <MapController center={position} zoom={zoom} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={latlng => {
          setPosition(latlng);
          onChange && onChange(latlng);
        }} />
      </MapContainer>
    </div>
  );
}