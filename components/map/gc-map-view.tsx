"use client";

import { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GcMapItem } from "@/types";

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// Centro padrão: Jundiaí, SP
const DEFAULT_CENTER = { lat: -23.1868, lng: -46.8842 };
const DEFAULT_ZOOM = 12;

interface GcMapViewProps {
  groups: GcMapItem[];
  center: [number, number] | null;
  zoom: number | null;
  highlightedGcId: string | null;
}

// Componente para animar o mapa ao recentrar
function MapCenterUpdater({
  center,
  zoom,
}: {
  center: [number, number] | null;
  zoom: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.panTo({ lat: center[0], lng: center[1] });
      if (zoom) {
        setTimeout(() => map.setZoom(zoom), 300);
      }
    }
  }, [map, center, zoom]);

  return null;
}

export function GcMapView({
  groups,
  center,
  zoom,
  highlightedGcId,
}: GcMapViewProps) {
  const [selectedGc, setSelectedGc] = useState<GcMapItem | null>(null);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        className="size-full rounded-xl"
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        mapId="gc-finder-map"
        onClick={() => setSelectedGc(null)}
      >
        <MapCenterUpdater center={center} zoom={zoom} />

        {groups
          .filter((g) => g.latitude && g.longitude)
          .map((gc) => {
            const isHighlighted = gc.id === highlightedGcId;

            return (
              <AdvancedMarker
                key={gc.id}
                position={{ lat: gc.latitude, lng: gc.longitude }}
                onClick={() => setSelectedGc(gc)}
                zIndex={isHighlighted ? 10 : 1}
              >
                <div
                  className={`flex items-center justify-center rounded-full border-2 shadow-md transition-all duration-200 ${
                    isHighlighted
                      ? "size-10 scale-110 border-primary bg-primary text-primary-foreground"
                      : "size-8 border-white bg-warm text-warm-foreground hover:scale-105"
                  }`}
                  aria-label={`GC ${gc.name}`}
                >
                  <span className={`font-bold ${isHighlighted ? "text-sm" : "text-xs"}`}>
                    GC
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

        {/* Popup com informações do GC ao clicar no marker */}
        {selectedGc && (
          <InfoWindow
            position={{
              lat: selectedGc.latitude,
              lng: selectedGc.longitude,
            }}
            onCloseClick={() => setSelectedGc(null)}
            pixelOffset={[0, -40]}
          >
            <div className="min-w-50 p-1">
              <h3 className="mb-1 text-sm font-bold">{selectedGc.name}</h3>
              {(selectedGc.neighborhood || selectedGc.city) && (
                <p className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="size-3" />
                  {[selectedGc.neighborhood, selectedGc.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              <Link href={`/gcs/${selectedGc.id}`}>
                <Button size="sm" className="h-7 w-full text-xs">
                  Ver detalhes <ArrowRight className="ml-1 size-3" />
                </Button>
              </Link>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
