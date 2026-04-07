import { z } from 'zod'

const personSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  cedula: z.string().min(1, 'Cédula requerida'),
  city: z.string().min(1, 'Ciudad requerida'),
  phone: z.string().optional().default(''),
})

const propertySchema = z.object({
  address: z.string().min(1, 'Dirección requerida'),
  neighborhood: z.string().min(1, 'Barrio requerido'),
  city: z.string().min(1, 'Ciudad requerida'),
  type: z.enum(['apartment', 'house', 'commercial']),
  floor: z.string().optional().default(''),
  description: z.string().min(1, 'Descripción requerida'),
})

export const contractClauseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  enabled: z.boolean(),
  required: z.boolean(),
})

export const contractFormSchema = z.object({
  landlord: personSchema,
  tenant: personSchema,
  hasCoDebtor: z.boolean().default(false),
  coDebtor: personSchema.optional(),
  propertyId: z.string().optional(),
  property: propertySchema,
  monthlyRent: z.coerce.number().min(1, 'Canon requerido'),
  bankName: z.string().optional().default(''),
  bankAccount: z.string().optional().default(''),
  depositAmount: z.coerce.number().min(0).default(0),
  maxOccupants: z.string().default('dos'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  durationMonths: z.coerce.number().min(1, 'Duración requerida'),
  signatureCity: z.string().default(''),
  signatureDay: z.string().default(''),
  signatureMonth: z.string().default(''),
  signatureYear: z.string().default(''),
  clauses: z.array(contractClauseSchema),
})

export type ContractFormValues = z.infer<typeof contractFormSchema>
