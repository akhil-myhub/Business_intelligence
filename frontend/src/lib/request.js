import { createLogger } from './logger';

// Route-handler wrapper: request id propagation, access log, uniform error envelope, no leaks.
// Usage: export const GET = withRoute('query', async (req, ctx) => Response)

const ID_RE = /^[\w-]{8,64}$/;

export function getRequestId(request) {
  const incoming = request.headers.get('x-request-id');
  return incoming && ID_RE.test(incoming) ? incoming : crypto.randomUUID();
}

// X-Forwarded-For is only trustworthy behind your own proxy/load balancer — configure it to overwrite the header.
export function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function jsonError(status, code, message, requestId, headers = {}) {
  return Response.json({ error: { code, message, requestId } }, { status, headers: { 'x-request-id': requestId, 'cache-control': 'no-store', ...headers } });
}

export function withRoute(name, handler) {
  return async function route(request, routeCtx) {
    const requestId = getRequestId(request);
    const log = createLogger({ requestId, route: name });
    const started = performance.now();
    const path = new URL(request.url).pathname;
    try {
      const response = await handler(request, { requestId, log, ip: getClientIp(request), routeCtx });
      response.headers.set('x-request-id', requestId);
      log.info('request', { method: request.method, path, status: response.status, durationMs: Math.round(performance.now() - started) });
      return response;
    } catch (err) {
      log.error('request_failed', { method: request.method, path, durationMs: Math.round(performance.now() - started), err });
      return jsonError(500, 'INTERNAL', 'Something went wrong. Please try again.', requestId);
    }
  };
}
