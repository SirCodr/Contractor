import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { getClausesLibrary } from '@/lib/clauses-library'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clauses = await getClausesLibrary()
    return NextResponse.json(clauses)
  } catch (error) {
    console.error('[API GET /api/clauses-library]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
