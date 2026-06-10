import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { getClausesLibrary } from '@/lib/clauses-library'

const SPANISH_STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'y', 'o', 'que', 'es', 'en', 'por', 'para',
  'con', 'a', 'al', 'se', 'su', 'este', 'esa', 'esto', 'lo', 'muy', 'más', 'menos', 'bien', 'mal', 'así', 'como',
  'si', 'aunque', 'siendo', 'según', 'mediante', 'durante', 'hasta', 'desde', 'sobre', 'ante', 'tras', 'entre',
])

function extractKeywords(text: string): Map<string, number> {
  // Extraer palabras de 4+ caracteres, sin stopwords
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || []
  const freq = new Map<string, number>()

  words.forEach(word => {
    if (!SPANISH_STOPWORDS.has(word)) {
      freq.set(word, (freq.get(word) || 0) + 1)
    }
  })

  return freq
}

function scoreClause(
  keywords: Map<string, number>,
  title: string,
  description: string,
  tags: string[]
): number {
  let score = 0

  // Title y description
  const clauseText = (title + ' ' + description).toLowerCase()
  keywords.forEach((freq, keyword) => {
    const titleMatches = (title.toLowerCase().match(new RegExp(keyword, 'g')) || []).length
    const descMatches = (description.toLowerCase().match(new RegExp(keyword, 'g')) || []).length
    score += (titleMatches * 3 + descMatches) * freq
  })

  // Tags (mayor peso si coinciden exactamente)
  keywords.forEach((freq, keyword) => {
    if (tags.some(tag => tag.includes(keyword))) {
      score += 5 * freq
    }
  })

  return score
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentMdx, context } = await req.json()

    // Si no hay MDX, devolver vacío
    if (!currentMdx || typeof currentMdx !== 'string') {
      return NextResponse.json({ suggestions: [] })
    }

    // Extraer keywords del MDX actual
    const keywords = extractKeywords(currentMdx)

    if (keywords.size === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // Obtener catálogo
    const allClauses = await getClausesLibrary()

    // Score cada cláusula
    const scored = allClauses.map(clause => ({
      ...clause,
      score: scoreClause(keywords, clause.title, clause.description, clause.tags),
    }))

    // Top 5 con score > 0
    const suggestions = scored
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score, ...clause }) => clause)

    return NextResponse.json({ suggestions, totalCount: allClauses.length })
  } catch (error) {
    console.error('[API POST /api/clauses-library/suggest]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
