'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { GcMapSection } from '@/components/map/gc-map-section'
import type { ApiResponse, GcMapItem, GcNearbyItem } from '@/types'

export function HeroSearch() {
  const [cep, setCep] = useState('')
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [mapZoom, setMapZoom] = useState<number | null>(null)
  const [nearestGc, setNearestGc] = useState<GcMapItem | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Busca GCs ativos com coordenadas para o mapa
  const { data: mapResponse, isLoading: loadingGroups } = useQuery({
    queryKey: ['gcs-map'],
    queryFn: () => api<ApiResponse<GcMapItem[]>>('/public/gcs/map'),
  })

  const groups = mapResponse?.data ?? []

  // Busca o GC mais próximo via API do backend
  const handleCepSearch = useCallback(async (searchCep: string) => {
    const cleanCep = searchCep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      toast.error('Digite um CEP válido com 8 dígitos.')
      return
    }

    setIsSearching(true)
    setNearestGc(null)

    try {
      const response = await api<ApiResponse<GcNearbyItem[]>>(
        `/public/gcs/nearby?zip_code=${cleanCep}`,
      )

      const nearbyGcs = response.data

      if (!nearbyGcs || nearbyGcs.length === 0) {
        toast.info('Nenhum GC encontrado próximo a esse CEP. Registre seu interesse!')
        return
      }

      // O primeiro é o mais próximo (API retorna ordenado por distância)
      const closest = nearbyGcs[0]
      setNearestGc(closest)
      setMapCenter([closest.latitude, closest.longitude])
      setMapZoom(15)
    } catch {
      toast.error('Erro ao buscar GCs próximos. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="bg-primary/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Encontre um <span className="block text-primary">Grupo de Crescimento</span>perto de
            você
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Descubra o GC mais próximo da sua casa e faça parte de uma comunidade que cresce junta.
          </p>

          {/* Busca por CEP */}
          <form
            className="mx-auto mt-8 flex max-w-md items-center gap-2"
            onSubmit={e => {
              e.preventDefault()
              handleCepSearch(cep)
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Digite seu CEP..."
                maxLength={9}
                value={cep}
                onChange={e => setCep(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50"
                aria-label="CEP para busca"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSearching}
              className="h-11 bg-warm text-warm-foreground hover:bg-warm/90"
            >
              {isSearching ? <Loader2 className="size-4 animate-spin" /> : 'Buscar'}
            </Button>
          </form>
        </div>
      </section>

      {/* Mapa */}
      <GcMapSection
        groups={groups}
        isLoading={loadingGroups}
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        nearestGc={nearestGc}
        onCloseNearbyCard={() => setNearestGc(null)}
      />
    </>
  )
}
