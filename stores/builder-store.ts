import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { BASE_CLAUSES } from '@/constants/clauses'
import type { TemplateClause } from '@/types/contract'

export type Step = 1 | 2 | 3 | 4

export type PersonDraft = {
  name: string
  cedula: string
  city: string
  phone: string
}

export type PropertyDraft = {
  address: string
  neighborhood: string
  city: string
  type: 'apartment' | 'house' | 'commercial'
  floor: string
  description: string
}

export type FinancialDraft = {
  monthlyRent: number
  bankName: string
  bankAccount: string
  depositAmount: number
  maxOccupants: string
  startDate: string
  endDate: string
  durationMonths: number
  signatureCity: string
  signatureDay: string
  signatureMonth: string
  signatureYear: string
}

type BuilderResult = {
  fileId: string
  webViewLink: string
}

type BuilderStore = {
  step: Step
  highestStep: Step
  landlord: Partial<PersonDraft>
  tenant: Partial<PersonDraft>
  hasCoDebtor: boolean
  coDebtor: Partial<PersonDraft>
  property: Partial<PropertyDraft>
  financial: Partial<FinancialDraft>
  clauses: TemplateClause[]
  isSubmitting: boolean
  result: BuilderResult | null
  editingFileId: string | null
  editingConfigFileId: string | null
  contractName: string

  // Actions
  setContractName: (name: string) => void
  setStep: (step: Step) => void
  setParties: (data: {
    landlord: PersonDraft
    tenant: PersonDraft
    hasCoDebtor: boolean
    coDebtor?: PersonDraft
  }) => void
  setProperty: (data: PropertyDraft) => void
  setFinancial: (data: FinancialDraft) => void
  setClauses: (clauses: TemplateClause[]) => void
  toggleClause: (id: string) => void
  updateClauseContent: (id: string, content: string) => void
  setSubmitting: (v: boolean) => void
  setResult: (result: BuilderResult) => void
  setEditingContext: (fileId: string, configId: string) => void
  loadData: (data: any) => void
  reset: () => void
}

const INITIAL_STATE = {
  step: 1 as Step,
  highestStep: 1 as Step,
  landlord: {},
  tenant: {},
  hasCoDebtor: false,
  coDebtor: {},
  property: {},
  financial: {},
  clauses: BASE_CLAUSES,
  isSubmitting: false,
  result: null,
  editingFileId: null,
  editingConfigFileId: null,
  contractName: '',
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setContractName: (contractName) => set({ contractName }),

      setStep: (step) => set((state) => ({ 
        step,
        highestStep: Math.max(state.highestStep || 1, step) as Step 
      })),

      setParties: ({ landlord, tenant, hasCoDebtor, coDebtor }) =>
        set({ landlord, tenant, hasCoDebtor, coDebtor: coDebtor ?? {} }),

      setProperty: (property) => set({ property }),

      setFinancial: (financial) => set({ financial }),

      setClauses: (clauses) => set({ clauses }),

      toggleClause: (id) =>
        set((state) => ({
          clauses: state.clauses.map((c) =>
            c.id === id && !c.required ? { ...c, defaultEnabled: !c.defaultEnabled } : c,
          ),
        })),

      updateClauseContent: (id, content) =>
        set((state) => ({
          clauses: state.clauses.map((c) => (c.id === id ? { ...c, content } : c)),
        })),

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      setResult: (result) => set({ result }),

      setEditingContext: (fileId, configId) => set({ editingFileId: fileId, editingConfigFileId: configId }),

      loadData: (data) => set({
        step: 1,
        highestStep: (data.highestStep || 4) as Step, // If loading edited data, allow full nav
        contractName: data.contractName || '',
        landlord: data.landlord || {},
        tenant: data.tenant || {},
        hasCoDebtor: data.hasCoDebtor || false,
        coDebtor: data.coDebtor || {},
        property: data.property || {},
        financial: {
            monthlyRent: data.monthlyRent,
            bankName: data.bankName,
            bankAccount: data.bankAccount,
            depositAmount: data.depositAmount,
            maxOccupants: data.maxOccupants,
            startDate: data.startDate,
            endDate: data.endDate,
            durationMonths: data.durationMonths,
            signatureCity: data.signatureCity,
            signatureDay: data.signatureDay,
            signatureMonth: data.signatureMonth,
            signatureYear: data.signatureYear,
        },
        clauses: data.clauses || BASE_CLAUSES,
        isSubmitting: false,
      }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'contract-builder-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
