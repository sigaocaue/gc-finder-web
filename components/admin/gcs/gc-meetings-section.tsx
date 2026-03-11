'use client'

import { useState } from 'react'
import { WEEKDAY_LABELS } from '@/types'
import type { GcMeetingResponse, GcMeetingInlineCreate } from '@/types'
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
import { Trash2, Plus } from 'lucide-react'

interface MeetingFormState {
  weekday: number
  start_time: string
  notes: string
}

const INITIAL_MEETING: MeetingFormState = {
  weekday: 0,
  start_time: '19:30',
  notes: '',
}

// Seção de encontros no modo edição (CRUD via API)
interface GcMeetingsEditProps {
  mode: 'edit'
  meetings: GcMeetingResponse[]
  onAdd: (meeting: { weekday: number; start_time: string; notes?: string }) => void
  onRemove: (meetingId: string) => void
}

// Seção de encontros no modo criação (estado local)
interface GcMeetingsCreateProps {
  mode: 'create'
  meetings: GcMeetingInlineCreate[]
  onAdd: (meeting: GcMeetingInlineCreate) => void
  onRemove: (index: number) => void
}

type GcMeetingsSectionProps = GcMeetingsEditProps | GcMeetingsCreateProps

export function GcMeetingsSection(props: GcMeetingsSectionProps) {
  const [newMeeting, setNewMeeting] = useState<MeetingFormState>(INITIAL_MEETING)

  const handleAdd = () => {
    if (props.mode === 'edit') {
      props.onAdd({
        weekday: newMeeting.weekday,
        start_time: newMeeting.start_time,
        notes: newMeeting.notes || undefined,
      })
    } else {
      props.onAdd({
        weekday: newMeeting.weekday,
        start_time: newMeeting.start_time,
        notes: newMeeting.notes || undefined,
      })
    }
    setNewMeeting(INITIAL_MEETING)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Encontros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de encontros existentes */}
        {props.mode === 'edit'
          ? props.meetings.map((m) => (
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
                  onClick={() => props.onRemove(m.id)}
                  aria-label="Remover encontro"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))
          : props.meetings.map((m, index) => (
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
                  onClick={() => props.onRemove(index)}
                  aria-label="Remover encontro"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}

        {/* Formulário para adicionar novo encontro */}
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed p-3">
          <div className="space-y-1">
            <Label className="text-xs">Dia</Label>
            <Select
              value={String(newMeeting.weekday)}
              onValueChange={(v) =>
                setNewMeeting((p) => ({ ...p, weekday: Number(v) }))
              }
              items={WEEKDAY_LABELS}
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
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleAdd}
          >
            <Plus className="size-3" /> Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
