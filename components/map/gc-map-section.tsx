"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { GcMapView } from "@/components/map/gc-map-view";
import { GcNearbyCard } from "@/components/map/gc-nearby-card";
import type { GcMapItem } from "@/types";

interface GcMapSectionProps {
  groups: GcMapItem[];
  isLoading: boolean;
  mapCenter: [number, number] | null;
  mapZoom: number | null;
  nearestGc: GcMapItem | null;
  onCloseNearbyCard: () => void;
}

export function GcMapSection({
  groups,
  isLoading,
  mapCenter,
  mapZoom,
  nearestGc,
  onCloseNearbyCard,
}: GcMapSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative h-100 sm:h-125 lg:h-137.5">
        {isLoading ? (
          <Skeleton className="size-full rounded-xl" />
        ) : (
          <>
            <GcMapView
              groups={groups}
              center={mapCenter}
              zoom={mapZoom}
              highlightedGcId={nearestGc?.id ?? null}
            />
            <AnimatePresence>
              {nearestGc && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <GcNearbyCard
                    gc={nearestGc}
                    onClose={onCloseNearbyCard}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
