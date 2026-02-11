import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory brute-force protection for Basic Auth
const failedAttempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 10;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkBruteForce(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (Date.now() < record.blockedUntil) return true;
  if (record.blockedUntil > 0) failedAttempts.delete(ip);
  return false;
}

function recordFailedAttempt(ip: string): void {
  const record = failedAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  record.count++;
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_DURATION_MS;
  }
  failedAttempts.set(ip, record);
}

export function middleware(request: NextRequest) {
  // Only protect admin routes and admin API routes
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin');
  if (!isAdmin && !isAdminApi) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

  if (checkBruteForce(ip)) {
    return new NextResponse('Too many failed attempts. Try again later.', { status: 429 });
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
      recordFailedAttempt(ip);
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      });
    }

    // Reset failed attempts on successful login
    failedAttempts.delete(ip);

    return NextResponse.next();
  } catch {
    return new NextResponse('Invalid authorization header', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
    });
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
