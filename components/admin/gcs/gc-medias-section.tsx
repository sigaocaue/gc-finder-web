'use client'

import { useState } from 'react'
import type { GcMediaInlineCreate } from '@/types'
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
import { toast } from 'sonner'

const MEDIA_TYPE_LABELS: Record<string, string> = {
  image: 'Imagem',
  instagram_post: 'Post Instagram',
  video: 'Vídeo',
}

interface MediaFormState {
  type: string
  url: string
  caption: string
  display_order: number
}

const INITIAL_MEDIA: MediaFormState = {
  type: 'image',
  url: '',
  caption: '',
  display_order: 0,
}

interface GcMediasSectionProps {
  medias: GcMediaInlineCreate[]
  onAdd: (media: GcMediaInlineCreate) => void
  onRemove: (index: number) => void
}

export function GcMediasSection({ medias, onAdd, onRemove }: GcMediasSectionProps) {
  const [newMedia, setNewMedia] = useState<MediaFormState>(INITIAL_MEDIA)

  const handleAdd = () => {
    if (!newMedia.url.trim()) {
      toast.error('URL da mídia é obrigatória.')
      return
    }
    onAdd({
      type: newMedia.type,
      url: newMedia.url,
      caption: newMedia.caption || undefined,
      display_order: newMedia.display_order,
    })
    setNewMedia(INITIAL_MEDIA)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mídias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {medias.map((m, index) => (
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
              onClick={() => onRemove(index)}
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
              value={newMedia.type}
              onValueChange={(v) =>
                setNewMedia((p) => ({ ...p, type: v ?? 'image' }))
              }
              items={MEDIA_TYPE_LABELS}
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
              value={newMedia.url}
              onChange={(e) =>
                setNewMedia((p) => ({ ...p, url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Legenda</Label>
            <Input
              value={newMedia.caption}
              onChange={(e) =>
                setNewMedia((p) => ({ ...p, caption: e.target.value }))
              }
              placeholder="Opcional"
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ordem</Label>
            <Input
              type="number"
              value={newMedia.display_order}
              onChange={(e) =>
                setNewMedia((p) => ({
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
            onClick={handleAdd}
          >
            <Plus className="size-3" /> Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
