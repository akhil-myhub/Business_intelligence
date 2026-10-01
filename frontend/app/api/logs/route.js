import { env } from '@/config/env';
import { createRateLimiter } from '@/lib/rateLimit';
import { validateLogBatch } from '@/lib/validation';
import { jsonError, withRoute } from '@/lib/request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limiter = createRateLimiter({ limit: env.logRatePerMin });

// POST /api/logs — ingests browser warn/error batches into the server log stream so frontend
// failures are searchable next to backend ones. Size-capped, validated, rate limited, 204 on success.
export const POST = withRoute('client-logs', async (request, { requestId, log, ip }) => {
  if (!limiter.check(ip).allowed) return jsonError(429, 'RATE_LIMITED', 'Too many log batches.', requestId, { 'retry-after': '60' });

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > env.logBodyMaxBytes) return jsonError(413, 'PAYLOAD_TOO_LARGE', 'Log batch too large.', requestId);

  const text = await request.text();
  if (text.length > env.logBodyMaxBytes) return jsonError(413, 'PAYLOAD_TOO_LARGE', 'Log batch too large.', requestId);

  let body;
  try { body = JSON.parse(text); } catch { return jsonError(400, 'BAD_JSON', 'Body must be JSON.', requestId); }

  const parsed = validateLogBatch(body);
  if (!parsed.ok) return jsonError(400, 'BAD_LOG_BATCH', parsed.message, requestId);

  const clientLog = log.child({ source: 'browser', ip });
  for (const e of parsed.entries) clientLog[e.level](`client: ${e.message}`, { page: e.page, clientTs: e.clientTs, ...e.context });
  return new Response(null, { status: 204 });
});
