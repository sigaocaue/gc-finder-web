'use client'

import { useState } from 'react'
import type { LeaderResponse, LeaderBrief } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Trash2, Plus, UserPlus } from 'lucide-react'

interface NewLeaderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; phone: string }) => void
  isPending: boolean
}

function NewLeaderDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: NewLeaderDialogProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = () => {
    onSubmit({ name, phone })
    setName('')
    setPhone('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="secondary" size="sm" className="gap-1" />
        }
      >
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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-leader-phone">WhatsApp</Label>
            <Input
              id="new-leader-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11999999999"
            />
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isPending}
            className="w-full"
          >
            {isPending ? 'Criando...' : 'Criar líder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Seção de responsáveis no modo edição (CRUD via API)
interface GcLeadersEditProps {
  mode: 'edit'
  linkedLeaders: LeaderBrief[]
  availableLeaders: LeaderResponse[]
  onLink: (leaderId: string) => void
  onUnlink: (leaderId: string) => void
  onCreateLeader: (data: { name: string; phone: string }) => void
  isCreatingLeader: boolean
  newLeaderDialogOpen: boolean
  onNewLeaderDialogChange: (open: boolean) => void
}

// Seção de responsáveis no modo criação (estado local)
interface GcLeadersCreateProps {
  mode: 'create'
  selectedLeaderIds: string[]
  availableLeaders: LeaderResponse[]
  allLeaders: LeaderResponse[]
  onAdd: (leaderId: string) => void
  onRemove: (leaderId: string) => void
  onCreateLeader: (data: { name: string; phone: string }) => void
  isCreatingLeader: boolean
  newLeaderDialogOpen: boolean
  onNewLeaderDialogChange: (open: boolean) => void
}

type GcLeadersSectionProps = GcLeadersEditProps | GcLeadersCreateProps

export function GcLeadersSection(props: GcLeadersSectionProps) {
  const [selectedLeaderId, setSelectedLeaderId] = useState('')

  const handleAdd = () => {
    if (!selectedLeaderId) {
     return
    }

    if (props.mode === 'edit') {
      props.onLink(selectedLeaderId)
    } else {
      props.onAdd(selectedLeaderId)
    }
    setSelectedLeaderId('')
  }

  const getLeaderName = (leaderId: string): string => {
    if (props.mode === 'create') {
      return props.allLeaders.find((l) => l.id === leaderId)?.name ?? leaderId
    }
    return leaderId
  }

  // Filtra líderes já vinculados/selecionados para não aparecerem no select
  const linkedIds = new Set(
    props.mode === 'edit'
      ? props.linkedLeaders.map((l) => l.id)
      : props.selectedLeaderIds
  )
  const unlinkedLeaders = props.availableLeaders.filter(
    (l) => !linkedIds.has(l.id)
  )

  const leaderItemsMap = Object.fromEntries(
    unlinkedLeaders.map((l) => {
      const leaderPhone = l?.contacts?.find(
        (c) =>
          c?.type?.toLowerCase() === 'phone' ||
          c?.type?.toLowerCase() === 'whatsapp'
      )
      const label = `${l?.display_name || l.name}${leaderPhone ? ` - ${leaderPhone.value}` : ''}`
      return [l.id, label]
    })
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Responsáveis / Líderes de GC</CardTitle>
        <NewLeaderDialog
          open={props.newLeaderDialogOpen}
          onOpenChange={props.onNewLeaderDialogChange}
          onSubmit={props.onCreateLeader}
          isPending={props.isCreatingLeader}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de responsáveis vinculados */}
        {props.mode === 'edit'
          ? props.linkedLeaders.map(l => (
              <div key={l.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="flex-1 text-sm font-medium">{l.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => props.onUnlink(l.id)}
                  aria-label="Remover responsável"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))
          : props.selectedLeaderIds.map(leaderId => (
              <div key={leaderId} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="flex-1 text-sm font-medium">{getLeaderName(leaderId)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => props.onRemove(leaderId)}
                  aria-label="Remover responsável"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}

        {/* Select para adicionar responsável */}
        {unlinkedLeaders.length > 0 && (
          <div className="flex items-center gap-3">
            <Select
              value={selectedLeaderId}
              onValueChange={v => setSelectedLeaderId(v ?? '')}
              items={leaderItemsMap}
            >
              <SelectTrigger className="w-full flex-1">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {unlinkedLeaders.map((l: LeaderResponse) => {
                  const leaderPhone = l?.contacts?.find(
                    (c) =>
                      c?.type?.toLowerCase() === 'phone' ||
                      c?.type?.toLowerCase() === 'whatsapp'
                  )
                  const label = `${l?.display_name || l.name}${leaderPhone ? ` - ${leaderPhone.value}` : ''}`
                  return (
                    <SelectItem key={l.id} value={l.id}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="h-8 shrink-0 px-3.5"
              onClick={handleAdd}
              disabled={!selectedLeaderId}
            >
              <Plus className="mr-1 size-3" /> {props.mode === 'edit' ? 'Vincular' : 'Adicionar'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
