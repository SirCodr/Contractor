'use client'

import { LayoutTemplate, Settings2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { BASE_CLAUSES } from '@/constants/clauses'

export default function TemplatesPage() {
  // In Phase 7 we render the static BASE_CLAUSES as our default template
  // Future phases will fetch this dynamically from Drive

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plantillas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configuración de los modelos base para contratos
          </p>
        </div>
        <Button className="gap-2 bg-linear-to-r from-primary to-primary/80 pointer-events-none opacity-50">
          <Plus className="w-4 h-4" />
          Nueva plantilla
        </Button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Plantilla Principal (Ley 820)</h2>
              <p className="text-xs text-muted-foreground">Base legal activa por defecto</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2 pointer-events-none opacity-50">
            <Settings2 className="w-4 h-4" />
            Editar
          </Button>
        </div>

        {/* Clauses list */}
        <div className="divide-y divide-border">
          {BASE_CLAUSES.map((clause) => (
            <div key={clause.id} className="p-5 flex gap-4 hover:bg-muted/10 transition-colors">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{clause.title}</h3>
                  {clause.required && (
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      Obligatoria
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {clause.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
