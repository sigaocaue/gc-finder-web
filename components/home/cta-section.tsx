import { Heart } from 'lucide-react'
import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <Heart className="mx-auto mb-4 size-8 text-primary-foreground" />
        <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
          Quer participar de um GC?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
          Preencha o formulário de interesse e entraremos em contato com você.
        </p>
        <Link
          href="/interesse"
          className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-warm px-4 text-sm font-medium text-warm-foreground transition-colors hover:bg-warm/90"
        >
          Quero participar
        </Link>
      </div>
    </section>
  )
}
