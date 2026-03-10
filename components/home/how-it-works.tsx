import { Search, MapPin, Users } from 'lucide-react'

interface StepCardProps {
  icon: React.ReactNode
  step: string
  title: string
  description: string
}

function StepCard({ icon, step, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Passo {step}
      </span>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
          Como funciona
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <StepCard
            icon={<Search className="size-6" />}
            step="1"
            title="Busque pelo CEP"
            description="Digite seu CEP e encontre o Grupo de Crescimento mais perto de você."
          />
          <StepCard
            icon={<MapPin className="size-6" />}
            step="2"
            title="Veja no mapa"
            description="Visualize todos os GCs no mapa e escolha o que melhor se encaixa na sua rotina."
          />
          <StepCard
            icon={<Users className="size-6" />}
            step="3"
            title="Participe"
            description="Registre seu interesse e a equipe entrará em contato para te receber."
          />
        </div>
      </div>
    </section>
  )
}
