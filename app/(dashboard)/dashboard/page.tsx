import type { Metadata } from 'next'
import { FileText, Building2, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Inicio',
}

// In a real implementation these would be fetched from Drive API
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 space-y-3 ${
        accent
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            accent ? 'bg-primary/15' : 'bg-muted'
          }`}
        >
          <Icon className={`w-4 h-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inicio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona tus contratos de arrendamiento
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="gap-2">
            <FileText className="w-4 h-4" />
            Nuevo contrato
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Contratos activos" value={0} icon={FileText} accent />
        <StatCard label="Inmuebles" value={0} icon={Building2} />
        <StatCard label="Vencen este mes" value={0} icon={Clock} />
        <StatCard label="Canon total / mes" value="$0" icon={TrendingUp} />
      </div>

      {/* Quick actions + recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent contracts */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Contratos recientes</h2>
            <Link href="/contracts" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sin contratos aún</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Crea tu primer contrato usando una plantilla
            </p>
            <Link href="/contracts/new">
              <Button size="sm" variant="outline">
                Crear contrato
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold px-1">Accesos rápidos</h2>
          {[
            { href: '/contracts/new', icon: FileText, label: 'Nuevo contrato', desc: 'Desde una plantilla' },
            { href: '/properties', icon: Building2, label: 'Mis inmuebles', desc: 'Ver y gestionar' },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 group"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
