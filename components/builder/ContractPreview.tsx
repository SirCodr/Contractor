'use client'

import { useBuilderStore } from '@/stores/builder-store'
import { FileText, MapPin, User, Banknote } from 'lucide-react'

export function ContractPreview() {
  const { landlord, tenant, property, financial } = useBuilderStore()

  // helper to check if section has valid data
  const hasParties = landlord.name || tenant.name
  const hasProperty = property.address || property.city
  const hasFinancial = financial.monthlyRent || financial.startDate

  if (!hasParties && !hasProperty && !hasFinancial) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">Completa el formulario para ver un resumen del contrato aquí.</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-card rounded-2xl border p-6 flex flex-col shadow-sm">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Resumen del Contrato
      </h3>

      <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
        {/* Parties Section */}
        {hasParties && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Las Partes</h4>
            
            {landlord.name && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Arrendador</p>
                  <p className="text-sm font-semibold">{landlord.name}</p>
                  {landlord.cedula && <p className="text-xs text-muted-foreground">CC: {landlord.cedula}</p>}
                </div>
              </div>
            )}

            {tenant.name && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Arrendatario</p>
                  <p className="text-sm font-semibold">{tenant.name}</p>
                  {tenant.cedula && <p className="text-xs text-muted-foreground">CC: {tenant.cedula}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Property Section */}
        {hasProperty && (
          <div className="space-y-3">
             <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">El Inmueble</h4>
             
             <div className="flex items-start gap-3 p-3 rounded-xl border border-dashed border-border">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {property.type === 'apartment' ? 'Apartamento' : property.type === 'house' ? 'Casa' : 'Local'} 
                    {property.neighborhood ? ` en ${property.neighborhood}` : ''}
                  </p>
                  <p className="text-sm font-semibold">{property.address || 'Sin dirección'}</p>
                  {property.city && <p className="text-xs text-muted-foreground">{property.city}</p>}
                </div>
              </div>
          </div>
        )}

        {/* Financial Section */}
        {hasFinancial && (
          <div className="space-y-3">
             <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Condiciones</h4>
             
             <div className="flex flex-col gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Canon Mensual</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {financial.monthlyRent ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(financial.monthlyRent) : '$0'}
                  </p>
                </div>
                {financial.depositAmount ? (
                   <div className="flex items-center justify-between border-t border-emerald-500/10 pt-2 mt-1">
                    <p className="text-xs text-muted-foreground">Depósito</p>
                    <p className="text-xs font-medium">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(financial.depositAmount)}
                    </p>
                  </div>
                ) : null}
              </div>

               {(financial.startDate || financial.durationMonths) && (
                 <div className="grid grid-cols-2 gap-2 mt-2">
                   <div className="p-3 bg-muted/30 rounded-lg">
                     <p className="text-[10px] uppercase text-muted-foreground mb-1">Inicio</p>
                     <p className="text-xs font-medium">{financial.startDate || '-'}</p>
                   </div>
                   <div className="p-3 bg-muted/30 rounded-lg">
                     <p className="text-[10px] uppercase text-muted-foreground mb-1">Duración</p>
                     <p className="text-xs font-medium">{financial.durationMonths || '-'}</p>
                   </div>
                 </div>
               )}
          </div>
        )}
      </div>

       <div className="pt-4 border-t mt-auto">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Banknote className="w-3.5 h-3.5" />
          <span>Contrato regido bajo Ley 820 de 2003</span>
        </div>
      </div>
    </div>
  )
}
