import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface GcInterestCtaProps {
  gcId: string
  gcName: string
}

export function GcInterestCta({ gcId, gcName }: GcInterestCtaProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5 text-center sm:p-8">
        <Heart className="mx-auto mb-3 size-8 text-primary" />
        <h2 className="mb-2 font-display text-xl font-bold">
          Quer participar deste GC?
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Registre seu interesse e entraremos em contato com você.
        </p>
        <Link href={`/interesse?gc=${gcId}&nome=${encodeURIComponent(gcName)}`}>
          <Button className="bg-warm px-8 font-semibold text-warm-foreground hover:bg-warm/90">
            Quero participar
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
