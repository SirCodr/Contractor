'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FileText, Save, Check, ShieldAlert, ChevronLeft, Pencil, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useBuilderStore } from '@/stores/builder-store'
import { createContractAction, updateContractAction } from '@/app/actions/drive'
import type { ContractFormData } from '@/types/contract'

export function ClausesStep() {
  const router = useRouter()
  const {
    clauses,
    toggleClause,
    updateClauseContent,
    setSubmitting,
    isSubmitting,
    setStep,
    landlord,
    tenant,
    hasCoDebtor,
    coDebtor,
    property,
    financial,
    reset,
    editingFileId,
    editingConfigFileId,
  } = useBuilderStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEditClick = (id: string, currentContent: string) => {
    setEditingId(id)
    setEditValue(currentContent)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      updateClauseContent(editingId, editValue)
      setEditingId(null)
    }
  }

  const handleGenerate = async () => {
    setSubmitting(true)
    
    // Construct payload
    const payload: ContractFormData = {
      landlord: landlord as any,
      tenant: tenant as any,
      hasCoDebtor,
      coDebtor: coDebtor as any,
      property: property as any,
      monthlyRent: financial.monthlyRent!,
      bankName: financial.bankName!,
      bankAccount: financial.bankAccount!,
      depositAmount: financial.depositAmount,
      maxOccupants: financial.maxOccupants,
      startDate: financial.startDate!,
      endDate: financial.endDate!,
      durationMonths: financial.durationMonths!,
      signatureCity: financial.signatureCity!,
      signatureDay: financial.signatureDay!,
      signatureMonth: financial.signatureMonth!,
      signatureYear: financial.signatureYear!,
      clauses: clauses.filter(c => c.defaultEnabled || c.required), // only active included
    }

    try {
      let result
      if (editingFileId && editingConfigFileId) {
          result = await updateContractAction(payload, editingFileId, editingConfigFileId)
      } else {
          result = await createContractAction(payload)
      }
      
      if (result.success) {
        toast.success(editingFileId ? 'Contrato actualizado exitosamente!' : 'Contrato generado exitosamente!')
        reset()
        // we can navigate to the newly created contract or dashboard
        router.push('/') // Redirect to dashboard for now
      } else {
        toast.error(result.error || 'Ocurrió un error al generar el contrato')
      }
    } catch (error) {
      toast.error('Error de red al intentar generar el contrato')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4">
        <div>
           <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Revisión de Cláusulas
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Activa, desactiva o edita las cláusulas de este contrato.</p>
        </div>
      </div>

      <div className="space-y-4">
        {clauses.map((clause) => (
          <div
            key={clause.id}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              clause.defaultEnabled 
                ? 'border-primary/30 bg-card shadow-sm' 
                : 'border-border/50 bg-muted/30 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-sm">{clause.title}</h4>
                  {clause.required && (
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      Obligatoria (Ley)
                    </span>
                  )}
                </div>

                {editingId === clause.id ? (
                  <div className="space-y-3 pt-2">
                    <Textarea 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[120px] text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="h-8">
                        <Check className="w-3.5 h-3.5 mr-1" /> Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">
                        <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <p className={`text-sm ${clause.defaultEnabled ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                      {clause.content.substring(0, 150)}...
                    </p>
                    <button 
                      onClick={() => handleEditClick(clause.id, clause.content)}
                      className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm rounded-md border shadow-sm transition-opacity"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center mt-1">
                <Switch 
                  checked={clause.defaultEnabled || clause.required} 
                  disabled={clause.required}
                  onCheckedChange={() => toggleClause(clause.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t mt-8">
         <Button type="button" variant="ghost" className="gap-2" onClick={() => setStep(3)}>
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </Button>
        <Button 
          onClick={handleGenerate} 
          disabled={isSubmitting}
          className="gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
        >
          {isSubmitting ? (
            <>Generando...</>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Generar Contrato
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
