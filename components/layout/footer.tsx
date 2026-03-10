import Link from 'next/link'
import React from 'react'
import { Heart, Lock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <p className="text-muted-foreground flex items-center justify-center gap-1.5">
          Desenvolvido com <Heart className="h-3.5 w-3.5 text-red-900" /> por{' '}
          <a
            href="https://caue-prado.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary"
          >
            Cauê Prado
          </a>
          para a comunidade da{' '}
          <a
            href="https://lagoinhajundiai.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            Lagoinha Jundiaí
          </a>
        </p>
        {/* Admin link — discreto, fonte mono */}
        <Link
          href="/admin/login"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:text-foreground"
        >
          <Lock size={12} />
          Área restrita
        </Link>
      </div>
    </footer>
  )
}
