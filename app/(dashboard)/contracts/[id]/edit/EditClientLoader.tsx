'use client'

import { useEffect, useState } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import { ContractBuilder } from '@/components/builder/ContractBuilder'
import { ContractPreview } from '@/components/builder/ContractPreview'

export function EditClientLoader({ data, fileId, configId }: any) {
  const [ready, setReady] = useState(false)
  const { loadData, setEditingContext } = useBuilderStore()

  useEffect(() => {
    // Populate the store with the saved configuration
    loadData(data)
    setEditingContext(fileId, configId)
    setReady(true)
  }, [loadData, setEditingContext, data, fileId, configId])

  if (!ready) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Cargando datos del contrato original...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-[calc(100vh-64px)]">
      <div className="p-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Editando Contrato</h1>
          <p className="text-muted-foreground">Modifica los detalles y guarda para actualizar el documento existente en Drive.</p>
        </div>
      </div>

      <div className="flex h-[calc(100%-80px)] p-6 pt-0 gap-8">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-10">
          <ContractBuilder />
        </div>
        <div className="hidden lg:block w-[400px] xl:w-[450px]">
          <ContractPreview />
        </div>
      </div>
    </div>
  )
}
