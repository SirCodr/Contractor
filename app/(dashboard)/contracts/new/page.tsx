import { ContractBuilder } from '@/components/builder/ContractBuilder'
import { ContractPreview } from '@/components/builder/ContractPreview'

export default function NewContractPage() {
  return (
    <div className="flex-1 h-[calc(100vh-64px)]">
      {/* 
        Header could go here if layout doesn't provide it 
      */}
      <div className="p-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Contrato</h1>
          <p className="text-muted-foreground">Sigue los pasos para generar un contrato legalmente válido.</p>
        </div>
      </div>

      <div className="flex h-[calc(100%-80px)] p-6 pt-0 gap-8">
        
        {/* Left Side: Builder Wizard Forms */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-10">
          <ContractBuilder />
        </div>

        {/* Right Side: Live Sticky Preview (Hidden on small screens) */}
        <div className="hidden lg:block w-[400px] xl:w-[450px]">
          <ContractPreview />
        </div>

      </div>
    </div>
  )
}
