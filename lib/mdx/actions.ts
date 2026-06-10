'use server'

import { buildMdxScope } from './scope'
import type { ContractFormValues } from '@/lib/schemas'

export async function validateMdxCompilation(
  source: string,
  formValues?: Partial<ContractFormValues>
): Promise<{ valid: boolean; error?: string }> {
  try {
    const scope = formValues ? buildMdxScope(formValues as ContractFormValues) : {}

    const res = await fetch('http://localhost:3000/api/mdx/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, scope }),
    })

    const data = await res.json()
    return { valid: data.valid, error: data.error }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
