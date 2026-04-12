import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

import LandingClient from './LandingClient'

export default async function RootPage() {
  const session = await auth()
  
  if (session?.accessToken) {
    redirect('/dashboard')
  }

  return <LandingClient />
}
