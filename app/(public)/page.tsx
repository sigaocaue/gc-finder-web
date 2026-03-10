"use client";

import { MapPin, Search, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Encontre um Grupo de Crescimento
            <span className="block text-primary">perto de você</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Descubra o GC mais próximo da sua casa e faça parte de uma
            comunidade que cresce junta.
          </p>

          {/* Busca por CEP */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Digite seu CEP..."
                maxLength={9}
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50"
                aria-label="CEP para busca"
              />
            </div>
            <Button size="lg" className="h-11 bg-warm text-warm-foreground hover:bg-warm/90">
              Buscar
            </Button>
          </div>
        </div>
      </section>

      {/* Mapa (placeholder) */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[400px] items-center justify-center rounded-xl border border-border bg-muted/50 sm:h-[500px]">
            <div className="text-center text-muted-foreground">
              <MapPin className="mx-auto mb-2 size-10" />
              <p className="text-sm">
                O mapa será exibido aqui com os pins dos GCs
              </p>
              <p className="mt-1 text-xs">
                Configure a variável NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
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

      {/* CTA */}
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
    </>
  );
}

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
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
  );
}
