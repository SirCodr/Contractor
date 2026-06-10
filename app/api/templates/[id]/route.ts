import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { getMdxTemplateContent, updateMdxTemplate, deleteMdxTemplate } from '@/lib/google-drive'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const template = await getMdxTemplateContent(session.accessToken, id)
    return NextResponse.json(template)
  } catch (error) {
    console.error(`[API GET /api/templates/[id]]`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { source } = await req.json()

    if (!source) {
      return NextResponse.json({ error: 'source field required' }, { status: 400 })
    }

    const result = await updateMdxTemplate(session.accessToken, id, source)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API PUT /api/templates/[id]]`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const result = await deleteMdxTemplate(session.accessToken, id)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API DELETE /api/templates/[id]]`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
