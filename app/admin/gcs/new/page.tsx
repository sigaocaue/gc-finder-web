'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { GcForm } from '@/components/admin/gc-form'

export default function AdminGcNewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-4 pt-18 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-3xl">
          <GcForm />
        </div>
      </main>
    </div>
  )
}
