'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, fetchViaCep } from '@/lib/api'
import type {
  ApiResponse,
  GcDetailResponse,
  GcResponse,
  GcMeetingResponse,
  GcMeetingInlineCreate,
  GcMediaInlineCreate,
  LeaderResponse,
  LeaderBrief,
} from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { GcBasicFields } from '@/components/admin/gcs/gc-basic-fields'
import { GcMeetingsSection } from '@/components/admin/gcs/gc-meetings-section'
import { GcLeadersSection } from '@/components/admin/gcs/gc-leaders-section'
import { GcMediasSection } from '@/components/admin/gcs/gc-medias-section'

const gcSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(100),
  description: z.string().max(500).optional(),
  zip_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  street: z.string().min(1, 'Rua obrigatória'),
  number: z.string().optional(),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1, 'Bairro obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(2, 'Estado obrigatório').max(2),
})

type GcFormData = z.infer<typeof gcSchema>

interface GcFormProps {
  gcId?: string
}

export function GcForm({ gcId }: GcFormProps) {
  const isEditing = !!gcId
  const router = useRouter()
  const queryClient = useQueryClient()

  // --- Queries ---
  const { data: gcDetail, isLoading: loadingGc } = useQuery({
    queryKey: ['specific-gc', gcId],
    queryFn: () =>
      api<ApiResponse<GcDetailResponse>>(`/gcs/${gcId}`, { authenticated: true }),
    select: (r) => r.data,
    enabled: isEditing,
  })

  const { data: allLeadersResponse } = useQuery({
    queryKey: ['all-leaders'],
    queryFn: () =>
      api<ApiResponse<LeaderResponse[]>>('/leaders', { authenticated: true }),
  })

  const allLeaders = allLeadersResponse?.data ?? []

  // --- Form ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GcFormData>({
    resolver: zodResolver(gcSchema),
  })

  // --- Estado local ---
  const [meetings, setMeetings] = useState<GcMeetingResponse[]>([])
  const [inlineMeetings, setInlineMeetings] = useState<GcMeetingInlineCreate[]>([])
  const [inlineMedias, setInlineMedias] = useState<GcMediaInlineCreate[]>([])
  const [linkedLeaders, setLinkedLeaders] = useState<LeaderBrief[]>([])
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([])
  const [newLeaderDialogOpen, setNewLeaderDialogOpen] = useState(false)

  // --- Preencher form no modo edição ---
  useEffect(() => {
    if (gcDetail) {
      reset({
        name: gcDetail.name,
        description: gcDetail.description ?? '',
        zip_code: gcDetail.zip_code,
        street: gcDetail.street ?? '',
        number: gcDetail.number ?? '',
        complement: gcDetail.complement ?? '',
        neighborhood: gcDetail.neighborhood ?? '',
        city: gcDetail.city ?? '',
        state: gcDetail.state ?? '',
      })
      setMeetings(gcDetail.meetings ?? [])
      setLinkedLeaders(gcDetail.leaders ?? [])
    }
  }, [gcDetail, reset])

  // Auto-preenchimento via CEP
  const zipCode = watch('zip_code')
  useEffect(() => {
    const clean = zipCode?.replace(/\D/g, '')
    if (clean?.length === 8) {
      fetchViaCep(clean).then((data) => {
        if (!data.erro) {
          setValue('street', data.logradouro ?? '')
          setValue('neighborhood', data.bairro ?? '')
          setValue('city', data.localidade ?? '')
          setValue('state', data.uf ?? '')
        }
      })
    }
  }, [zipCode, setValue])

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: GcFormData) =>
      api<ApiResponse<GcResponse>>('/gcs', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          zip_code: data.zip_code.replace(/\D/g, ''),
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          leaders: selectedLeaderIds.length > 0 ? selectedLeaderIds : undefined,
          meetings: inlineMeetings.length > 0 ? inlineMeetings : undefined,
          medias: inlineMedias.length > 0 ? inlineMedias : undefined,
        }),
        authenticated: true,
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['all-gcs'] })
      toast.success('GC criado com sucesso!')
      if (res.data) {
        router.push(`/admin/gcs/${res.data.id}/edit`)
      }
    },
    onError: () => toast.error('Erro ao criar GC.'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: GcFormData) =>
      api(`/gcs/${gcId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          zip_code: data.zip_code.replace(/\D/g, ''),
        }),
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-gcs'] })
      void queryClient.invalidateQueries({ queryKey: ['specific-gc', gcId] })
      toast.success('GC atualizado com sucesso!')
    },
    onError: () => toast.error('Erro ao atualizar GC.'),
  })

  const createLeaderMutation = useMutation({
    mutationFn: (leaderData: { name: string; phone: string }) =>
      api<ApiResponse<LeaderResponse>>('/leaders', {
        method: 'POST',
        body: JSON.stringify({
          name: leaderData.name,
          contacts: leaderData.phone
            ? [{ type: 'whatsapp', value: leaderData.phone }]
            : undefined,
        }),
        authenticated: true,
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['all-leaders'] })
      toast.success('Líder criado com sucesso!')
      setNewLeaderDialogOpen(false)

      if (isEditing && gcId && res.data) {
        api(`/gcs/${gcId}/leaders`, {
          method: 'POST',
          body: JSON.stringify({ leader_id: res.data.id }),
          authenticated: true,
        }).then(() => {
          void queryClient.invalidateQueries({ queryKey: ['specific-gc', gcId] })
        })
      } else if (res.data) {
        setSelectedLeaderIds((prev) => [...prev, res.data!.id])
      }
    },
    onError: () => toast.error('Erro ao criar líder.'),
  })

  const onSubmit = (data: GcFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  // --- Handlers de encontros (modo edição via API) ---
  const addMeeting = async (meeting: {
    weekday: number
    start_time: string
    notes?: string
  }) => {
    if (!gcId) return
    try {
      await api(`/gcs/${gcId}/meetings`, {
        method: 'POST',
        body: JSON.stringify(meeting),
        authenticated: true,
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      })
      void queryClient.invalidateQueries({ queryKey: ['specific-gc', gcId] })
      toast.success('Encontro adicionado.')
    } catch {
      toast.error('Erro ao adicionar encontro.')
    }
  }

  const removeMeeting = async (meetingId: string) => {
    if (!gcId) return
    try {
      await api(`/gcs/${gcId}/meetings/${meetingId}`, {
        method: 'DELETE',
        authenticated: true,
      })
      void queryClient.invalidateQueries({ queryKey: ['specific-gc', gcId] })
      toast.success('Encontro removido.')
    } catch {
      toast.error('Erro ao remover encontro.')
    }
  }

  // --- Handlers de responsáveis (modo de edição via API) ---
  const linkLeader = async (leaderId: string) => {
    if (!gcId) return
    try {
      await api(`/gcs/${gcId}/leaders`, {
        method: 'POST',
        body: JSON.stringify({ leader_id: leaderId }),
        authenticated: true,
      })
      void queryClient.invalidateQueries({ queryKey: ['specific-gc', gcId] })
      toast.success('Responsável vinculado.')
    } catch {
      toast.error('Erro ao vincular responsável.')
    }
  }

  const unlinkLeader = async (leaderId: string) => {
    if (!gcId) return
    try {
      await api(`/gcs/${gcId}/leaders/${leaderId}`, {
        method: 'DELETE',
        authenticated: true,
      })
      void queryClient.invalidateQueries({ queryKey: ['specific-gc', gcId] })
      toast.success('Responsável removido.')
    } catch {
      toast.error('Erro ao remover responsável.')
    }
  }

  // --- Loading ---
  if (isEditing && loadingGc) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // --- Listas filtradas de líderes disponíveis ---
  const availableLeadersForEdit = allLeaders.filter(
    (l) => l.is_active && !linkedLeaders.some((ll) => ll.id === l.id)
  )

  const availableLeadersForCreate = allLeaders.filter(
    (l) => l.is_active && !selectedLeaderIds.includes(l.id)
  )

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href="/admin/gcs">
          <Button type="button" variant="ghost" size="icon" aria-label="Voltar">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar GC' : 'Novo GC'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <GcBasicFields register={register} errors={errors} />

        {!isEditing && (
          <GcLeadersSection
            mode="create"
            selectedLeaderIds={selectedLeaderIds}
            availableLeaders={availableLeadersForCreate}
            allLeaders={allLeaders}
            onAdd={(id) => setSelectedLeaderIds((prev) => [...prev, id])}
            onRemove={(id) =>
              setSelectedLeaderIds((prev) => prev.filter((i) => i !== id))
            }
            onCreateLeader={(data) => createLeaderMutation.mutate(data)}
            isCreatingLeader={createLeaderMutation.isPending}
            newLeaderDialogOpen={newLeaderDialogOpen}
            onNewLeaderDialogChange={setNewLeaderDialogOpen}
          />
        )}

        {!isEditing && (
          <GcMeetingsSection
            mode="create"
            meetings={inlineMeetings}
            onAdd={(m) => setInlineMeetings((prev) => [...prev, m])}
            onRemove={(i) =>
              setInlineMeetings((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        )}

        {!isEditing && (
          <GcMediasSection
            medias={inlineMedias}
            onAdd={(m) => setInlineMedias((prev) => [...prev, m])}
            onRemove={(i) =>
              setInlineMedias((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : isEditing
              ? 'Salvar alterações'
              : 'Criar GC'}
        </Button>
      </form>

      {/* Seções fora do form no modo edição (CRUD via API) */}
      {isEditing && (
        <GcMeetingsSection
          mode="edit"
          meetings={meetings}
          onAdd={addMeeting}
          onRemove={removeMeeting}
        />
      )}

      {isEditing && (
        <GcLeadersSection
          mode="edit"
          linkedLeaders={linkedLeaders}
          availableLeaders={availableLeadersForEdit}
          onLink={linkLeader}
          onUnlink={unlinkLeader}
          onCreateLeader={(data) => createLeaderMutation.mutate(data)}
          isCreatingLeader={createLeaderMutation.isPending}
          newLeaderDialogOpen={newLeaderDialogOpen}
          onNewLeaderDialogChange={setNewLeaderDialogOpen}
        />
      )}
    </div>
  )
}
