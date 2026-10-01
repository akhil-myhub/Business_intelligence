import { NextResponse } from 'next/server';

// Runs before every matched request. Its single job: guarantee each request carries an
// x-request-id so server logs, client logs and upstream calls can be correlated end to end.
// (`proxy` replaces the deprecated `middleware` file convention in this Next.js version.)
const ID_RE = /^[\w-]{8,64}$/;

export function proxy(request) {
  const incoming = request.headers.get('x-request-id');
  const requestId = incoming && ID_RE.test(incoming) ? incoming : crypto.randomUUID();
  const headers = new Headers(request.headers);
  headers.set('x-request-id', requestId);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets/|geo/|icon.svg|favicon.ico).*)']
};
