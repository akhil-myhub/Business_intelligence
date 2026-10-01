import { createRateLimiter } from '@/lib/rateLimit';
import { parseFilters } from '@/lib/filters';
import { jsonError, withRoute } from '@/lib/request';
import { getView } from '@/server/analytics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limiter = createRateLimiter({ limit: 600 }); // ~10 req/s per client — generous for a dashboard, blocks scrapers
const VIEWS = new Set(['overview', 'dashboard', 'drill', 'products', 'product', 'market', 'campaigns', 'report']);

// GET /api/data/<view>?region=&period=&product=&state=&id=&q=
// All parameters are validated against the shared vocabulary; unknown values fall back to defaults.
export const GET = withRoute('data', async (request, { requestId, log, ip, routeCtx }) => {
  if (!limiter.check(ip).allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests.', requestId, { 'retry-after': '10' });

  const { view } = await routeCtx.params;
  if (!VIEWS.has(view)) return jsonError(404, 'UNKNOWN_VIEW', 'Unknown data view.', requestId);

  const url = new URL(request.url);
  const get = k => url.searchParams.get(k);
  const filters = parseFilters(get);
  const started = performance.now();
  const data = getView(view, filters, { state: get('state') ?? undefined, id: get('id') ?? undefined, q: (get('q') ?? '').slice(0, 300) || undefined });
  if (!data) return jsonError(404, 'NOT_FOUND', 'No data for that selection.', requestId);

  log.debug('view_computed', { view, ...filters, computeMs: Math.round(performance.now() - started) });
  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}, { auth: true });
