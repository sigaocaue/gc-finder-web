"use client";

import Link from "next/link";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GcMapItem } from "@/types";

interface GcNearbyCardProps {
  gc: GcMapItem;
  onClose: () => void;
}

export function GcNearbyCard({ gc, onClose }: GcNearbyCardProps) {
  return (
    <Card className="absolute bottom-4 left-4 right-4 z-10 sm:left-auto sm:right-4 sm:w-80">
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold">{gc.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar card do GC"
          >
            <X className="size-4" />
          </Button>
        </div>

        {(gc.neighborhood || gc.city) && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {[gc.neighborhood, gc.city].filter(Boolean).join(", ")}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <Link href={`/gcs/${gc.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              Ver detalhes
            </Button>
          </Link>
          <Link href={`/interesse?gcId=${gc.id}`}>
            <Button variant="outline" size="sm">
              Tenho interesse
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
