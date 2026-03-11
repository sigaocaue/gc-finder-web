import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { GcDetailResponse } from '@/types'

interface GcLocationCardProps {
  gc: GcDetailResponse
}

export function GcLocationCard({ gc }: GcLocationCardProps) {
  const addressParts = [gc.street, gc.number, gc.complement].filter(Boolean)
  const address = addressParts.length > 0 ? addressParts.join(', ') : null
  const cityState = [gc.neighborhood, gc.city, gc.state].filter(Boolean).join(', ')

  if (!address && !cityState && !gc.zip_code) return null

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <MapPin className="size-5 text-primary" />
          Localização
        </h2>

        <div className="space-y-1 text-sm text-muted-foreground">
          {address && <p>{address}</p>}
          {cityState && <p>{cityState}</p>}
          {gc.zip_code && <p>CEP: {gc.zip_code}</p>}
        </div>

        {gc.latitude && gc.longitude && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${gc.latitude},${gc.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <MapPin className="size-4" />
            Abrir no Google Maps
          </a>
        )}
      </CardContent>
    </Card>
  )
}
