'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Users, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBuilderStore } from '@/stores/builder-store'
import type { PersonDraft } from '@/stores/builder-store'

const personSchema = z.object({
  name: z.string().optional().default(''),
  cedula: z.string().optional().default(''),
  city: z.string().optional().default(''),
  phone: z.string().optional().default(''),
})

const personOptionalSchema = z.object({
  name: z.string().optional().default(''),
  cedula: z.string().optional().default(''),
  city: z.string().optional().default(''),
  phone: z.string().optional().default(''),
})

const partiesSchema = z.object({
  landlord: personSchema,
  tenant: personSchema,
  hasCoDebtor: z.boolean().default(false),
  coDebtor: personOptionalSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.hasCoDebtor) {
    if (!data.coDebtor?.name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nombre requerido', path: ['coDebtor', 'name'] })
    if (!data.coDebtor?.cedula) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cédula requerida', path: ['coDebtor', 'cedula'] })
    if (!data.coDebtor?.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ciudad requerida', path: ['coDebtor', 'city'] })
  }
})

type PartiesFormValues = z.infer<typeof partiesSchema>

const formatTitleCase = (str: string) => {
  return str.replace(/\b[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, (match) => match.toUpperCase())
}

function PersonFields({
  prefix,
  label,
  register,
  errors,
}: {
  prefix: 'landlord' | 'tenant' | 'coDebtor'
  label: string
  register: ReturnType<typeof useForm<PartiesFormValues>>['register']
  errors: Record<string, unknown>
}) {
  const fieldErrors = (errors[prefix] ?? {}) as Record<string, { message?: string }>

  return (
    <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{label}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor={`${prefix}-name`}>Nombre completo</Label>
          <Input
            id={`${prefix}-name`}
            placeholder="Ej: Juan Pérez Gómez"
            {...register(`${prefix}.name` as 'landlord.name')}
            onInput={(e) => {
              const target = e.target as HTMLInputElement
              target.value = formatTitleCase(target.value)
            }}
          />
          {fieldErrors.name && (
            <p className="text-xs text-destructive">{fieldErrors.name?.message as string}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-cedula`}>Cédula</Label>
          <Input
            id={`${prefix}-cedula`}
            placeholder="Ej: 1020304050"
            {...register(`${prefix}.cedula` as 'landlord.cedula')}
          />
          {fieldErrors.cedula && (
            <p className="text-xs text-destructive">{fieldErrors.cedula?.message as string}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-city`}>Ciudad de expedición</Label>
          <Input
            id={`${prefix}-city`}
            placeholder="Ej: Bogotá"
            {...register(`${prefix}.city` as 'landlord.city')}
            onInput={(e) => {
              const target = e.target as HTMLInputElement
              target.value = formatTitleCase(target.value)
            }}
          />
          {fieldErrors.city && (
            <p className="text-xs text-destructive">{fieldErrors.city?.message as string}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-phone`}>
            Celular <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id={`${prefix}-phone`}
            placeholder="Ej: 300 123 4567"
            {...register(`${prefix}.phone` as 'landlord.phone')}
          />
        </div>
      </div>
    </div>
  )
}

export function PartiesStep() {
  const { landlord, tenant, hasCoDebtor, coDebtor, setParties, setStep } = useBuilderStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partiesSchema),
    defaultValues: {
      landlord: landlord as any,
      tenant: tenant as any,
      hasCoDebtor: !!hasCoDebtor,
      coDebtor: coDebtor as any,
    } as any,
  })

  const watchHasCoDebtor = watch('hasCoDebtor')

  function onSubmit(values: any) {
    setParties(values as Parameters<typeof setParties>[0])
    setStep(2)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PersonFields prefix="landlord" label="Arrendador" register={register} errors={errors} />
      <PersonFields prefix="tenant" label="Arrendatario" register={register} errors={errors} />

      {/* Co-debtor toggle */}
      <button
        type="button"
        onClick={() => setValue('hasCoDebtor', !watchHasCoDebtor)}
        className="flex items-center gap-3 w-full p-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Co-deudor o fiador</p>
          <p className="text-xs text-muted-foreground">
            {watchHasCoDebtor ? 'Clic para quitar' : 'Clic para agregar'}
          </p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            watchHasCoDebtor ? 'border-primary bg-primary' : 'border-border'
          }`}
        >
          {watchHasCoDebtor && (
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
              <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </button>

      {watchHasCoDebtor && (
        <PersonFields prefix="coDebtor" label="Co-deudor / Fiador" register={register} errors={errors} />
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" className="gap-2">
          Continuar
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
