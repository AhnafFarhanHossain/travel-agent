"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Activity {
  key: string;
  title: string;
  locationName: string;
  locationLatitude: number;
  locationLongitude: number;
  category: string;
  timeSlot: string;
}

interface TripMapProps {
  activities: Activity[];
  activeKey: string | null;
}

function createMarkerIcon(category: string, isActive: boolean) {
  const colors: Record<string, string> = {
    food: "#c2410c",
    sightseeing: "#0e7490",
    accommodation: "#7c3aed",
    activity: "#15803d",
  };
  const color = colors[category] || "#c2410c";
  const size = isActive ? 32 : 24;
  const stroke = isActive ? 3 : 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white" opacity="0.9"/></svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

function toNum(v: unknown): number | undefined {
  if (typeof v === "number" && !isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (!isNaN(n)) return n;
  }
  return undefined;
}

function FlyToActivity({ activities, activeKey }: TripMapProps) {
  const map = useMap();
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    console.log("[FlyToActivity] activeKey:", activeKey, "prevKey:", prevKey.current, "count:", activities.length);
    if (activeKey === null || activeKey === prevKey.current) return;

    const act = activities.find((a) => a.key === activeKey);
    console.log("[FlyToActivity] found:", act?.title, "raw lat:", act?.locationLatitude, "raw lng:", act?.locationLongitude, "types:", typeof act?.locationLatitude, typeof act?.locationLongitude);
    if (!act) return;

    const lat = toNum(act.locationLatitude);
    const lng = toNum(act.locationLongitude);
    console.log("[FlyToActivity] coerced lat:", lat, "lng:", lng);

    if (lat === undefined || lng === undefined) return;

    map.flyTo([lat, lng], 15, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
    prevKey.current = activeKey;
  }, [activeKey, activities, map]);

  return null;
}

function MapBounds({ activities }: { activities: Activity[] }) {
  const map = useMap();

  useEffect(() => {
    if (activities.length === 0) return;
    const coords: [number, number][] = [];
    for (const a of activities) {
      const lat = toNum(a.locationLatitude);
      const lng = toNum(a.locationLongitude);
      if (lat !== undefined && lng !== undefined) {
        coords.push([lat, lng]);
      }
    }
    if (coords.length === 0) return;
    map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 14 });
  }, [activities, map]);

  return null;
}

export function TripMap({ activities, activeKey }: TripMapProps) {
  const validActivities = activities.filter(
    (a) => toNum(a.locationLatitude) !== undefined && toNum(a.locationLongitude) !== undefined
  );

  if (validActivities.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-muted/40 text-muted-foreground text-sm">
        No location data available
      </div>
    );
  }

  const firstLat = toNum(validActivities[0].locationLatitude)!;
  const firstLng = toNum(validActivities[0].locationLongitude)!;

  return (
    <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={[firstLat, firstLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds activities={validActivities} />
        <FlyToActivity activities={validActivities} activeKey={activeKey} />
        {validActivities.map((act) => {
          const lat = toNum(act.locationLatitude)!;
          const lng = toNum(act.locationLongitude)!;
          const isActive = activeKey === act.key;
          return (
            <Marker
              key={act.key}
              position={[lat, lng]}
              icon={createMarkerIcon(act.category, isActive)}
              zIndexOffset={isActive ? 1000 : 0}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{act.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{act.locationName}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
