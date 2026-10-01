import { NextResponse } from 'next/server';
import { authConfig } from '@/config/auth';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Runs before every matched request (`proxy` replaces the deprecated `middleware` convention).
//  1. Guarantees an x-request-id so server logs, client logs and upstream calls correlate end to end.
//  2. Guards pages: signed-out visitors go to /login (and back to where they were headed afterwards),
//     signed-in users never see /login. API routes enforce their own auth and return 401 JSON.
const ID_RE = /^[\w-]{8,64}$/;

// Only same-site relative paths are honoured as a post-login destination (no open redirects).
const safeNext = value => (value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/login') ? value : '/');

export async function proxy(request) {
  const incoming = request.headers.get('x-request-id');
  const requestId = incoming && ID_RE.test(incoming) ? incoming : crypto.randomUUID();
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, authConfig.secret);
    if (!session && pathname !== '/login') {
      const url = new URL('/login', request.url);
      if (pathname !== '/') url.searchParams.set('next', pathname + search);
      const res = NextResponse.redirect(url);
      res.headers.set('x-request-id', requestId);
      return res;
    }
    if (session && pathname === '/login') {
      const res = NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get('next')), request.url));
      res.headers.set('x-request-id', requestId);
      return res;
    }
  }

  const headers = new Headers(request.headers);
  headers.set('x-request-id', requestId);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets/|geo/|icon.svg|favicon.ico).*)']
};
