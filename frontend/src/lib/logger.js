// Isomorphic structured logger.
//  - Server: one JSON object per line on stdout/stderr (ready for Loki/ELK/CloudWatch/Datadog).
//  - Browser: readable console output; warn/error are batched to /api/logs so they reach the
//    same pipeline (rate limited + de-duplicated so a render loop can never flood the server).
// Secrets/PII are redacted by key name before anything is emitted.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };
const isServer = typeof window === 'undefined';
const isProd = process.env.NODE_ENV === 'production';

const configured = isServer ? process.env.LOG_LEVEL : process.env.NEXT_PUBLIC_LOG_LEVEL;
const threshold = LEVELS[configured] ?? (isProd ? LEVELS.info : LEVELS.debug);

const SENSITIVE = /pass(word)?|secret|token|authorization|cookie|api[-_]?key|e-?mail|session/i;
const MAX_DEPTH = 4;
const MAX_STRING = 1000;

export function redact(value, depth = 0) {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…[truncated]` : value;
  if (value instanceof Error) return serializeError(value);
  if (depth >= MAX_DEPTH) return '[depth-limit]';
  if (Array.isArray(value)) return value.slice(0, 20).map(v => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = SENSITIVE.test(k) ? '[redacted]' : redact(v, depth + 1);
    return out;
  }
  return String(value);
}

export function serializeError(err) {
  if (!(err instanceof Error)) return { message: String(err) };
  return {
    name: err.name,
    message: err.message,
    digest: err.digest,
    stack: isProd ? err.stack?.split('\n').slice(0, 6).join('\n') : err.stack,
    cause: err.cause ? serializeError(err.cause) : undefined
  };
}

/* ── browser transport ─────────────────────────────────────────── */
const queue = [];
const recent = new Map();
let sentThisMinute = 0, windowStart = 0, timer = null, installed = false;

function flush() {
  timer = null;
  if (!queue.length) return;
  const batch = queue.splice(0, 20);
  try {
    const body = JSON.stringify({ entries: batch });
    // sendBeacon survives page unloads; fall back to keepalive fetch. Failures are swallowed on purpose
    // (logging must never throw or recurse).
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/logs', new Blob([body], { type: 'application/json' })))) {
      fetch('/api/logs', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* noop */ }
  if (queue.length) timer = setTimeout(flush, 1000);
}

function enqueue(entry) {
  const now = Date.now();
  if (now - windowStart > 60_000) { windowStart = now; sentThisMinute = 0; }
  if (sentThisMinute >= 30) return;
  const key = `${entry.level}:${entry.message}`;
  if (now - (recent.get(key) ?? 0) < 10_000) return;
  recent.set(key, now);
  if (recent.size > 200) recent.clear();
  sentThisMinute++;
  queue.push(entry);
  if (!installed) {
    installed = true;
    addEventListener('pagehide', flush);
    addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
  }
  timer ??= setTimeout(flush, 5000);
}

/* ── core ──────────────────────────────────────────────────────── */
function emit(level, bindings, message, context) {
  if (LEVELS[level] < threshold) return;
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    service: 'lumen-bi',
    ...(isServer ? { env: process.env.NODE_ENV, version: process.env.APP_VERSION || 'dev' } : { source: 'browser', url: location.pathname }),
    ...redact(bindings),
    ...(context ? { ctx: redact(context) } : {})
  };
  if (isServer) {
    // console.* keeps this edge-runtime safe (proxy.js); the platform captures stdout/stderr.
    (level === 'error' || level === 'warn' ? console.error : console.log)(JSON.stringify(entry));
    return;
  }
  const fn = console[level === 'debug' ? 'debug' : level] ?? console.log;
  fn(`[${level}] ${message}`, entry.ctx ?? '');
  if (level === 'warn' || level === 'error') enqueue({ level, message: String(message), context: entry.ctx, ts: entry.ts, url: entry.url });
}

export function createLogger(bindings = {}) {
  const log = level => (message, context) => emit(level, bindings, message, context);
  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: (message, context) => emit('error', bindings, message, context),
    child: extra => createLogger({ ...bindings, ...extra })
  };
}

export const logger = createLogger();
