'use client'

import { use } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { GcForm } from '@/components/admin/gc-form'

interface AdminGcEditPageProps {
  params: Promise<{ id: string }>
}

export default function AdminGcEditPage({ params }: AdminGcEditPageProps) {
  const { id } = use(params)

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-4 pt-18 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-3xl">
          <GcForm gcId={id} />
        </div>
      </main>
    </div>
  )
}
