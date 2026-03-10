'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
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
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 leading-tight"
          >
            Encontre um <span className="text-primary">Grupo de Crescimento</span>
            <br className="hidden sm:block" /> perto de você
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto"
          >
            Comunidade, acolhimento e crescimento espiritual pertinho da sua casa.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <CepSearchBar onSearch={handleCepSearch} isLoading={isSearching} />
          </motion.div>
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
