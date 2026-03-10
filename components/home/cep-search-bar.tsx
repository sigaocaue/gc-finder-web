'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CepSearchBarProps {
  onSearch: (cep: string) => void
  isLoading: boolean
}

// Formata CEP com máscara 00000-000
function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) {
    return digits.slice(0, 5) + '-' + digits.slice(5)
  }
  return digits
}

export function CepSearchBar({ onSearch, isLoading }: CepSearchBarProps) {
  const [cep, setCep] = useState('')

  const cleanCep = cep.replace(/\D/g, '')
  const isValid = cleanCep.length === 8

  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={e => {
        e.preventDefault()
        if (isValid) onSearch(cleanCep)
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          inputMode="numeric"
          placeholder="Digite seu CEP..."
          value={cep}
          onChange={e => setCep(formatCep(e.target.value))}
          className="h-12 rounded-xl bg-background pl-10 text-base"
          aria-label="CEP"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
        />
      </div>
      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="h-12 rounded-xl bg-warm px-6 font-semibold text-warm-foreground hover:bg-warm/90"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Buscar'}
      </Button>
    </form>
  )
}
