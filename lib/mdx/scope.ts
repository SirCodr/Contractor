/**
 * Construye el scope (diccionario de variables) desde form values del contrato.
 * Reusa funciones de template-engine y markdown-generator.
 */
import { numberToSpanishText, formatCurrency } from '../template-engine'
import type { ContractFormValues } from '@/lib/schemas'

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatDateEs(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  const monthName = MONTHS_ES[month - 1] ?? ''
  return `${String(day).padStart(2, '0')} de ${monthName} del ${year}`
}

export function buildMdxScope(values: ContractFormValues): Record<string, any> {
  return {
    // Partes
    landlord_name: values.landlord.name.toUpperCase(),
    landlord_cedula: values.landlord.cedula,
    landlord_city: values.landlord.city,
    landlord_phone: values.landlord.phone || '',
    tenant_name: values.tenant.name.toUpperCase(),
    tenant_cedula: values.tenant.cedula,
    tenant_city: values.tenant.city,
    tenant_phone: values.tenant.phone || '',

    // Inmueble
    municipality: values.property.city,
    property_type:
      values.property.type === 'apartment'
        ? 'un apartamento'
        : values.property.type === 'house'
          ? 'una casa'
          : 'un local comercial',
    property_floor: values.property.floor ? `en un ${values.property.floor} piso` : '',
    property_address: values.property.address,
    property_neighborhood: values.property.neighborhood,
    property_description: values.property.description,

    // Financiero
    monthlyRent: values.monthlyRent,
    rent_amount: formatCurrency(values.monthlyRent),
    rent_amount_text: numberToSpanishText(values.monthlyRent),
    bankName: values.bankName || '',
    bankAccount: values.bankAccount || '',
    bank_payment_text: values.bankName
      ? ` o mediante transferencia a la cuenta de ahorros ${values.bankName} Nro. ${values.bankAccount}`
      : '',

    startDate: formatDateEs(values.startDate),
    start_date: formatDateEs(values.startDate),
    endDate: formatDateEs(values.endDate),
    end_date: formatDateEs(values.endDate),
    durationMonths: values.durationMonths,
    duration_months: `${values.durationMonths} (${numberToSpanishText(values.durationMonths)}) meses`,
    maxOccupants: values.maxOccupants || 'dos',
    max_occupants: values.maxOccupants || 'dos',

    depositAmount: values.depositAmount || 0,
    deposit_amount: formatCurrency(values.depositAmount || 0),
    deposit_amount_text: numberToSpanishText(values.depositAmount || 0),

    // Firma
    signature_city: values.signatureCity || values.property.city,
    signatureCity: values.signatureCity || values.property.city,
    signature_day: values.signatureDay,
    signatureDay: values.signatureDay,
    signature_month: values.signatureMonth,
    signatureMonth: values.signatureMonth,
    signature_year: values.signatureYear,
    signatureYear: values.signatureYear,
  }
}
