import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gc-finder.caue-prado.dev'
const title = 'GC Finder — Encontre um Grupo de Crescimento'
const description =
  'Encontre o Grupo de Crescimento (GC) mais próximo da sua casa. Igreja Batista da Lagoinha de Jundiaí.'

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  keywords: [
    'grupo de crescimento',
    'GC',
    'igreja',
    'lagoinha',
    'jundiaí',
    'célula',
    'comunidade',
    'encontrar GC',
  ],
  authors: [{ name: 'Igreja Batista da Lagoinha de Jundiaí' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    title,
    description,
    siteName: 'GC Finder',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GC Finder — Encontre um Grupo de Crescimento',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, '/favicon.ico'],
    apple: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
