'use client'

import { useBuilderStore } from '@/stores/builder-store'
import { PartiesStep } from './steps/PartiesStep'
import { PropertyStep } from './steps/PropertyStep'
import { FinancialStep } from './steps/FinancialStep'
import { ClausesStep } from './steps/ClausesStep'

const STEPS = [
  { id: 1, title: 'Partes' },
  { id: 2, title: 'Inmueble' },
  { id: 3, title: 'Condiciones' },
  { id: 4, title: 'Cláusulas' },
]

export function ContractBuilder() {
  const currentStep = useBuilderStore((state) => state.step)

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border/40 -z-10" />
          {STEPS.map((step) => {
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : isCompleted
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {currentStep === 1 && <PartiesStep />}
        {currentStep === 2 && <PropertyStep />}
        {currentStep === 3 && <FinancialStep />}
        {currentStep === 4 && <ClausesStep />}
      </div>
    </div>
  )
}
