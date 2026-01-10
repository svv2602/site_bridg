import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    // Require env vars to be set - no hardcoded defaults for security
    if (!validUsername || !validPassword) {
      console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    if (username !== validUsername || password !== validPassword) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      });
    }

    return NextResponse.next();
  } catch {
    return new NextResponse('Invalid authorization header', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
    });
  }
}

export const config = {
  matcher: '/admin/:path*',
};
