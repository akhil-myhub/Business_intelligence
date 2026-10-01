import { clientConfig } from '@/config/client';
import { HttpError, fetchWithTimeout, sleep, withTimeout } from '@/lib/http';
import { createLogger } from '@/lib/logger';
import { getInsights, pipeline } from '@/data/mock';

const log = createLogger({ module: 'queryClient' });

// Parse one SSE frame ("event: x\ndata: {...}"); comment/heartbeat lines (": ping") are ignored.
export function parseFrame(frame) {
  let event = 'message';
  const data = [];
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trim());
  }
  if (!data.length) return null;
  try { return { event, data: JSON.parse(data.join('\n')) }; } catch { return null; }
}

async function readStream(res, { onStep, idleMs }) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      // A stalled connection must never leave the UI spinning forever: fail fast after idleMs of silence.
      const { value, done } = await withTimeout(reader.read(), idleMs, 'stream');
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx = buf.indexOf('\n\n');
      while (idx >= 0) {
        const msg = parseFrame(buf.slice(0, idx));
        buf = buf.slice(idx + 2);
        if (msg?.event === 'step') onStep?.(msg.data.index);
        else if (msg?.event === 'result') return msg.data;
        else if (msg?.event === 'error') throw new Error(msg.data?.message || 'stream error');
        idx = buf.indexOf('\n\n');
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  throw new Error('stream ended without a result');
}

/**
 * Ask a question. Streams pipeline progress via onStep and resolves with { data, source }.
 * source = 'stream'   live service answered
 *          'fallback' service unavailable → local dataset, flagged so the UI can tell the user
 * Rejects only when the caller aborts via `signal`.
 */
export async function runQuery(query, { onStep, signal } = {}) {
  const { totalTimeoutMs, idleTimeoutMs } = clientConfig.query;
  const ctrl = new AbortController();
  const total = setTimeout(() => ctrl.abort(new Error(`query exceeded ${totalTimeoutMs}ms`)), totalTimeoutMs);
  const relay = () => ctrl.abort(signal.reason);
  signal?.addEventListener('abort', relay, { once: true });
  const started = performance.now();
  let requestId;

  try {
    const res = await fetchWithTimeout('/api/query?q=' + encodeURIComponent(query), { timeoutMs: 6_000, signal: ctrl.signal });
    requestId = res.headers.get('x-request-id') ?? undefined;
    if (!res.ok || !res.body) throw new HttpError(res.status);
    const data = await readStream(res, { onStep, idleMs: idleTimeoutMs });
    log.info('query_ok', { requestId, durationMs: Math.round(performance.now() - started) });
    return { data, source: 'stream', requestId };
  } catch (err) {
    if (signal?.aborted) throw err; // the user cancelled — not a failure
    log.warn('query_degraded', { requestId, status: err.status, err, durationMs: Math.round(performance.now() - started) });
    for (let i = 0; i < pipeline.length; i++) {
      onStep?.(i);
      await sleep(450, signal);
    }
    return { data: getInsights(query), source: 'fallback', requestId, reason: err.status === 429 ? 'rate_limited' : 'unavailable' };
  } finally {
    clearTimeout(total);
    signal?.removeEventListener('abort', relay);
  }
}
