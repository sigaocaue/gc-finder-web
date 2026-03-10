'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { GcMapSection } from '@/components/map/gc-map-section'
import { CepSearchBar } from '@/components/home/cep-search-bar'
import type { ApiResponse, GcMapItem, GcNearbyItem } from '@/types'

export function HeroSearch() {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [mapZoom, setMapZoom] = useState<number | null>(null)
  const [nearestGc, setNearestGc] = useState<GcMapItem | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const { data: mapResponse, isLoading: loadingGroups } = useQuery({
    queryKey: ['gcs-map'],
    queryFn: () => api<ApiResponse<GcMapItem[]>>('/public/gcs/map'),
  })

  const groups = mapResponse?.data ?? []

  const handleCepSearch = useCallback(async (rawCep: string) => {
    const cleanCep = rawCep.replace(/\D/g, '')
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
      <section className="bg-primary/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Encontre um <span className="block text-primary">Grupo de Crescimento</span>perto de
            você
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Descubra o GC mais próximo da sua casa e faça parte de uma comunidade que cresce junta.
          </p>

          <CepSearchBar onSearch={handleCepSearch} isLoading={isSearching} />
        </div>
      </section>

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
