'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { GcDetailHeader } from '@/components/gc/gc-detail-header'
import { GcMeetingsCard } from '@/components/gc/gc-meetings-card'
import { GcLeadersCard } from '@/components/gc/gc-leaders-card'
import { GcLocationCard } from '@/components/gc/gc-location-card'
import { GcMediaGallery } from '@/components/gc/gc-media-gallery'
import { GcInterestCta } from '@/components/gc/gc-interest-cta'
import { GcDetailSkeleton } from '@/components/gc/gc-detail-skeleton'
import type { ApiResponse, GcResponse } from '@/types'

export default function GcDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: response, isLoading } = useQuery({
    queryKey: ['gc-detail', id],
    queryFn: () => api<ApiResponse<GcResponse>>(`/gcs/${id}`),
  })

  if (isLoading) {
    return <GcDetailSkeleton />
  }

  const gc = response?.data

  if (!gc) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">GC não encontrado.</p>
      </div>
    )
  }

  return (
    <>
      <GcDetailHeader gc={gc} />

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <div className="space-y-6">
            <GcMeetingsCard meetings={gc.meetings} />
            <GcLeadersCard leaders={gc.leaders} />
          </div>

          <div className="space-y-6">
            <GcLocationCard gc={gc} />
            <GcMediaGallery medias={gc.medias} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <GcInterestCta gcId={gc.id} gcName={gc.name} />
        </motion.div>
      </section>
    </>
  )
}
