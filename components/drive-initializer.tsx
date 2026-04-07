import { auth } from '@/lib/auth'
import { initRootStructure } from '@/lib/google-drive'

/**
 * Server Component that silently initializes the Drive folder structure
 * on the user's first dashboard visit. Renders nothing — just a side effect.
 *
 * Must be rendered inside a Server Component (not 'use client' context).
 */
export default async function DriveInitializer() {
  const session = await auth()
  if (!session?.accessToken) return null

  try {
    await initRootStructure(session.accessToken)
  } catch (error) {
    // Non-fatal: folder may already exist or API may be temporarily unavailable
    console.error('[DriveInitializer] Could not init Drive structure:', error)
  }

  return null
}
