import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'

import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Arrendo — Contratos de Arrendamiento',
    template: '%s | Arrendo',
  },
  description:
    'Crea, gestiona y firma contratos de arrendamiento de forma rápida y profesional, directamente en tu Google Drive.',
  keywords: ['contratos', 'arrendamiento', 'arriendo', 'Colombia', 'inmuebles'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'oklch(0.215 0.009 240)',
              border: '1px solid oklch(1 0 0 / 8%)',
              color: 'oklch(0.935 0.005 220)',
            },
          }}
        />
      </body>
    </html>
  )
}
