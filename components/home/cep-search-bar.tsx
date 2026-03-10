'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CepSearchBarProps {
  onSearch: (cep: string) => void
  isLoading: boolean
}

export function CepSearchBar({ onSearch, isLoading }: CepSearchBarProps) {
  const [cep, setCep] = useState('')

  return (
    <form
      className="mx-auto mt-8 flex max-w-md items-center gap-2"
      onSubmit={e => {
        e.preventDefault()
        onSearch(cep)
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Digite seu CEP..."
          maxLength={9}
          value={cep}
          onChange={e => setCep(e.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50"
          aria-label="CEP para busca"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={isLoading}
        className="h-11 bg-warm text-warm-foreground hover:bg-warm/90"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Buscar'}
      </Button>
    </form>
  )
}
