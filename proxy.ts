import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isLandingPage = pathname === '/'
  const isApiRoute = pathname.startsWith('/api')

  if (isApiRoute) return NextResponse.next()

  if (!isLoggedIn && !isLandingPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isLoggedIn && isLandingPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
