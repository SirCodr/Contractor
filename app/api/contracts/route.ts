import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { listAllContractsAction, createContractAction } from '@/app/actions/drive'
import type { ContractFormData } from '@/types/contract'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contracts = await listAllContractsAction()
    return NextResponse.json(contracts)
  } catch (error) {
    console.error('[API GET /api/contracts]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ContractFormData = await req.json()
    const result = await createContractAction(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[API POST /api/contracts]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
