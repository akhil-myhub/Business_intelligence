import { env } from '@/config/env';
import { loadInsights, pipeline } from '@/server/insights';
import { createRateLimiter } from '@/lib/rateLimit';
import { validateQuery } from '@/lib/validation';
import { jsonError, withRoute } from '@/lib/request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limiter = createRateLimiter({ limit: env.queryRatePerMin });
const enc = new TextEncoder();

// Abortable sleep: resolves early (false) when the client disconnects so we stop doing work.
const sleep = (ms, signal) => new Promise(resolve => {
  if (signal.aborted) return resolve(false);
  const t = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(true); }, ms);
  const onAbort = () => { clearTimeout(t); resolve(false); };
  signal.addEventListener('abort', onAbort, { once: true });
});

// GET /api/query?q=...  ->  text/event-stream
//   event: step   data: {index, id, title, detail}
//   event: result data: Insights
//   event: error  data: {code, message, requestId}
//   `: ping` comment lines every heartbeatMs keep proxies/load balancers from closing idle streams.
export const GET = withRoute('query', async (request, { requestId, log, ip }) => {
  const rate = limiter.check(ip);
  if (!rate.allowed) {
    log.warn('rate_limited', { ip, retryAfterSec: rate.retryAfterSec });
    return jsonError(429, 'RATE_LIMITED', 'Too many requests. Please slow down.', requestId, { 'retry-after': String(rate.retryAfterSec) });
  }

  const parsed = validateQuery(new URL(request.url).searchParams.get('q'), env.queryMaxLength);
  if (!parsed.ok) return jsonError(400, parsed.code, parsed.message, requestId);

  const { signal } = request;
  const startedAt = performance.now();
  let heartbeat;
  log.info('stream_start', { queryLength: parsed.value.length }); // never log the query text itself (may contain PII)

  const stream = new ReadableStream({
    async start(controller) {
      let outcome = 'ok';
      const send = (event, data) => controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      heartbeat = setInterval(() => { try { controller.enqueue(enc.encode(': ping\n\n')); } catch { clearInterval(heartbeat); } }, env.heartbeatMs);
      try {
        for (let i = 0; i < pipeline.length; i++) {
          send('step', { index: i, ...pipeline[i] });
          if (!(await sleep(env.stepDelayMs, signal))) { outcome = 'client_aborted'; return; }
        }
        send('result', await loadInsights(parsed.value, { signal }));
      } catch (err) {
        outcome = signal.aborted ? 'client_aborted' : 'error';
        if (outcome === 'error') {
          log.error('stream_failed', { err });
          try { send('error', { code: 'UPSTREAM_FAILED', message: 'Could not generate insights.', requestId }); } catch { /* stream already closed */ }
        }
      } finally {
        clearInterval(heartbeat);
        log.info('stream_end', { outcome, durationMs: Math.round(performance.now() - startedAt) });
        try { controller.close(); } catch { /* already closed by cancel() */ }
      }
    },
    cancel() { clearInterval(heartbeat); }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no' // stop nginx from buffering the stream
    }
  });
});
