import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gcfinder.com.br'
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
        url: '/favicon.svg',
        width: 512,
        height: 512,
        alt: 'GC Finder Logo',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title,
    description,
    images: ['/favicon.svg'],
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
