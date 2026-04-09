'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { FileText, Plus, ExternalLink, Calendar, MapPin, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function ContractsPage() {
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const res = await fetch('/api/contracts')
      if (!res.ok) throw new Error('Failed to fetch contracts')
      return res.json() as Promise<any[]>
    },
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todos los contratos generados y vigentes
          </p>
        </div>
        <Link href="/contracts/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 bg-linear-to-r from-primary to-primary/80">
            <Plus className="w-4 h-4" />
            Crear contrato
          </Button>
        </Link>
      </div>

      {/* Toolbox */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por inquilino o inmueble..." 
            className="pl-9"
          />
        </div>
      </div>

      {/* Data View */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : contracts?.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 sm:py-24 text-center p-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aún no tienes contratos</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Crea uno nuevo para empezar.
          </p>
          <Link href="/contracts/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" />
              Crear mi primer contrato
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Inmueble</TableHead>
                  <TableHead>Creación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts?.map((c) => (
                  <TableRow key={c.id} className="group">
                    <TableCell className="font-medium text-sm">
                      {c.properties?.tenant_name || 'Desconocido'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">
                          {c.properties?.property_address || c.propertyFolderName || 'Sin dirección'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(c.createdTime), "dd MMM, yyyy", { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        Activo
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                       {/* Removing group-hover for actions just in case, desktop hover is okay but visible is better accessibility */}
                      <Link 
                        href={`/contracts/${c.id}`}
                        className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                      >
                        Detalles
                      </Link>
                      <a 
                        href={c.webViewLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Ver en Google Docs"
                        className={buttonVariants({ variant: 'outline', size: 'icon' }) + " h-8 w-8"}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {contracts?.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm line-clamp-1">{c.properties?.tenant_name || 'Desconocido'}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[240px]">
                        {c.properties?.property_address || c.propertyFolderName || 'Sin dirección'}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                    Activo
                  </span>
                </div>
                
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{format(new Date(c.createdTime), "dd MMM, yyyy", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link 
                      href={`/contracts/${c.id}`}
                      className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                    >
                      Detalles
                    </Link>
                    <a 
                      href={c.webViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={buttonVariants({ variant: 'outline', size: 'icon' }) + " h-8 w-8"}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
