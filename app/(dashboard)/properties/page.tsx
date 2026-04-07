'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2, Plus, MapPin, Calendar, Clock, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function PropertiesPage() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties')
      if (!res.ok) throw new Error('Failed to fetch properties')
      return res.json() as Promise<any[]>
    },
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inmuebles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestión de ubicaciones y propiedades raíz
          </p>
        </div>
        <Button className="gap-2 bg-linear-to-r from-primary to-primary/80 pointer-events-none opacity-50">
          <Plus className="w-4 h-4" />
          Añadir inmueble
        </Button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : properties?.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-muted/10">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No tienes inmuebles registrados</p>
            <p className="text-xs text-muted-foreground mt-1 min-w-[250px]">
              Los inmuebles se auto-crean cuando un contrato nuevo los especifica en el constructor.
            </p>
          </div>
        ) : (
          properties?.map((p) => (
            <div 
              key={p.id} 
              className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-primary/30 transition-colors group relative overflow-hidden"
            >
              {/* Fake gradient shine on hover */}
              <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="inline-flex text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Vigente
                </span>
              </div>

              <div className="space-y-2 relative z-10">
                <h3 className="font-semibold text-base line-clamp-1 truncate" title={p.name}>
                  {p.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  Creado {format(new Date(p.createdTime), "MMM yyyy", { locale: es })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
