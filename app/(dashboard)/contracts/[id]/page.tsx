'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { FileText, ExternalLink, Calendar, MapPin, User, ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function ContractDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const res = await fetch(`/api/contracts/${id}`)
      if (!res.ok) throw new Error('Failed to fetch contract')
      return res.json()
    },
  })

  // Optional: Function to handle delete later
  const handleDelete = async () => {
    // Basic frontend prompt to confirm action, ideally replaced with Dialog component later
    if (confirm('¿Estás seguro de que quieres mover este contrato a la papelera?')) {
      const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' })
      if (res.ok) {
         router.push('/contracts')
      }
    }
  }

  if (isLoading) {
    return (
       <div className="p-8 max-w-4xl mx-auto space-y-6">
         <Skeleton className="w-24 h-8" />
         <Skeleton className="w-full h-64 rounded-xl" />
       </div>
    )
  }

  if (!contract) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground">Contrato no encontrado.</p>
        <Button variant="link" onClick={() => router.push('/contracts')}>Volver</Button>
      </div>
    )
  }

  const props = contract.properties || {}

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header & Navigation */}
      <div className="space-y-4">
        <Link 
           href="/contracts" 
           className={buttonVariants({ variant: 'ghost' }) + " gap-2 -ml-3 text-muted-foreground hover:text-foreground"}
        >
             <ArrowLeft className="w-4 h-4" />
             Volver a contratos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{props.tenant_name || 'Sin título'}</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Vigente
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
               <FileText className="w-4 h-4" />
               ID Drive: <span className="font-mono text-xs">{contract.id}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {contract.webViewLink && (
              <a 
                href={contract.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={buttonVariants() + " gap-2 bg-linear-to-r from-primary to-primary/80"}
              >
                  <ExternalLink className="w-4 h-4" />
                  Abrir en Google Docs
              </a>
             )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
           <div className="rounded-xl border border-border bg-card p-6 space-y-8">
              
              <div>
                 <h3 className="font-semibold text-lg border-b pb-2 mb-4">Información de Partes</h3>
                 <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Arrendatario</p>
                       <p className="font-medium">{props.tenant_name || '—'}</p>
                       <p className="text-sm text-muted-foreground">C.C. {props.tenant_cedula || '—'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Arrendador</p>
                       <p className="font-medium">{props.landlord_name || '—'}</p>
                       <p className="text-sm text-muted-foreground">C.C. {props.landlord_cedula || '—'}</p>
                    </div>
                 </div>
              </div>

              <div>
                 <h3 className="font-semibold text-lg border-b pb-2 mb-4">Detalles del Inmueble</h3>
                 <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Dirección</p>
                    <p className="font-medium">{props.property_address || '—'}</p>
                    <p className="text-sm text-muted-foreground">{props.property_city || '—'}</p>
                 </div>
              </div>

           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div>
                 <h3 className="font-semibold mb-4">Finanzas</h3>
                 <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Canon Mensual</p>
                    <p className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(props.monthly_rent || 0))}
                    </p>
                 </div>
              </div>

              <div className="pt-4 border-t border-border">
                 <h3 className="font-semibold mb-4">Plazos</h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Fecha de Inicio</p>
                       <p className="text-sm font-medium">
                         {props.start_date ? format(parseISO(props.start_date), "dd MMM, yyyy", { locale: es }) : '—'}
                       </p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Fecha de Terminación</p>
                       <p className="text-sm font-medium">
                         {props.end_date ? format(parseISO(props.end_date), "dd MMM, yyyy", { locale: es }) : '—'}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
           
           <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={handleDelete}>
             <Trash2 className="w-4 h-4 mr-2" />
             Borrar contrato
           </Button>
        </div>
      </div>
    </div>
  )
}
