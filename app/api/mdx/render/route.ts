import { NextResponse } from 'next/server'
import { compileMdx } from '@/lib/mdx/compile'

export async function POST(req: Request) {
  try {
    const { source, scope } = await req.json()

    if (!source) {
      return NextResponse.json({ error: 'source required' }, { status: 400 })
    }

    // Solo compilar para validar sintaxis
    const { frontmatter } = await compileMdx(source, scope || {})

    return NextResponse.json({ frontmatter, valid: true }, { status: 200 })
  } catch (error) {
    console.error('[API POST /api/mdx/render]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Compilation error', valid: false },
      { status: 400 }
    )
  }
}
