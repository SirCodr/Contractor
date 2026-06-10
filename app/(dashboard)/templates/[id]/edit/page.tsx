'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { ScopeSandbox } from './ScopeSandbox'
import { ClausesPalette } from './ClausesPalette'
import { ContractFormValues } from '@/lib/schemas'
import { validateMdxCompilation } from '@/lib/mdx/actions'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function EditTemplatePage() {
  const params = useParams()
  const templateId = params.id as string
  const queryClient = useQueryClient()

  const [source, setSource] = useState('')
  const [compilationValid, setCompilationValid] = useState<boolean | null>(null)
  const [formValues, setFormValues] = useState<Partial<ContractFormValues>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()

  // Cargar plantilla
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/templates/${templateId}`)
        if (!res.ok) throw new Error('Failed to load template')
        const data = await res.json()
        setSource(data.source || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [templateId])

  // Validar compilación con debounce
  const handleSourceChange = (newSource: string) => {
    setSource(newSource)

    if (debounceTimer) clearTimeout(debounceTimer)

    const timer = setTimeout(async () => {
      try {
        const result = await validateMdxCompilation(newSource, formValues)
        setCompilationValid(result.valid)
        if (!result.valid) {
          setError(result.error || 'Error de compilación')
        } else {
          setError('')
        }
      } catch (err) {
        setCompilationValid(false)
        setError(err instanceof Error ? err.message : 'Error de compilación')
      }
    }, 400)

    setDebounceTimer(timer)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      if (!res.ok) throw new Error('Failed to save')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div className="flex h-screen gap-4 p-4 bg-background overflow-hidden">
      {/* Left: Editor + Clauses */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Editor de Plantilla</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden rounded border bg-card">
          {/* Code editor */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <CodeMirror
              value={source}
              onChange={handleSourceChange}
              extensions={[markdown()]}
              height="100%"
              className="h-full flex-1"
            />
          </div>

          {/* Clauses Palette */}
          <div className="w-80 border-l overflow-hidden flex flex-col min-w-0">
            <ClausesPalette
              currentMdx={source}
              onInsert={(clauseSource) => {
                const newSource = source + '\n\n' + clauseSource
                handleSourceChange(newSource)
              }}
            />
          </div>
        </div>
      </div>

      {/* Right: Preview + Sandbox */}
      <div className="w-96 flex flex-col gap-4 min-w-0">
        {/* Scope Sandbox */}
        <div className="bg-card rounded border p-4 h-1/3 overflow-y-auto shadow-sm">
          <ScopeSandbox onChange={setFormValues} />
        </div>

        {/* Compilation Status */}
        <div className="flex-1 bg-card rounded border overflow-auto shadow-sm flex flex-col p-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Estado de compilación</h3>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {compilationValid === true && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded text-green-700 dark:text-green-200 text-sm border border-green-200 dark:border-green-800 flex gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>Plantilla compilada correctamente</div>
              </div>
            )}

            {compilationValid === false && !error && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded text-amber-700 dark:text-amber-200 text-sm border border-amber-200 dark:border-amber-800 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>Error de compilación</div>
              </div>
            )}

            {compilationValid === null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded text-gray-700 dark:text-gray-200 text-sm border border-gray-200 dark:border-gray-800">
                Edita la plantilla para validarla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
