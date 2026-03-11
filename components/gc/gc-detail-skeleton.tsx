import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function GcDetailSkeleton() {
  return (
    <>
      {/* Skeleton do header */}
      <section className="bg-primary/5 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-8 w-20" />
          <Skeleton className="mb-3 h-6 w-40" />
          <Skeleton className="mb-4 h-10 w-72" />
          <Skeleton className="mb-6 h-5 w-96 max-w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-44" />
          </div>
        </div>
      </section>

      {/* Skeleton dos cards */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <Skeleton className="mb-4 h-6 w-48" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <Skeleton className="mb-4 h-6 w-32" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <Skeleton className="mb-4 h-6 w-36" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <Skeleton className="mb-4 h-6 w-24" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="aspect-square rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
