import { z } from 'zod'

const personSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  cedula: z.string().min(1, 'Cédula requerida'),
  cedulaCity: z.string().min(1, 'Ciudad requerida'),
  phone: z.string().default(''),
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
  bankName: z.string().min(1, 'Banco requerido'),
  bankAccount: z.string().min(1, 'Número de cuenta requerido'),
  depositAmount: z.coerce.number().min(0).default(0),
  maxOccupants: z.coerce.number().min(1).default(2),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  clauses: z.array(contractClauseSchema),
})

export type ContractFormValues = z.infer<typeof contractFormSchema>
