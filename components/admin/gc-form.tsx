'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, fetchViaCep } from '@/lib/api'
import { WEEKDAY_LABELS } from '@/types'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, Plus, UserPlus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

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

const MEDIA_TYPE_LABELS: Record<string, string> = {
  image: 'Imagem',
  instagram_post: 'Post Instagram',
  video: 'Vídeo',
}

interface GcFormProps {
  gcId?: string
}

export function GcForm({ gcId }: GcFormProps) {
  const isEditing = !!gcId
  const router = useRouter()
  const queryClient = useQueryClient()

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

  // Encontros no modo edição (existentes via API)
  const [meetings, setMeetings] = useState<GcMeetingResponse[]>([])
  const [newMeeting, setNewMeeting] = useState({
    weekday: 0,
    start_time: '19:30',
    notes: '',
  })

  // Encontros no modo criação (lista local)
  const [inlineMeetings, setInlineMeetings] = useState<GcMeetingInlineCreate[]>([])
  const [newInlineMeeting, setNewInlineMeeting] = useState({
    weekday: 0,
    start_time: '19:30',
    notes: '',
  })

  // Mídias no modo criação (lista local)
  const [inlineMedias, setInlineMedias] = useState<GcMediaInlineCreate[]>([])
  const [newInlineMedia, setNewInlineMedia] = useState({
    type: 'image',
    url: '',
    caption: '',
    display_order: 0,
  })

  // Responsáveis no modo edição
  const [linkedLeaders, setLinkedLeaders] = useState<LeaderBrief[]>([])
  const [selectedLeaderId, setSelectedLeaderId] = useState('')

  // Responsáveis no modo criação (IDs selecionados)
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([])

  // Dialog para criar novo líder
  const [newLeaderDialogOpen, setNewLeaderDialogOpen] = useState(false)
  const [newLeader, setNewLeader] = useState({ name: '', phone: '' })

  const createLeaderMutation = useMutation({
    mutationFn: () =>
      api<ApiResponse<LeaderResponse>>('/leaders', {
        method: 'POST',
        body: JSON.stringify({
          name: newLeader.name,
          contacts: newLeader.phone
            ? [{ type: 'whatsapp', value: newLeader.phone }]
            : undefined,
        }),
        authenticated: true,
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['all-leaders'] })
      toast.success('Líder criado com sucesso!')
      setNewLeader({ name: '', phone: '' })
      setNewLeaderDialogOpen(false)

      if (isEditing && gcId && res.data) {
        api(`/gcs/${gcId}/leaders`, {
          method: 'POST',
          body: JSON.stringify({ leader_id: res.data.id }),
          authenticated: true,
        }).then(() => {
          void queryClient.invalidateQueries({ queryKey: ['gc-detail', gcId] })
        })
      } else if (res.data) {
        setSelectedLeaderIds((prev) => [...prev, res.data!.id])
      }
    },
    onError: () => toast.error('Erro ao criar líder.'),
  })

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

  const onSubmit = (data: GcFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  // CRUD de encontros no modo edição (via API)
  const addMeeting = async (): Promise<void> => {
    if (!gcId) {
      return
    }

    try {
      await api(`/gcs/${gcId}/meetings`, {
        method: 'POST',
        body: JSON.stringify({
          weekday: newMeeting.weekday,
          start_time: newMeeting.start_time,
          notes: newMeeting.notes || undefined,
        }),
        authenticated: true,
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        }
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

  // CRUD de responsáveis no modo edição (via API)
  const linkLeader = async () => {
    if (!gcId || !selectedLeaderId) return
    try {
      await api(`/gcs/${gcId}/leaders`, {
        method: 'POST',
        body: JSON.stringify({ leader_id: selectedLeaderId }),
        authenticated: true,
      })
      void queryClient.invalidateQueries({ queryKey: ['specific-gc', gcId] })
      setSelectedLeaderId('')
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

  // Encontros inline no modo criação (estado local)
  const addInlineMeeting = () => {
    setInlineMeetings((prev) => [...prev, { ...newInlineMeeting }])
    setNewInlineMeeting({ weekday: 0, start_time: '19:30', notes: '' })
  }

  const removeInlineMeeting = (index: number) => {
    setInlineMeetings((prev) => prev.filter((_, i) => i !== index))
  }

  // Mídias inline no modo criação (estado local)
  const addInlineMedia = () => {
    if (!newInlineMedia.url.trim()) {
      toast.error('URL da mídia é obrigatória.')
      return
    }
    setInlineMedias((prev) => [
      ...prev,
      {
        type: newInlineMedia.type,
        url: newInlineMedia.url,
        caption: newInlineMedia.caption || undefined,
        display_order: newInlineMedia.display_order,
      },
    ])
    setNewInlineMedia({ type: 'image', url: '', caption: '', display_order: 0 })
  }

  const removeInlineMedia = (index: number) => {
    setInlineMedias((prev) => prev.filter((_, i) => i !== index))
  }

  // Seleção de responsáveis no modo criação (estado local)
  const addSelectedLeader = () => {
    if (!selectedLeaderId) return
    setSelectedLeaderIds((prev) => [...prev, selectedLeaderId])
    setSelectedLeaderId('')
  }

  const removeSelectedLeader = (leaderId: string) => {
    setSelectedLeaderIds((prev) => prev.filter((id) => id !== leaderId))
  }

  if (isEditing && loadingGc) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const availableLeadersForEdit = allLeaders.filter(
    (l) => l.is_active && !linkedLeaders.some((ll) => ll.id === l.id)
  )

  const availableLeadersForCreate = allLeaders.filter(
    (l) => l.is_active && !selectedLeaderIds.includes(l.id)
  )

  const getLeaderName = (leaderId: string): string => {
    return allLeaders.find((l) => l.id === leaderId)?.name ?? leaderId
  }

  const newLeaderDialog = (
    <Dialog open={newLeaderDialogOpen} onOpenChange={setNewLeaderDialogOpen}>
      <DialogTrigger render={
        <Button type="button" variant="secondary" size="sm" className="gap-1" />
      }>
        <UserPlus className="size-3" /> Criar novo líder
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo líder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="new-leader-name">Nome *</Label>
            <Input
              id="new-leader-name"
              value={newLeader.name}
              onChange={(e) =>
                setNewLeader((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-leader-phone">WhatsApp</Label>
            <Input
              id="new-leader-phone"
              value={newLeader.phone}
              onChange={(e) =>
                setNewLeader((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="11999999999"
            />
          </div>
          <Button
            type="button"
            onClick={() => createLeaderMutation.mutate()}
            disabled={!newLeader.name.trim() || createLeaderMutation.isPending}
            className="w-full"
          >
            {createLeaderMutation.isPending ? 'Criando...' : 'Criar líder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
        {/* Dados básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do GC *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP *</Label>
                <Input
                  id="zip_code"
                  {...register('zip_code')}
                  placeholder="00000-000"
                />
                {errors.zip_code && (
                  <p className="text-xs text-destructive">
                    {errors.zip_code.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input id="number" {...register('number')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input id="street" {...register('street')} />
              {errors.street && (
                <p className="text-xs text-destructive">{errors.street.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register('complement')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input id="neighborhood" {...register('neighborhood')} />
                {errors.neighborhood && (
                  <p className="text-xs text-destructive">
                    {errors.neighborhood.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input id="city" {...register('city')} />
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  maxLength={2}
                  placeholder="SP"
                />
                {errors.state && (
                  <p className="text-xs text-destructive">{errors.state.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsáveis no modo criação */}
        {!isEditing && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Responsáveis</CardTitle>
              {newLeaderDialog}
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLeaderIds.map((leaderId) => (
                <div
                  key={leaderId}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="flex-1 text-sm font-medium">
                    {getLeaderName(leaderId)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSelectedLeader(leaderId)}
                    aria-label="Remover responsável"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {availableLeadersForCreate.length > 0 && (
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Adicionar responsável</Label>
                    <Select
                      value={selectedLeaderId}
                      onValueChange={(v) => setSelectedLeaderId(v ?? '')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLeadersForCreate.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSelectedLeader}
                    disabled={!selectedLeaderId}
                  >
                    <Plus className="mr-1 size-3" /> Adicionar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Encontros no modo criação */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encontros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inlineMeetings.map((m, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="flex-1 text-sm">
                    <strong>{WEEKDAY_LABELS[m.weekday]}</strong> — {m.start_time}
                    {m.notes ? ` (${m.notes})` : ''}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInlineMeeting(index)}
                    aria-label="Remover encontro"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed p-3">
                <div className="space-y-1">
                  <Label className="text-xs">Dia</Label>
                  <Select
                    value={String(newInlineMeeting.weekday)}
                    onValueChange={(v) =>
                      setNewInlineMeeting((p) => ({ ...p, weekday: Number(v) }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WEEKDAY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Horário</Label>
                  <Input
                    type="time"
                    value={newInlineMeeting.start_time}
                    onChange={(e) =>
                      setNewInlineMeeting((p) => ({
                        ...p,
                        start_time: e.target.value,
                      }))
                    }
                    className="w-28"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Observações</Label>
                  <Input
                    value={newInlineMeeting.notes}
                    onChange={(e) =>
                      setNewInlineMeeting((p) => ({ ...p, notes: e.target.value }))
                    }
                    placeholder="Opcional"
                    className="w-40"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={addInlineMeeting}
                >
                  <Plus className="size-3" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mídias no modo criação */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mídias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inlineMedias.map((m, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="flex-1 text-sm">
                    <strong>{MEDIA_TYPE_LABELS[m.type] ?? m.type}</strong> —{' '}
                    <span className="text-muted-foreground">{m.url}</span>
                    {m.caption ? ` (${m.caption})` : ''}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInlineMedia(index)}
                    aria-label="Remover mídia"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed p-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo</Label>
                  <Select
                    value={newInlineMedia.type}
                    onValueChange={(v) =>
                      setNewInlineMedia((p) => ({ ...p, type: v ?? 'image' }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEDIA_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">URL *</Label>
                  <Input
                    value={newInlineMedia.url}
                    onChange={(e) =>
                      setNewInlineMedia((p) => ({ ...p, url: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Legenda</Label>
                  <Input
                    value={newInlineMedia.caption}
                    onChange={(e) =>
                      setNewInlineMedia((p) => ({ ...p, caption: e.target.value }))
                    }
                    placeholder="Opcional"
                    className="w-40"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ordem</Label>
                  <Input
                    type="number"
                    value={newInlineMedia.display_order}
                    onChange={(e) =>
                      setNewInlineMedia((p) => ({
                        ...p,
                        display_order: Number(e.target.value),
                      }))
                    }
                    className="w-20"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={addInlineMedia}
                >
                  <Plus className="size-3" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : isEditing
              ? 'Salvar alterações'
              : 'Criar GC'}
        </Button>
      </form>

      {/* Encontros no modo edição (CRUD via API) */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Encontros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="flex-1 text-sm">
                  <strong>{WEEKDAY_LABELS[m.weekday]}</strong> —{' '}
                  {m.start_time?.slice(0, 5)}
                  {m.notes ? ` (${m.notes})` : ''}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMeeting(m.id)}
                  aria-label="Remover encontro"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}

            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed p-3">
              <div className="space-y-1">
                <Label className="text-xs">Dia</Label>
                <Select
                  value={String(newMeeting.weekday)}
                  onValueChange={(v) =>
                    setNewMeeting((p) => ({ ...p, weekday: Number(v) }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WEEKDAY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Horário</Label>
                <Input
                  type="time"
                  value={newMeeting.start_time}
                  onChange={(e) =>
                    setNewMeeting((p) => ({ ...p, start_time: e.target.value }))
                  }
                  className="w-28"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Observações</Label>
                <Input
                  value={newMeeting.notes}
                  onChange={(e) =>
                    setNewMeeting((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Opcional"
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={addMeeting}
              >
                <Plus className="size-3" /> Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responsáveis no modo edição (CRUD via API) */}
      {isEditing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Responsáveis</CardTitle>
            {newLeaderDialog}
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedLeaders.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="flex-1 text-sm font-medium">{l.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => unlinkLeader(l.id)}
                  aria-label="Remover responsável"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}

            {availableLeadersForEdit.length > 0 && (
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Vincular responsável</Label>
                  <Select
                    value={selectedLeaderId}
                    onValueChange={(v) => setSelectedLeaderId(v ?? '')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLeadersForEdit.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={linkLeader}
                  disabled={!selectedLeaderId}
                >
                  <Plus className="mr-1 size-3" /> Vincular
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
