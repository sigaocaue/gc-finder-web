'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { ApiResponse, UserResponse } from '@/types'
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

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [toggleTarget, setToggleTarget] = useState<UserResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null)
  const queryClient = useQueryClient()

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => api<ApiResponse<UserResponse[]>>('/users', { authenticated: true }),
  })

  const users = usersResponse?.data ?? []

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !is_active }),
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-users'] })
      toast.success('Status atualizado.')
      setToggleTarget(null)
    },
    onError: () => {
      toast.error('Erro ao atualizar o status do Líder.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/users/${id}`, {
        method: 'DELETE',
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-users'] })
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
        <div className="mx-auto">
          <AdminToolbar
            title="Usuários do sistema GC Finder"
            countLabel="usuários cadastrados"
            count={users.length}
            createLabel="Novo usuário"
            createHref="/admin/users/new"
            searchPlaceholder="Buscar pelo nome do usuário..."
            searchAriaLabel="Buscar usuários"
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
                      <TableHead>Email</TableHead>
                      <TableHead>Papel dentro do sistema</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <p>{user.name}</p>
                        </TableCell>
                        <TableCell>
                          <p>{user.email}</p>
                        </TableCell>
                        <TableCell>
                          <p>{user.role}</p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToggleTarget(user)}
                            aria-label={user.is_active ? 'Desativar usuário' : 'Ativar Líder'}
                          >
                            {user.is_active ? (
                              <ToggleRight className="size-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/users/${user.id}/edit`}>
                              <Button variant="ghost" size="icon" aria-label="Editar usuário">
                                <Pencil className="size-4" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(user)}
                              aria-label="Excluir usuário"
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
                {users.map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p>{user.name}</p>
                          <p>
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/admin/users/${user.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Pencil className="mr-1 size-3" /> Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setToggleTarget(user)}
                          className="w-full"
                        >
                          {user.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-red-400 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(user)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {users.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
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
              {toggleTarget?.is_active ? 'Desativar' : 'Ativar'} Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {toggleTarget?.is_active ? 'desativar' : 'ativar'} o usuário &quot;
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
            <AlertDialogTitle>Excluir o usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o usuário &quot;{deleteTarget?.name}&quot;? Esta ação é irreversível.
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
