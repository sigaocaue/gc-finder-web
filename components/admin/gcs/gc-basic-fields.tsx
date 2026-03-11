'use client'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GcFormFields {
  name: string
  description?: string
  zip_code: string
  street: string
  number?: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

interface GcBasicFieldsProps {
  register: UseFormRegister<GcFormFields>
  errors: FieldErrors<GcFormFields>
}

export function GcBasicFields({ register, errors }: GcBasicFieldsProps) {
  return (
    <>
      {/* Dados básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do GC *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP *</Label>
              <Input
                id="zip_code"
                {...register('zip_code')}
                placeholder="00000-000"
              />
              {errors.zip_code && (
                <p className="text-xs text-destructive">
                  {errors.zip_code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register('number')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input id="street" {...register('street')} />
            {errors.street && (
              <p className="text-xs text-destructive">{errors.street.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" {...register('complement')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input id="neighborhood" {...register('neighborhood')} />
              {errors.neighborhood && (
                <p className="text-xs text-destructive">
                  {errors.neighborhood.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" {...register('city')} />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                {...register('state')}
                maxLength={2}
                placeholder="SP"
              />
              {errors.state && (
                <p className="text-xs text-destructive">{errors.state.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
