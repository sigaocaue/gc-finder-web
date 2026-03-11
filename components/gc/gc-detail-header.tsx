'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GcDetailResponse } from '@/types'

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface GcDetailHeaderProps {
  gc: GcDetailResponse
}

export function GcDetailHeader({ gc }: GcDetailHeaderProps) {
  const location = [gc.neighborhood, gc.city, gc.state].filter(Boolean).join(', ')
  const firstMeeting = gc.meetings[0]

  return (
    <section className="bg-linear-to-b from-primary/5 to-background py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
            <ArrowLeft className="mr-1 size-4" /> Voltar
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              Grupo de Crescimento
            </Badge>
            {!gc.is_active && (
              <Badge variant="secondary" className="text-muted-foreground">
                Inativo
              </Badge>
            )}
          </div>

          <h1 className="mb-4 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {gc.name}
          </h1>

          {gc.description && (
            <p className="mb-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {gc.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" />
                {location}
              </span>
            )}
            {firstMeeting && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                {WEEKDAYS[firstMeeting.weekday]} às {firstMeeting.start_time}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
