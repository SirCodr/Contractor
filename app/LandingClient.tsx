'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { FileText, Shield, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function LandingClient() {
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Contractor</span>
        </div>
        <Button
          onClick={handleSignIn}
          disabled={loading}
          variant="outline"
          className="gap-2 bg-white text-gray-800 border-gray-200 hover:bg-gray-50 rounded-full px-5 transition-all shadow-sm font-medium"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <button className="flex items-center gap-2 text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Acceder
            </button>
          )}
        </Button>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 sm:py-32 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-8">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-[1.1]">
            Tus contratos de arrendamiento, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-primary to-primary/60">
              sin complicaciones.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Genera, centraliza y gestiona contratos legalmente actualizados según la ley 820 de 2003
            desde un form inteligente automatizado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleSignIn}
              disabled={loading}
              className="h-14 px-8 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105"
            >
              {loading ? 'Iniciando sesión...' : 'Empezar ahora totalmente gratis'}
            </Button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid sm:grid-cols-3 gap-8 mt-24 max-w-5xl w-full text-left relative z-10">
          <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-3 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Historial en Google Drive</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Todos tus documentos y preferencias de inquilinos se sincronizan nativamente y sin
              límites en tu propio Google Drive.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-3 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Legalmente Blindado</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cláusulas inteligentes redactadas y aprobadas por abogados expertos en derecho civil e
              inmobiliario colombiano.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-3 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Rapidez Inédita</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generación de PDFs robustos y docs editables en menos de 2 minutos rellenando nuestro
              Wizard estructurado.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 border-t border-border/40 text-center bg-muted/20">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-sm text-muted-foreground/80 font-medium flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500/80" />
            Al iniciar sesión autorizas a Contractor a acceder de manera exclusiva a los archivos
            que la app cree en tu Google Drive.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Pensado y diseñado para arrendadores colombianos
          </p>
        </div>
      </footer>
    </div>
  )
}
