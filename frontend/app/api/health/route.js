import { env } from '@/config/env';
import { loadInsights } from '@/server/insights';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const startedAt = Date.now();

// GET /api/health        -> liveness  (process is up; used by container HEALTHCHECK / k8s livenessProbe)
// GET /api/health?deep=1 -> readiness (also exercises the data layer; used by readinessProbe / load balancer)
// Deliberately not wrapped by withRoute: probes hit this every few seconds and must not spam access logs.
export async function GET(request) {
  const deep = new URL(request.url).searchParams.has('deep');
  const checks = {};
  let ok = true;
  if (deep) {
    try { await loadInsights('health', { signal: AbortSignal.timeout(3000) }); checks.data = 'ok'; }
    catch { checks.data = 'fail'; ok = false; }
  }
  return Response.json(
    { status: ok ? 'ok' : 'degraded', version: env.version, uptimeSec: Math.round((Date.now() - startedAt) / 1000), checks },
    { status: ok ? 200 : 503, headers: { 'cache-control': 'no-store' } }
  );
}
