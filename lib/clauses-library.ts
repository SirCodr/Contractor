/**
 * Lee el catálogo de cláusulas opcionales desde el filesystem.
 * Retorna metadata + source de cada cláusula disponible.
 */
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export type ClauseLibraryItem = {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  source: string
}

export async function getClausesLibrary(): Promise<ClauseLibraryItem[]> {
  const libraryDir = path.join(process.cwd(), 'content', 'clauses-library')
  
  try {
    const files = await fs.readdir(libraryDir)
    const mdxFiles = files.filter(f => f.endsWith('.mdx'))

    const clauses: ClauseLibraryItem[] = []
    
    for (const file of mdxFiles) {
      const filePath = path.join(libraryDir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const { data, content: source } = matter(content)

      clauses.push({
        id: data.id || file.replace('.mdx', ''),
        title: data.title || 'Sin título',
        category: data.category || 'Otros',
        description: data.description || '',
        tags: data.tags || [],
        source: source.trim(),
      })
    }

    return clauses.sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    console.error('[getClausesLibrary] Error reading clauses:', error)
    return []
  }
}

export async function getClauseById(id: string): Promise<ClauseLibraryItem | null> {
  const clauses = await getClausesLibrary()
  return clauses.find(c => c.id === id) || null
}
