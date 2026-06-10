import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { listMdxTemplates, listDocTemplates, createMdxTemplate } from '@/lib/google-drive'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [mdxTemplates, docTemplates] = await Promise.all([
      listMdxTemplates(session.accessToken),
      listDocTemplates(session.accessToken),
    ])

    // Normalize to a common shape; MDX templates have sourceType 'mdx', docs have 'doc'
    const normalized = [
      ...mdxTemplates.map((t) => ({ ...t, sourceType: 'mdx' as const })),
      ...docTemplates,
    ]
    // Sort by createdTime desc
    normalized.sort((a, b) =>
      (b.createdTime ?? '').localeCompare(a.createdTime ?? ''),
    )

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('[API GET /api/templates]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, name } = await req.json()

    if (action === 'duplicate-base') {
      // Lee la plantilla base del repo y duplica en Drive del usuario
      const templatePath = path.join(process.cwd(), 'content', 'templates', 'contrato-base-ley820.mdx')
      const source = await fs.readFile(templatePath, 'utf-8')
      const newName = name || 'Contrato - Ley 820 (copia)'

      const result = await createMdxTemplate(session.accessToken, newName, source)
      return NextResponse.json(result, { status: 201 })
    }

    if (action === 'create-from-wizard') {
      // Crea plantilla desde wizard duplicando la base con nombre personalizado
      const templatePath = path.join(process.cwd(), 'content', 'templates', 'contrato-base-ley820.mdx')
      const source = await fs.readFile(templatePath, 'utf-8')
      const newName = name || 'Nueva plantilla'

      const result = await createMdxTemplate(session.accessToken, newName, source)
      return NextResponse.json(result, { status: 201 })
    }

    if (action === 'create') {
      // Crea una plantilla nueva vacía
      const newName = name || 'Nueva plantilla'
      const source = `---
name: "${newName}"
version: 1
description: "Plantilla personalizada"
---

# Plantilla personalizada

Comienza a editar tu plantilla aquí...`

      const result = await createMdxTemplate(session.accessToken, newName, source)
      return NextResponse.json(result, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[API POST /api/templates]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
