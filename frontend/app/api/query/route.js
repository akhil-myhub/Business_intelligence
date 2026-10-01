import { env } from '@/config/env';
import { PIPELINE } from '@/lib/pipeline';
import { createRateLimiter } from '@/lib/rateLimit';
import { DEFAULT_FILTERS } from '@/lib/filters';
import { validateQuery } from '@/lib/validation';
import { jsonError, withRoute } from '@/lib/request';
import { getView } from '@/server/analytics';
import { interpret } from '@/server/nlq';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limiter = createRateLimiter({ limit: env.queryRatePerMin });
const enc = new TextEncoder();

// Abortable sleep: resolves false early when the client disconnects so we stop doing work.
const sleep = (ms, signal) => new Promise(resolve => {
  if (signal.aborted) return resolve(false);
  const onAbort = () => { clearTimeout(t); resolve(false); };
  const t = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(true); }, ms);
  signal.addEventListener('abort', onAbort, { once: true });
});

// GET /api/query?q=...  ->  text/event-stream
//   event: step   {index, id, title, detail}
//   event: result {intent, path, summary, preview}   <- where to go and what we found
//   event: error  {code, message, requestId}
// The stage pacing (`stepDelayMs`) is UX only; the interpretation and data lookup are real work.
export const GET = withRoute('query', async (request, { requestId, log, ip, session }) => {
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
  log.info('stream_start', { queryLength: parsed.value.length, user: session.sub }); // never log the question text (may contain PII)

  const stream = new ReadableStream({
    async start(controller) {
      let outcome = 'ok';
      const send = (event, data) => controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      heartbeat = setInterval(() => { try { controller.enqueue(enc.encode(': ping\n\n')); } catch { clearInterval(heartbeat); } }, env.heartbeatMs);
      try {
        send('step', { index: 0, ...PIPELINE[0] });
        const answer = interpret(parsed.value);
        if (!(await sleep(env.stepDelayMs, signal))) { outcome = 'client_aborted'; return; }

        send('step', { index: 1, ...PIPELINE[1] });
        const filters = { ...DEFAULT_FILTERS, ...answer.filters };
        const preview = getView('overview', filters, { q: parsed.value });
        if (!(await sleep(env.stepDelayMs, signal))) { outcome = 'client_aborted'; return; }

        for (const i of [2, 3]) {
          send('step', { index: i, ...PIPELINE[i] });
          if (!(await sleep(env.stepDelayMs, signal))) { outcome = 'client_aborted'; return; }
        }
        send('result', { intent: answer.intent, path: answer.path, summary: answer.summary, preview: { revenue: preview.kpis.revenue, region: filters.region, period: filters.period } });
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
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', 'x-accel-buffering': 'no' }
  });
}, { auth: true });
