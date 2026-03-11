'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Images, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { GcMediaResponse } from '@/types'

interface GcMediaGalleryProps {
  medias: GcMediaResponse[]
}

export function GcMediaGallery({ medias }: GcMediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Ordena por display_order
  const sorted = [...medias].sort((a, b) => a.display_order - b.display_order)
  const images = sorted.filter((m) => m.type === 'image')

  if (images.length === 0) return null

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <Images className="size-5 text-primary" />
            Fotos
          </h2>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((media) => (
              <button
                key={media.id}
                type="button"
                onClick={() => setSelectedImage(media.url)}
                className="group relative aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={media.url}
                  alt={media.caption ?? 'Foto do GC'}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar foto"
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="size-6" />
          </button>
          <div className="relative max-h-[85vh] max-w-4xl">
            <Image
              src={selectedImage}
              alt="Foto ampliada"
              width={1200}
              height={800}
              className="max-h-[85vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
