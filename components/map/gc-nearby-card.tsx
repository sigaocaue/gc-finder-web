"use client";

import Link from "next/link";
import { X, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GcNearbyItem, GcMapItem } from "@/types";

interface GcNearbyCardProps {
  gc: GcMapItem;
  onClose: () => void;
}

function isNearbyItem(gc: GcMapItem): gc is GcNearbyItem {
  return "distance_km" in gc;
}

export function GcNearbyCard({ gc, onClose }: GcNearbyCardProps) {
  return (
    <Card className="absolute bottom-4 left-4 right-4 z-10 border-primary/20 bg-background/95 shadow-lg backdrop-blur-sm sm:left-auto sm:right-4 sm:w-96">
      <CardContent className="p-5">
        {/* Cabeçalho com badge e botão fechar */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <Badge className="mb-2 border-primary/20 bg-primary/10 text-xs text-primary">
              GC mais próximo
            </Badge>
            <h3 className="text-lg font-bold">{gc.name}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="-mr-1 -mt-1 size-8 rounded-full"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Informações do GC */}
        <div className="mb-4 space-y-2">
          {(gc.neighborhood || gc.city) && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary" />
              {[gc.neighborhood, gc.city].filter(Boolean).join(", ")}
            </p>
          )}

          {isNearbyItem(gc) && (
            <p className="text-xs text-muted-foreground">
              ~{gc.distance_km.toFixed(1)} km de distância
            </p>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Link href={`/gcs/${gc.id}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Ver detalhes <ArrowRight className="ml-1 size-4" />
            </Button>
          </Link>
          <Link href={`/interesse?gc_id=${gc.id}`}>
            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Participar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
