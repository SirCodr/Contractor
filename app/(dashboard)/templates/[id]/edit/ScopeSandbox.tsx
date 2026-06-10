'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ContractFormValues } from '@/lib/schemas'

interface ScopeSandboxProps {
  onChange: (values: Partial<ContractFormValues>) => void
}

const DEFAULT_MOCK_VALUES: Partial<ContractFormValues> = {
  landlord: {
    name: 'Juan Pérez González',
    cedula: '80.123.456',
    city: 'Bogotá',
    phone: '3105551234',
  },
  tenant: {
    name: 'María García López',
    cedula: '50.987.654',
    city: 'Bogotá',
    phone: '3155559876',
  },
  property: {
    address: 'Cra 7 #45-23',
    neighborhood: 'Centro',
    city: 'Bogotá',
    type: 'apartment' as const,
    floor: '5',
    description: 'Apartamento moderno 2 habitaciones',
  },
  monthlyRent: 1500000,
  depositAmount: 3000000,
  startDate: '2026-06-15',
  endDate: '2027-06-15',
  durationMonths: 12,
  bankName: 'Bancolombia',
  bankAccount: '04053000123456789',
}

export function ScopeSandbox({ onChange }: ScopeSandboxProps) {
  const [values, setValues] = useState<Partial<ContractFormValues>>(DEFAULT_MOCK_VALUES)

  const handleNestedChange = useCallback(
    (path: string, value: any) => {
      const newValues = { ...values }
      const keys = path.split('.')
      let current: any = newValues

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      setValues(newValues)
      onChange(newValues)
    },
    [onChange]
  )

  const handleFillDemo = useCallback(() => {
    setValues(DEFAULT_MOCK_VALUES)
    onChange(DEFAULT_MOCK_VALUES)
  }, [onChange])

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold">Variables de Prueba</h3>
        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={handleFillDemo}>
          Demo
        </Button>
      </div>

      <div className="space-y-3 max-h-[calc(100%-40px)] overflow-y-auto pr-2">
        {/* Landlord */}
        <div className="space-y-2 p-2 bg-muted/40 rounded">
          <h4 className="font-semibold text-[10px] uppercase text-muted-foreground">Arrendador</h4>
          <div>
            <Label className="text-[10px]">Nombre</Label>
            <Input
              value={values.landlord?.name || ''}
              onChange={e => handleNestedChange('landlord.name', e.target.value)}
              className="h-7 text-xs"
              placeholder="Nombre"
            />
          </div>
          <div>
            <Label className="text-[10px]">Cédula</Label>
            <Input
              value={values.landlord?.cedula || ''}
              onChange={e => handleNestedChange('landlord.cedula', e.target.value)}
              className="h-7 text-xs"
              placeholder="CC"
            />
          </div>
        </div>

        {/* Tenant */}
        <div className="space-y-2 p-2 bg-muted/40 rounded">
          <h4 className="font-semibold text-[10px] uppercase text-muted-foreground">Inquilino</h4>
          <div>
            <Label className="text-[10px]">Nombre</Label>
            <Input
              value={values.tenant?.name || ''}
              onChange={e => handleNestedChange('tenant.name', e.target.value)}
              className="h-7 text-xs"
              placeholder="Nombre"
            />
          </div>
          <div>
            <Label className="text-[10px]">Cédula</Label>
            <Input
              value={values.tenant?.cedula || ''}
              onChange={e => handleNestedChange('tenant.cedula', e.target.value)}
              className="h-7 text-xs"
              placeholder="CC"
            />
          </div>
        </div>

        {/* Property */}
        <div className="space-y-2 p-2 bg-muted/40 rounded">
          <h4 className="font-semibold text-[10px] uppercase text-muted-foreground">Inmueble</h4>
          <div>
            <Label className="text-[10px]">Dirección</Label>
            <Input
              value={values.property?.address || ''}
              onChange={e => handleNestedChange('property.address', e.target.value)}
              className="h-7 text-xs"
              placeholder="Calle"
            />
          </div>
          <div>
            <Label className="text-[10px]">Tipo</Label>
            <Input
              value={values.property?.type || ''}
              onChange={e => handleNestedChange('property.type', e.target.value)}
              className="h-7 text-xs"
              placeholder="apartment"
            />
          </div>
        </div>

        {/* Financial */}
        <div className="space-y-2 p-2 bg-muted/40 rounded">
          <h4 className="font-semibold text-[10px] uppercase text-muted-foreground">Condiciones</h4>
          <div>
            <Label className="text-[10px]">Canon Mensual</Label>
            <Input
              type="number"
              value={values.monthlyRent || ''}
              onChange={e => handleNestedChange('monthlyRent', parseInt(e.target.value) || 0)}
              className="h-7 text-xs"
              placeholder="1500000"
            />
          </div>
          <div>
            <Label className="text-[10px]">Depósito</Label>
            <Input
              type="number"
              value={values.depositAmount || ''}
              onChange={e => handleNestedChange('depositAmount', parseInt(e.target.value) || 0)}
              className="h-7 text-xs"
              placeholder="3000000"
            />
          </div>
          <div>
            <Label className="text-[10px]">Inicio</Label>
            <Input
              type="date"
              value={values.startDate || ''}
              onChange={e => handleNestedChange('startDate', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px]">Fin</Label>
            <Input
              type="date"
              value={values.endDate || ''}
              onChange={e => handleNestedChange('endDate', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
