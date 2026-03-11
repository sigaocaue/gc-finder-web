'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { ApiResponse, StatsCountsResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Church, Crown, UserCog, CalendarDays } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const [counts, setCounts] = useState({ gcs: 0, leaders: 0, users: 0, meetings: 0 })

  const { data: statsCountsResponse, isLoading } = useQuery({
    queryKey: ['admin-stats-counts'],
    queryFn: () => api<ApiResponse<StatsCountsResponse>>('/stats/counts', { authenticated: true }),
  })

  const statsCounts = statsCountsResponse?.data ?? {}
  setCounts({
    gcs: statsCounts?.gcs ?? 0,
    leaders: statsCounts?.leaders ?? 0,
    users: statsCounts?.users ?? 0,
    meetings: statsCounts?.meetings ?? 0,
  })

  const summaryCards = [
    { title: 'GCs', value: counts.gcs, icon: Church, color: 'text-orange-500' },
    { title: 'Líderes de GCs', value: counts.leaders, icon: Crown, color: 'text-green-500' },
    {
      title: 'Usuários administrativos',
      value: counts.users,
      icon: UserCog,
      color: 'text-blue-500',
    },
    { title: 'Reuniões', value: counts.meetings, icon: CalendarDays, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
