"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { GcMapItem } from "@/types";

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// Centro padrão: Jundiaí, SP
const DEFAULT_CENTER = { lat: -23.1859, lng: -46.8842 };
const DEFAULT_ZOOM = 12;

interface GcMapViewProps {
  groups: GcMapItem[];
  center: [number, number] | null;
  zoom: number | null;
  highlightedGcId: string | null;
}

export function GcMapView({
  groups,
  center,
  zoom,
  highlightedGcId,
}: GcMapViewProps) {
  const mapCenter = center
    ? { lat: center[0], lng: center[1] }
    : DEFAULT_CENTER;

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={mapCenter}
        defaultZoom={zoom ?? DEFAULT_ZOOM}
        className="size-full rounded-xl"
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="gc-finder-map"
      >
        {groups
          .filter((g) => g.latitude && g.longitude)
          .map((gc) => (
            <AdvancedMarker
              key={gc.id}
              position={{
                lat: gc.latitude,
                lng: gc.longitude,
              }}
            >
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 shadow-md transition-transform ${
                  highlightedGcId === gc.id
                    ? "scale-125 border-primary bg-primary text-primary-foreground"
                    : "border-white bg-warm text-warm-foreground"
                }`}
                aria-label={`GC ${gc.name}`}
              >
                <span className="text-xs font-bold">GC</span>
              </div>
            </AdvancedMarker>
          ))}
      </Map>
    </APIProvider>
  );
}
