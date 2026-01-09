import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect root to admin
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
}

export const config = {
  matcher: '/',
}
