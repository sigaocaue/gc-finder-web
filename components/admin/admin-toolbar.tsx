import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

interface AdminToolbarProps {
  // Textos do cabeçalho
  title: string
  countLabel: string
  count: number
  // Botão de criação
  createLabel: string
  createHref: string
  // Campo de busca
  searchPlaceholder: string
  searchAriaLabel: string
  // Estado da busca
  search: string
  setSearch: (value: string) => void
}

export function AdminToolbar({
  title,
  countLabel,
  count,
  createLabel,
  createHref,
  searchPlaceholder,
  searchAriaLabel,
  search,
  setSearch,
}: AdminToolbarProps) {
  return (
    <>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-md text-muted-foreground">
            {count} {countLabel}
          </p>
        </div>
        <Link href={createHref}>
          <Button className="bg-primary hover:bg-primary/90 cursor-pointer">
            <Plus className="mr-2 size-8" /> {createLabel}
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
          aria-label={searchAriaLabel}
        />
      </div>
    </>
  )
}
