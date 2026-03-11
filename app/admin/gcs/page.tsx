'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { ApiResponse, GcResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Pencil, ToggleLeft, ToggleRight, MapPin, Trash2 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminToolbar } from '@/components/admin/admin-toolbar'

export default function AdminGcsPage() {
  const [search, setSearch] = useState('')
  const [toggleTarget, setToggleTarget] = useState<GcResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GcResponse | null>(null)
  const queryClient = useQueryClient()

  const { data: gcsResponse, isLoading } = useQuery({
    queryKey: ['all-gcs'],
    queryFn: () => api<ApiResponse<GcResponse[]>>('/gcs', { authenticated: true }),
  })

  const gcs: GcResponse[] = gcsResponse?.data ?? []

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api(`/gcs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !is_active }),
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-gcs'] })
      toast.success('Status atualizado.')
      setToggleTarget(null)
    },
    onError: (e) => {
      toast.error('Erro ao atualizar status.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/gcs/${id}`, {
        method: 'DELETE',
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-gcs'] })
      toast.success('GC excluído.')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Erro ao excluir GC.')
    },
  })

  const normalizedSearch = search.trim().toLowerCase()

  const filtered = gcs.filter(gc => {
    if (!normalizedSearch) {
      return true
    }

    return (
      gc.name?.toLowerCase().includes(normalizedSearch) ||
      gc.city?.toLowerCase().includes(normalizedSearch) ||
      gc.state?.toLowerCase().includes(normalizedSearch) ||
      gc.zip_code.toLowerCase().includes(normalizedSearch) ||
      gc.description?.toLowerCase().includes(normalizedSearch) ||
      gc.neighborhood?.toLowerCase().includes(normalizedSearch) ||
      gc.street?.toLowerCase().includes(normalizedSearch)
    )
  })

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-4 pt-18 lg:p-8 lg:pt-8">
        <div className="mx-auto">
          <AdminToolbar
            title="Grupos de Crescimento"
            countLabel="grupos cadastrados"
            count={gcs.length}
            createLabel="Novo GC"
            createHref="/admin/gcs/new"
            searchPlaceholder="Buscar por nome ou cidade..."
            searchAriaLabel="Buscar GCs"
            search={search}
            setSearch={setSearch}
          />

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Tabela desktop */}
              <div className="hidden overflow-hidden rounded-xl border md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(gc => (
                      <TableRow key={gc.id}>
                        <TableCell className="font-medium">
                          <p>{gc.name}</p>
                          <p className="text-xs text-muted-foreground">{formatGcAddress(gc)}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatGcLocation(gc)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatGcDescription(gc)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToggleTarget(gc)}
                            aria-label={gc.is_active ? 'Desativar GC' : 'Ativar GC'}
                            className="cursor-pointer"
                          >
                            {gc.is_active ? (
                              <ToggleRight className="size-6 text-green-600" />
                            ) : (
                              <ToggleLeft className="size-6 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/gcs/${gc.id}/edit`}>
                              <Button variant="ghost" size="icon" aria-label="Editar GC" className="cursor-pointer">
                                <Pencil className="size-4" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(gc)}
                              aria-label="Excluir GC"
                              className="cursor-pointer"
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cards mobile */}
              <div className="space-y-3 md:hidden">
                {filtered.map(gc => (
                  <Card key={gc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{gc.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" /> {formatGcLocation(gc)}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatGcAddress(gc)}</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {formatGcDescription(gc)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/admin/gcs/${gc.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Pencil className="mr-1 size-3" /> Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setToggleTarget(gc)}
                          className="w-full"
                        >
                          {gc.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-red-400 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(gc)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">Nenhum GC encontrado.</div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal de confirmação */}
      <AlertDialog open={!!toggleTarget} onOpenChange={() => setToggleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.is_active ? 'Desativar' : 'Ativar'} GC
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {toggleTarget?.is_active ? 'desativar' : 'ativar'} o GC &quot;
              {toggleTarget?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toggleTarget) {
                  toggleMutation.mutate({
                    id: toggleTarget.id,
                    is_active: toggleTarget.is_active,
                  })
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir GC</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o GC &quot;{deleteTarget?.name}&quot;? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function formatGcDescription(gc: GcResponse, maxLength = 110): string {
  const description = gc.description?.trim()

  if (!description) {
    return 'Sem descrição'
  }

  if (description.length > maxLength) {
    return `${description.slice(0, maxLength).trim()}…`
  }

  return description
}

function formatGcAddress(gc: GcResponse): string {
  const addressParts: string[] = []

  if (gc.street) {
    addressParts.push(`${gc.street}${gc.number ? `, ${gc.number}` : ''}`.trim())
  }

  if (gc.neighborhood) {
    addressParts.push(gc.neighborhood)
  }

  if (addressParts.length === 0) {
    return 'Endereço não informado'
  }

  return addressParts.join(' • ')
}

function formatGcLocation(gc: GcResponse): string {
  const locationParts: string[] = []
  const cityState = [gc.city, gc.state].filter(Boolean).join(' / ')

  if (cityState) {
    locationParts.push(cityState)
  }

  if (gc.zip_code) {
    locationParts.push(`CEP ${gc.zip_code}`)
  }

  if (locationParts.length === 0) {
    return 'Localização incompleta'
  }

  return locationParts.join(' • ')
}
