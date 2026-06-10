'use client'

import { useEffect, useState } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Template {
  id: string
  name: string
  sourceType: 'mdx' | 'doc'
  createdTime?: string
  modifiedTime?: string
}

export function TemplateSelector() {
  const { selectedTemplateId, setSelectedTemplateId } = useBuilderStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/templates')
        if (!res.ok) throw new Error('Failed to load templates')
        const data = await res.json()
        // Filter to only show MDX templates (exclude doc templates)
        const mdxOnly = data.filter((t: Template) => t.sourceType === 'mdx')
        setTemplates(mdxOnly)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Card className="border-2 border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">Selecciona una plantilla</CardTitle>
              <CardDescription className="mt-1">
                Elige la plantilla con la que generarás el contrato
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando plantillas...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <Select value={selectedTemplateId || ''} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {/* Base template */}
                <SelectItem value="base-ley820">
                  <div className="flex items-center gap-2">
                    <span>Plantilla Base — Ley 820</span>
                    <Badge variant="secondary" className="text-xs">Base</Badge>
                  </div>
                </SelectItem>
                {/* User templates */}
                {templates.length > 0 && (
                  <>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <span>{template.name}</span>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">
            {selectedTemplateId === 'base-ley820'
              ? 'Usando la plantilla base oficial de Ley 820 de 2003'
              : selectedTemplateId
              ? 'Usando una plantilla personalizada'
              : 'Selecciona una plantilla para continuar'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
