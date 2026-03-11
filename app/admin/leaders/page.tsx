'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { ApiResponse, LeaderResponse } from '@/types'
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
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminToolbar } from '@/components/admin/admin-toolbar'

export default function AdminLeadersPage() {
  const [search, setSearch] = useState('')
  const [toggleTarget, setToggleTarget] = useState<LeaderResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LeaderResponse | null>(null)
  const queryClient = useQueryClient()

  const { data: leadersResponse, isLoading } = useQuery({
    queryKey: ['all-leaders'],
    queryFn: () => api<ApiResponse<LeaderResponse[]>>('/leaders', { authenticated: true }),
  })

  const leaders = leadersResponse?.data ?? []

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api(`/leaders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !is_active }),
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-leaders'] })
      toast.success('Status atualizado.')
      setToggleTarget(null)
    },
    onError: () => {
      toast.error('Erro ao atualizar o status do Líder.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/leaders/${id}`, {
        method: 'DELETE',
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-leaders'] })
      toast.success('Líder excluído.')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Erro ao excluir Líder.')
    },
  })

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-4 pt-18 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-5xl">
          <AdminToolbar
            title="Líderes de GC"
            countLabel="líderes cadastrados"
            count={leaders.length}
            createLabel="Novo líder"
            createHref="/admin/leaders/new"
            searchPlaceholder="Buscar por nome do líder..."
            searchAriaLabel="Buscar líderes"
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
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders.map(leader => (
                      <TableRow key={leader.id}>
                        <TableCell className="font-medium">
                          <p>{leader.name}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <p>{JSON.stringify(leader.contacts)}</p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToggleTarget(leader)}
                            aria-label={leader.is_active ? 'Desativar Líder' : 'Ativar Líder'}
                          >
                            {leader.is_active ? (
                              <ToggleRight className="size-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/gcs/${leader.id}`}>
                              <Button variant="ghost" size="icon" aria-label="Editar Líder">
                                <Pencil className="size-4" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(leader)}
                              aria-label="Excluir Líder"
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
                {leaders.map(leader => (
                  <Card key={leader.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{leader.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {JSON.stringify(leader.contacts)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/admin/gcs/${leader.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Pencil className="mr-1 size-3" /> Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setToggleTarget(leader)}
                          className="w-full"
                        >
                          {leader.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-red-400 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(leader)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {leaders.length === 0 && (
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
