'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, Calendar, CheckSquare, ChevronLeft, PenTool } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBuilderStore } from '@/stores/builder-store'

export function FinancialStep() {
  const { financial, tenant, setFinancial, setStep } = useBuilderStore()
  const hasTenant = !!tenant?.name?.trim()

  const financialSchema = z.object({
    monthlyRent: z.coerce.number().min(1, 'Canon requerido'),
    bankName: z.string().optional().default(''),
    bankAccount: z.string().optional().default(''),
    depositAmount: z.coerce.number().min(0).default(0),
    maxOccupants: z.string().default('dos'),
    startDate: hasTenant ? z.string().min(1, 'Fecha requerida') : z.string().optional().default(''),
    endDate: hasTenant ? z.string().min(1, 'Fecha requerida') : z.string().optional().default(''),
    durationMonths: hasTenant
      ? z.coerce.number().min(1, 'Requerido')
      : z.coerce.number().optional().default(0),
    signatureCity: hasTenant ? z.string().min(1, 'Requerida') : z.string().optional().default(''),
    signatureDay: hasTenant ? z.string().min(1, 'Requerido') : z.string().optional().default(''),
    signatureMonth: hasTenant ? z.string().min(1, 'Requerido') : z.string().optional().default(''),
    signatureYear: hasTenant ? z.string().min(1, 'Requerido') : z.string().optional().default(''),
  })

  type FinancialFormValues = z.infer<typeof financialSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(financialSchema),
    defaultValues: financial as FinancialFormValues ,
  })

  const watchStartDate = watch('startDate')
  const watchDuration = watch('durationMonths')

  useEffect(() => {
    if (watchStartDate && watchDuration) {
      const [year, month, day] = watchStartDate.split('-').map(Number)
      if (year && month && day) {
        const date = new Date(year, month - 1, day)
        date.setMonth(date.getMonth() + Number(watchDuration))
        date.setDate(date.getDate() - 1)

        const yy = date.getFullYear()
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')
        setValue('endDate', `${yy}-${mm}-${dd}`, { shouldValidate: true })
      }
    }
  }, [watchStartDate, watchDuration, setValue])

  function onSubmit(values: FinancialFormValues) {
    if (!hasTenant) {
      values.startDate = ''
      values.endDate = ''
      values.durationMonths = 0
      values.signatureCity = ''
      values.signatureDay = ''
      values.signatureMonth = ''
      values.signatureYear = ''
    }
    setFinancial(values as FinancialFormValues)
    setStep(4)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Banknote className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Cánon y Pagos</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="monthlyRent">Cánon mensual ($)</Label>
            <Controller
              name="monthlyRent"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  type="text"
                  id="monthlyRent"
                  placeholder="Ej: $ 1,000,000"
                  value={value ? `$ ${new Intl.NumberFormat('en-US').format(Number(value))}` : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '')
                    onChange(rawValue ? Number(rawValue) : 0)
                  }}
                />
              )}
            />
            {errors.monthlyRent && (
              <p className="text-xs text-destructive">{errors.monthlyRent.message as string}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bankName">Banco</Label>
            <Input id="bankName" placeholder="Ej: Banco de Bogotá" {...register('bankName')} />
            {errors.bankName && (
              <p className="text-xs text-destructive">{errors.bankName?.message as string}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bankAccount">Nro. Cuenta</Label>
            <Input id="bankAccount" placeholder="Ej: 123456789" {...register('bankAccount')} />
            {errors.bankAccount && (
              <p className="text-xs text-destructive">{errors.bankAccount?.message as string}</p>
            )}
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="depositAmount">
              Fondo de garantía ($) <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Controller
              name="depositAmount"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  type="text"
                  id="depositAmount"
                  placeholder="Ej: $ 500,000"
                  value={value ? `$ ${new Intl.NumberFormat('en-US').format(Number(value))}` : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '')
                    onChange(rawValue ? Number(rawValue) : 0)
                  }}
                />
              )}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="maxOccupants">Límite de Habitantes</Label>
            <Input
              id="maxOccupants"
              placeholder="Ej: dos personas, o una familia de tres"
              {...register('maxOccupants')}
            />
            {errors.maxOccupants && (
              <p className="text-xs text-destructive">{errors.maxOccupants?.message as string}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Fechas y Duración</h3>
        </div>

        {!hasTenant && (
          <p className="text-[13px] bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
            📝 <b>Modo Plantilla:</b> Dado que dejaste al arrendatario en blanco, la configuración
            de fechas está desactivada. Llénala después al asignar al inquilino real.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="durationMonths">Duración del contrato (meses)</Label>
            <Input
              type="number"
              id="durationMonths"
              placeholder="Ej: 12"
              disabled={!hasTenant}
              {...register('durationMonths')}
            />
            {errors.durationMonths && (
              <p className="text-xs text-destructive">{errors.durationMonths?.message as string}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startDate">Fecha de inicio</Label>
            <Input type="date" id="startDate" disabled={!hasTenant} {...register('startDate')} />
            {errors.startDate && (
              <p className="text-xs text-destructive">{errors.startDate?.message as string}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="flex justify-between w-full">
              Fecha de fin{' '}
              <span className="text-muted-foreground font-normal text-[10px] uppercase tracking-wide">
                Calculada Auto
              </span>
            </Label>
            <Input
              type="date"
              id="endDate"
              readOnly
              className="bg-muted/50 cursor-not-allowed text-muted-foreground/80 focus-visible:ring-0"
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="text-xs text-destructive">{errors.endDate?.message as string}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <PenTool className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Firma del Documento</h3>
        </div>

        {!hasTenant && (
          <p className="text-[13px] bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
            📝 <b>Modo Plantilla:</b> Los lugares y fechas de firma quedarán pendientes.
          </p>
        )}

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="signatureCity">Ciudad de firma</Label>
            <Input
              id="signatureCity"
              placeholder="Ej: Medellín"
              disabled={!hasTenant}
              {...register('signatureCity')}
            />
            {errors.signatureCity && (
              <p className="text-xs text-destructive">{errors.signatureCity?.message as string}</p>
            )}
          </div>
          <div className="col-span-1 space-y-1.5">
            <Label htmlFor="signatureDay">Día</Label>
            <Input
              id="signatureDay"
              placeholder="Ej: 15"
              disabled={!hasTenant}
              {...register('signatureDay')}
            />
            {errors.signatureDay && (
              <p className="text-xs text-destructive">{errors.signatureDay?.message as string}</p>
            )}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="signatureMonth">Mes</Label>
            <Input
              id="signatureMonth"
              placeholder="Ej: Junio"
              disabled={!hasTenant}
              {...register('signatureMonth')}
            />
            {errors.signatureMonth && (
              <p className="text-xs text-destructive">{errors.signatureMonth?.message as string}</p>
            )}
          </div>
          <div className="col-span-1 space-y-1.5">
            <Label htmlFor="signatureYear">Año</Label>
            <Input
              id="signatureYear"
              placeholder="Ej: 2026"
              disabled={!hasTenant}
              {...register('signatureYear')}
            />
            {errors.signatureYear && (
              <p className="text-xs text-destructive">{errors.signatureYear?.message as string}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" className="gap-2" onClick={() => setStep(2)}>
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </Button>
        <Button type="submit" className="gap-2">
          Continuar
          <CheckSquare className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
