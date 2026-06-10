import { ContractBuilder } from '@/components/builder/ContractBuilder'
import { ContractPreview } from '@/components/builder/ContractPreview'

export default function NewTemplatePage() {
  return (
    <div className="flex-1 h-[calc(100vh-64px)]">
      <div className="p-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Nueva Plantilla</h1>
          <p className="text-muted-foreground">Usa el wizard para crear una nueva plantilla. El resultado será editable en el editor MDX.</p>
        </div>
      </div>

      <div className="flex h-[calc(100%-80px)] p-6 pt-0 gap-8">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-10">
          <ContractBuilder mode="template" />
        </div>

        <div className="hidden lg:block w-[400px] xl:w-[450px]">
          <ContractPreview />
        </div>
      </div>
    </div>
  )
}
