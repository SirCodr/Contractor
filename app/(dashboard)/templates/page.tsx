'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Copy, Edit2, Trash2, BookOpen } from 'lucide-react'

interface Template {
  id: string
  name: string
  createdTime?: string
  modifiedTime?: string
  webViewLink?: string
  sourceType: 'mdx' | 'doc'
}

interface Clause {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [clauses, setClauses] = useState<Clause[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [loadingClauses, setLoadingClauses] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showNewMenu, setShowNewMenu] = useState(false)

  // Cargar plantillas del usuario
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/templates')
        if (!res.ok) throw new Error('Failed to load templates')
        const data = await res.json()
        setTemplates(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoadingTemplates(false)
      }
    }
    load()
  }, [])

  // Cargar catálogo de cláusulas
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/clauses-library')
        if (!res.ok) throw new Error('Failed to load clauses')
        const data = await res.json()
        setClauses(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoadingClauses(false)
      }
    }
    load()
  }, [])

  const handleDuplicate = async () => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate-base' }),
      })
      if (!res.ok) throw new Error('Failed to duplicate')
      const data = await res.json()
      router.push(`/templates/${data.fileId}/edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return
    setDeleting(templateId)
    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setTemplates(templates.filter(t => t.id !== templateId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setDeleting(null)
    }
  }

  const groupedClauses = clauses.reduce(
    (acc, clause) => {
      if (!acc[clause.category]) acc[clause.category] = []
      acc[clause.category].push(clause)
      return acc
    },
    {} as Record<string, Clause[]>
  )

  // Cerrar menú con Escape o click externo
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (!target.closest('div[data-templates-header]')) setShowNewMenu(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6" data-templates-header onClick={handleClickOutside}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plantillas</h1>
          <p className="text-muted-foreground mt-1">Gestiona y edita tus plantillas de contrato</p>
        </div>

        <div className="relative">
          <Button size="lg" className="gap-2" onClick={() => setShowNewMenu(!showNewMenu)}>
            <Plus className="w-4 h-4" />
            Nueva plantilla
          </Button>
          {showNewMenu && (
            <div className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-10 min-w-48">
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted text-popover-foreground flex items-center gap-2 text-sm"
                onClick={() => {
                  handleDuplicate()
                  setShowNewMenu(false)
                }}
              >
                <Copy className="w-4 h-4" />
                Duplicar Ley 820
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted text-popover-foreground flex items-center gap-2 text-sm border-t border-border"
                onClick={() => {
                  router.push('/templates/new')
                  setShowNewMenu(false)
                }}
              >
                <Edit2 className="w-4 h-4" />
                Desde wizard
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted text-popover-foreground flex items-center gap-2 text-sm border-t border-border"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/templates', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'create' }),
                    })
                    if (!res.ok) throw new Error()
                    const data = await res.json()
                    router.push(`/templates/${data.fileId}/edit`)
                    setShowNewMenu(false)
                  } catch {
                    setError('Error al crear plantilla')
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                En blanco
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-200 rounded border border-red-200 dark:border-red-800">{error}</div>}

      {/* Tabs */}
      <Tabs defaultValue="my-templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-templates">Mis plantillas</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        </TabsList>

        {/* Tab: My Templates */}
        <TabsContent value="my-templates" className="space-y-4 mt-6">
          {loadingTemplates ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : templates.length === 0 ? (
            <Card className="text-center py-8 border-dashed">
              <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Sin plantillas. Crea una desde el botón "Nueva plantilla"</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Base template card */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>Plantilla Base — Ley 820</CardTitle>
                        <Badge variant="secondary">Base</Badge>
                      </div>
                      <CardDescription className="mt-1">
                        Plantilla oficial por defecto. Read-only.
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={handleDuplicate}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicar
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* User templates */}
              {templates.map(template => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{template.name}</CardTitle>
                          {template.sourceType === 'doc' && (
                            <Badge variant="outline" className="text-xs">Google Doc</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {template.modifiedTime && (
                            <>Actualizado: {new Date(template.modifiedTime).toLocaleDateString('es')}</>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {template.sourceType === 'doc' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(template.webViewLink, '_blank')}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Ver en Docs
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/templates/${template.id}/edit`)}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(template.id)}
                          disabled={deleting === template.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Clauses Catalog */}
        <TabsContent value="catalog" className="space-y-6 mt-6">
          {loadingClauses ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : Object.keys(groupedClauses).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Sin cláusulas disponibles</div>
          ) : (
            Object.entries(groupedClauses).map(([category, categoryItems]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-lg">{category}</h3>
                <div className="grid gap-3">
                  {categoryItems.map(clause => (
                    <Card key={clause.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{clause.title}</h4>
                          <p className="text-sm text-muted-foreground">{clause.description}</p>
                          {clause.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {clause.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
