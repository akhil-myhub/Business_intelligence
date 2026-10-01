import { createLogger } from './logger';

// Route-handler wrapper: request id propagation, access log, uniform error envelope, no leaks.
//   export const GET = withRoute('name', async (req, { requestId, log, ip, session }) => Response, { auth: true })
// `auth: true` rejects requests without a valid session (401) before the handler runs.
// State-changing methods must come from our own origin (CSRF defence in depth on top of SameSite=Lax).

const ID_RE = /^[\w-]{8,64}$/;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getRequestId(request) {
  const incoming = request.headers.get('x-request-id');
  return incoming && ID_RE.test(incoming) ? incoming : crypto.randomUUID();
}

// X-Forwarded-For is only trustworthy behind your own proxy/load balancer — configure it to overwrite the header.
function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function jsonError(status, code, message, requestId, headers = {}) {
  return Response.json({ error: { code, message, requestId } }, { status, headers: { 'x-request-id': requestId, 'cache-control': 'no-store', ...headers } });
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser clients (curl, server-to-server) don't send Origin
  try { return new URL(origin).host === (request.headers.get('x-forwarded-host') ?? request.headers.get('host')); } catch { return false; }
}

export function withRoute(name, handler, { auth = false } = {}) {
  return async function route(request, routeCtx) {
    const requestId = getRequestId(request);
    const log = createLogger({ requestId, route: name });
    const started = performance.now();
    const path = new URL(request.url).pathname;
    const done = response => {
      response.headers.set('x-request-id', requestId);
      log.info('request', { method: request.method, path, status: response.status, durationMs: Math.round(performance.now() - started) });
      return response;
    };
    try {
      if (!SAFE_METHODS.has(request.method) && !sameOrigin(request)) return done(jsonError(403, 'BAD_ORIGIN', 'Cross-origin request blocked.', requestId));
      let session = null;
      if (auth) {
        const { getSession } = await import('@/server/auth'); // lazy: keeps non-auth routes light
        session = await getSession(request);
        if (!session) return done(jsonError(401, 'UNAUTHENTICATED', 'Please sign in.', requestId));
      }
      return done(await handler(request, { requestId, log, ip: getClientIp(request), session, routeCtx }));
    } catch (err) {
      log.error('request_failed', { method: request.method, path, durationMs: Math.round(performance.now() - started), err });
      return jsonError(500, 'INTERNAL', 'Something went wrong. Please try again.', requestId);
    }
  };
}
