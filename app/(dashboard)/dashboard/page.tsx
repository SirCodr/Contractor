'use client'

import { FileText, Building2, TrendingUp, Clock, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { format, isThisMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  isLoading,
}: {
  label: string
  value: React.ReactNode
  icon: React.ElementType
  accent?: boolean
  isLoading?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 space-y-3 ${
        accent ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
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
      {isLoading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-primary' : ''}`}>
          {value}
        </p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { data: contracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const res = await fetch('/api/contracts')
      if (!res.ok) throw new Error('Error fetching contracts')
      return res.json() as Promise<any[]>
    },
  })



  // Compute stats
  const activeContracts = contracts?.length ?? 0
  const totalProperties = contracts
    ? new Set(
        contracts
          .map((c) => c.properties?.property_address || c.propertyFolderName)
          .filter(Boolean)
      ).size
    : 0

  const totalRent = contracts?.reduce((acc, c) => {
    return acc + Number(c.properties?.monthly_rent || 0)
  }, 0) ?? 0

  const expiringThisMonth = contracts?.filter((c) => {
    const end = c.properties?.end_date
    if (!end) return false
    return isThisMonth(parseISO(end))
  }).length ?? 0

  const recentContracts = contracts?.slice(0, 5) ?? []

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inicio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona tus contratos de arrendamiento
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="gap-2 bg-linear-to-r from-primary to-primary/80">
            <FileText className="w-4 h-4" />
            Nuevo contrato
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Contratos activos" 
          value={activeContracts} 
          icon={FileText} 
          accent 
          isLoading={isLoadingContracts} 
        />
        <StatCard 
          label="Inmuebles" 
          value={totalProperties} 
          icon={Building2} 
          isLoading={isLoadingContracts} 
        />
        <StatCard 
          label="Vencen este mes" 
          value={expiringThisMonth} 
          icon={Clock} 
          isLoading={isLoadingContracts} 
        />
        <StatCard 
          label="Canon total / mes" 
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRent)} 
          icon={TrendingUp} 
          isLoading={isLoadingContracts} 
        />
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
          
          {isLoadingContracts ? (
             <div className="p-5 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
          ) : recentContracts.length === 0 ? (
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
          ) : (
            <div className="divide-y divide-border">
              {recentContracts.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{c.properties?.tenant_name || 'Desconocido'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                         <Calendar className="w-3 h-3" />
                         {format(new Date(c.createdTime), "dd MMM, yyyy", { locale: es })}
                         <span className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1" />
                         <span className="truncate max-w-[150px]">{c.properties?.property_address || c.propertyFolderName || 'Sin dirección'}</span>
                      </div>
                    </div>
                  </div>
                  <a 
                    href={c.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: 'ghost', size: 'icon' }) + " opacity-0 group-hover:opacity-100 transition-opacity"}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
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

