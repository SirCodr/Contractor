export type PropertyType = 'apartment' | 'house' | 'commercial'

export type ContractStatus = 'active' | 'expired' | 'terminated'

export type Person = {
  name: string
  cedula: string
  cedulaCity: string
  phone: string
}

export type Property = {
  driveFolderId?: string
  address: string
  neighborhood: string
  city: string
  type: PropertyType
  floor?: string
  description: string
}

export type ContractClause = {
  id: string
  title: string
  content: string
  enabled: boolean
  required: boolean
}

export type Contract = {
  driveFileId: string
  propertyDriveFolderId: string
  status: ContractStatus
  landlord: Person
  tenant: Person
  coDebtor?: Person
  property: Property
  monthlyRent: number
  monthlyRentText: string
  bankName: string
  bankAccount: string
  depositAmount: number
  depositAmountText: string
  maxOccupants: number
  startDate: string
  endDate: string
  durationMonths: number
  clauses: ContractClause[]
  signatureCity: string
  signatureDate: string
  createdAt: string
  updatedAt: string
}

export type ContractSummary = {
  driveFileId: string
  tenantName: string
  propertyAddress: string
  status: ContractStatus
  startDate: string
  endDate: string
  monthlyRent: number
  createdAt: string
}

export type Template = {
  driveFileId?: string
  name: string
  type: 'residential'
  description?: string
  clauses: TemplateClause[]
}

export type TemplateClause = {
  id: string
  title: string
  content: string
  required: boolean
  defaultEnabled: boolean
  variables: string[]
}

export type ContractVariable = {
  key: string
  label: string
  description?: string
  section: 'parties' | 'property' | 'financial' | 'signature'
}
