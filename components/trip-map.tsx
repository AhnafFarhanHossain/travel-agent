"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PlusIcon, MinusIcon } from "lucide-react";

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
  onSelectActivity?: (key: string | null) => void;
}

function MapRegister({ onMap }: { onMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
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
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function isValidCoord(lat: number | undefined, lng: number | undefined): boolean {
  return (
    lat !== undefined &&
    lng !== undefined &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function FlyToActivity({ activities, activeKey }: TripMapProps) {
  const map = useMap();
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    if (activeKey === prevKey.current) return;
    prevKey.current = activeKey;

    if (activeKey === null) {
      const coords: [number, number][] = [];
      for (const a of activities) {
        const lat = toNum(a.locationLatitude);
        const lng = toNum(a.locationLongitude);
        if (isValidCoord(lat, lng)) {
          coords.push([lat as number, lng as number]);
        }
      }
      if (coords.length > 0) {
        try {
          map.invalidateSize();
          map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 14 });
        } catch (err) {
          console.warn("[TripMap] fitBounds failed:", err);
        }
      }
      return;
    }

    const act = activities.find((a) => a.key === activeKey);
    if (!act) return;

    const lat = toNum(act.locationLatitude);
    const lng = toNum(act.locationLongitude);

    if (!isValidCoord(lat, lng)) return;

    try {
      map.invalidateSize();
      const size = map.getSize();
      if (size && size.x > 0 && size.y > 0) {
        map.flyTo([lat as number, lng as number], 15, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }
    } catch (err) {
      console.warn("[TripMap] flyTo failed:", err);
    }
  }, [activeKey, activities, map]);

  return null;
}

function MapBounds({ activities, activeKey }: { activities: Activity[]; activeKey: string | null }) {
  const map = useMap();

  useEffect(() => {
    // DO NOT fit bounds if an activity is currently active or locked
    if (activeKey !== null) return;
    if (activities.length === 0) return;

    const coords: [number, number][] = [];
    for (const a of activities) {
      const lat = toNum(a.locationLatitude);
      const lng = toNum(a.locationLongitude);
      if (isValidCoord(lat, lng)) {
        coords.push([lat as number, lng as number]);
      }
    }
    if (coords.length === 0) return;
    try {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 14 });
    } catch (err) {
      console.warn("[TripMap] fitBounds failed:", err);
    }
  }, [activities, activeKey, map]);

  return null;
}

export function TripMap({ activities, activeKey, onSelectActivity }: TripMapProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);

  useEffect(() => {
    if (!mapInstance) return;

    const updateZoom = () => {
      setCanZoomIn(mapInstance.getZoom() < mapInstance.getMaxZoom());
      setCanZoomOut(mapInstance.getZoom() > mapInstance.getMinZoom());
    };

    updateZoom();
    mapInstance.on("zoomend", updateZoom);
    return () => {
      mapInstance.off("zoomend", updateZoom);
    };
  }, [mapInstance]);

  const validActivities = useMemo(() => {
    return activities.filter((a) => {
      const lat = toNum(a.locationLatitude);
      const lng = toNum(a.locationLongitude);
      return isValidCoord(lat, lng);
    });
  }, [activities]);

  if (validActivities.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-muted/40 text-muted-foreground text-sm">
        No location data available
      </div>
    );
  }

  const firstLat = toNum(validActivities[0].locationLatitude)!;
  const firstLng = toNum(validActivities[0].locationLongitude)!;
  const activeActivity = validActivities.find((a) => a.key === activeKey);

  return (
    <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-border">
      {/* Top Left: Active location badge */}
      {activeKey && activeActivity && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-lg bg-background/95 backdrop-blur px-3 py-1.5 text-xs font-medium border border-border shadow-md pointer-events-auto">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="truncate max-w-[200px] sm:max-w-[280px]">
            {activeActivity.title}
          </span>
          {onSelectActivity && (
            <button
              onClick={() => onSelectActivity(null)}
              className="ml-1 text-muted-foreground hover:text-foreground text-xs font-bold underline cursor-pointer"
              title="Unlock map hover"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Top Right: Custom Zoom Controls directly in outer relative container (on top of MapContainer) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col overflow-hidden rounded-lg border border-border bg-background/95 backdrop-blur shadow-md pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            mapInstance?.zoomIn();
          }}
          disabled={!mapInstance || !canZoomIn}
          aria-label="Zoom in"
          className="flex size-8 items-center justify-center border-b border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          <PlusIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            mapInstance?.zoomOut();
          }}
          disabled={!mapInstance || !canZoomOut}
          aria-label="Zoom out"
          className="flex size-8 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          <MinusIcon className="size-4" />
        </button>
      </div>

      <MapContainer
        center={[firstLat, firstLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <MapRegister onMap={setMapInstance} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds activities={validActivities} activeKey={activeKey} />
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
              eventHandlers={{
                click: () => {
                  if (onSelectActivity) {
                    onSelectActivity(act.key);
                  }
                },
              }}
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
