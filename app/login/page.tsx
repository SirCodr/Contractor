'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { FileText, Shield, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Emerald glow */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[80px]" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-primary/5 blur-[60px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Arrendo</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight">
            Tus contratos de
            <br />
            arrendamiento,{' '}
            <span className="text-primary">sin complicaciones.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
            Crea, modifica y gestiona contratos legales desde un builder asistido.
            Todo guardado en tu Google Drive.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3 pt-2">
            {[
              { icon: Zap, text: 'Generación automática desde plantillas' },
              { icon: Shield, text: 'Cláusulas legales actualizadas' },
              { icon: FileText, text: 'Historial en Google Drive' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3 h-3 text-primary" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-muted-foreground/50">
          Pensado para arrendadores colombianos
        </div>
      </div>

      {/* Right panel — sign in */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Arrendo</span>
          </div>

          {/* Card */}
          <div className="rounded-xl border border-border bg-card p-8 space-y-6 shadow-2xl shadow-black/20">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Bienvenido</h2>
              <p className="text-sm text-muted-foreground">
                Inicia sesión con tu cuenta de Google para continuar
              </p>
            </div>

            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full h-11 gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm font-medium transition-all duration-150"
              variant="outline"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
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
              )}
              {loading ? 'Iniciando sesión…' : 'Continuar con Google'}
            </Button>

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Al iniciar sesión autorizas a Arrendo a acceder a los archivos
              que la app cree en tu Google Drive.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
