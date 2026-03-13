'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ApiResponse, UserResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(100),
  email: z.email(),
  role: z.enum(['admin', 'editor', 'user']),
})

type FormData = z.infer<typeof formSchema>

interface FormProps {
  userId?: string
}

export function UserForm({ userId }: FormProps) {
  const isEditing = !!userId
  const router = useRouter()
  const queryClient = useQueryClient()

  // --- Queries ---
  const { data: userDetail, isLoading: loadingUser } = useQuery({
    queryKey: ['specific-user', userId],
    queryFn: () => api<ApiResponse<UserResponse>>(`/user/${userId}`, { authenticated: true }),
    select: r => r.data,
    enabled: isEditing,
  })

  // --- Form ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // --- Preencher form no modo edição ---
  useEffect(() => {
    if (userDetail) {
      reset({
        name: userDetail.name,
        email: userDetail.email,
        role: userDetail.role,
      })
    }
  }, [userDetail, reset])

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      api<ApiResponse<UserResponse>>('/user', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
        }),
        authenticated: true,
      }),
    onSuccess: res => {
      void queryClient.invalidateQueries({ queryKey: ['all-users'] })
      toast.success('Usuáiro criado com sucesso!')
      if (res.data) {
        router.push(`/admin/user/${res.data.id}/edit`)
      }
    },
    onError: () => toast.error('Erro ao criar o usuário.'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      api(`/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        authenticated: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['all-users'] })
      void queryClient.invalidateQueries({ queryKey: ['specific-user', userId] })
      toast.success('Usuário atualizado com sucesso!')
    },
    onError: () => toast.error('Erro ao atualizar o usuário.'),
  })

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  // --- Loading ---
  if (isEditing && loadingUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <Button type="button" variant="ghost" size="icon" aria-label="Voltar">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{isEditing ? 'Editar usuário' : 'Novo usuário'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Email</Label>
              <Input id="email" {...register('email')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar usuário'}
        </Button>
      </form>
    </div>
  )
}
