'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { FileText, Plus, ExternalLink, Calendar, MapPin, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Todos los contratos generados y vigentes
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="gap-2 bg-linear-to-r from-primary to-primary/80">
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

      {/* Grid / Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : contracts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No se encontraron contratos. Crea uno nuevo para empezar.
                </TableCell>
              </TableRow>
            ) : (
              contracts?.map((c) => (
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
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      asChild
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    >
                      <a href={c.webViewLink} target="_blank" rel="noopener noreferrer" title="Ver en Google Docs">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
