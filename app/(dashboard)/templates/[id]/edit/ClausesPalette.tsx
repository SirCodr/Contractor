'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, BookOpen } from 'lucide-react'

export interface ClauseItem {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  source: string
}

interface ClausesPaletteProps {
  currentMdx?: string
  onInsert: (clauseSource: string) => void
}

export function ClausesPalette({ currentMdx = '', onInsert }: ClausesPaletteProps) {
  const [allClauses, setAllClauses] = useState<ClauseItem[]>([])
  const [suggestions, setSuggestions] = useState<ClauseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCatalog, setSearchCatalog] = useState('')
  const [error, setError] = useState('')

  // Fetch catálogo
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/clauses-library')
        if (!res.ok) throw new Error('Failed to load clauses')
        const data = await res.json()
        setAllClauses(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Fetch sugerencias cuando cambia MDX
  useEffect(() => {
    if (!currentMdx || allClauses.length === 0) return

    const loadSuggestions = async () => {
      try {
        const res = await fetch('/api/clauses-library/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentMdx, context: {} }),
        })
        if (!res.ok) throw new Error('Failed to get suggestions')
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch (err) {
        console.error('Suggestion error:', err)
      }
    }

    loadSuggestions()
  }, [currentMdx, allClauses.length])

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Cargando...</div>
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>

  const filteredCatalog = allClauses.filter(
    c =>
      c.title.toLowerCase().includes(searchCatalog.toLowerCase()) ||
      c.description.toLowerCase().includes(searchCatalog.toLowerCase())
  )

  return (
    <Tabs defaultValue="catalog" className="h-full flex flex-col">
      <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
        <TabsTrigger value="catalog" className="gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Catálogo</span>
        </TabsTrigger>
        <TabsTrigger value="suggestions" className="gap-1">
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sugerencias</span>
        </TabsTrigger>
      </TabsList>

      {/* Catalog Tab */}
      <TabsContent value="catalog" className="flex-1 overflow-y-auto p-3 space-y-2">
        <Input
          placeholder="Buscar cláusula..."
          value={searchCatalog}
          onChange={e => setSearchCatalog(e.target.value)}
          className="h-8 text-xs"
        />
        {filteredCatalog.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">No hay resultados</div>
        ) : (
          filteredCatalog.map(clause => (
            <div
              key={clause.id}
              className="p-3 bg-muted/40 rounded border border-border/50 hover:border-primary/50 transition-all space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-xs font-semibold">{clause.title}</h4>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {clause.category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={() => onInsert(clause.source)}
                >
                  Insertar
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{clause.description}</p>
              {clause.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {clause.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-primary/5 text-primary rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </TabsContent>

      {/* Suggestions Tab */}
      <TabsContent value="suggestions" className="flex-1 overflow-y-auto p-3 space-y-2">
        {suggestions.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">
            {currentMdx ? 'Sin sugerencias disponibles' : 'Edita el MDX para obtener sugerencias'}
          </div>
        ) : (
          suggestions.map(clause => (
            <div
              key={clause.id}
              className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800/50 hover:border-amber-400 transition-all space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                    {clause.title}
                  </h4>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={() => onInsert(clause.source)}
                >
                  Insertar
                </Button>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-200 line-clamp-2">
                {clause.description}
              </p>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
