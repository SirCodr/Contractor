'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuilderStore } from '@/stores/builder-store'
import type { PropertyDraft } from '@/stores/builder-store'

const propertySchema = z.object({
  address: z.string().min(1, 'Dirección requerida'),
  neighborhood: z.string().min(1, 'Barrio requerido'),
  city: z.string().min(1, 'Ciudad requerida'),
  type: z.enum(['apartment', 'house', 'commercial']),
  floor: z.string().default(''),
  description: z.string().min(1, 'Descripción requerida'),
})

type PropertyFormValues = z.infer<typeof propertySchema>

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Local comercial' },
]

const formatTitleCase = (str: string) => {
  return str.replace(/\b[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, (match) => match.toUpperCase())
}

export function PropertyStep() {
  const { property, setProperty, setStep } = useBuilderStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: property as any,
  })

  function onSubmit(values: any) {
    setProperty(values as PropertyDraft)
    setStep(3)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Datos del inmueble</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="address">Dirección</Label>
            <Input 
              id="address" 
              placeholder="Ej: Calle 94 #87-14" 
              {...register('address')} 
              onInput={(e) => {
                const t = e.target as HTMLInputElement;
                t.value = formatTitleCase(t.value)
              }}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address?.message as string}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="neighborhood">Barrio</Label>
            <Input 
              id="neighborhood" 
              placeholder="Ej: Pueblo Nuevo" 
              {...register('neighborhood')} 
              onInput={(e) => {
                const t = e.target as HTMLInputElement;
                t.value = formatTitleCase(t.value)
              }}
            />
            {errors.neighborhood && (
              <p className="text-xs text-destructive">{errors.neighborhood?.message as string}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">Municipio</Label>
            <Input 
              id="city" 
              placeholder="Ej: Apartadó, Antioquia" 
              {...register('city')} 
              onInput={(e) => {
                const t = e.target as HTMLInputElement;
                t.value = formatTitleCase(t.value)
              }}
            />
            {errors.city && <p className="text-xs text-destructive">{errors.city?.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo de inmueble</Label>
            <Select
              defaultValue={watch('type')}
              onValueChange={(v) => setValue('type', v as PropertyFormValues['type'])}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="floor">
              Piso / Nivel <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input id="floor" placeholder="Ej: tercer piso" {...register('floor')} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="description">Descripción interior</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Ej: Consta de sala, comedor, cocina, dos alcobas y un baño"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description?.message as string}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" className="gap-2" onClick={() => setStep(1)}>
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </Button>
        <Button type="submit" className="gap-2">
          Continuar
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
