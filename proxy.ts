import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isLandingPage = pathname === '/'

  if (!isLoggedIn && !isLandingPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isLoggedIn && isLandingPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
