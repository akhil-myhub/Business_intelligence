// Network primitives: every request has a timeout, retries are bounded with exponential backoff,
// and only retryable failures (network, timeout, 5xx, 429) are retried.

export class HttpError extends Error {
  constructor(status, message) {
    super(message ?? `HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }

  get retryable() {
    return this.status >= 500 || this.status === 429 || this.status === 408;
  }
}

// True while the page is being closed/reloaded: the browser kills in-flight requests, which is not an error worth logging.
let unloading = false;
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => { unloading = true; });
  window.addEventListener('pageshow', () => { unloading = false; }); // restored from the back/forward cache
}
export const isUnloading = () => unloading;

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) return reject(signal.reason);
  const onAbort = () => { clearTimeout(t); reject(signal.reason); };
  const t = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
  signal?.addEventListener('abort', onAbort, { once: true });
});

export function withTimeout(promise, ms, label = 'operation') {
  let t;
  const timeout = new Promise((_, reject) => { t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

export async function fetchWithTimeout(url, { timeoutMs = 10_000, signal, ...init } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error(`request timed out after ${timeoutMs}ms`)), timeoutMs);
  const relay = () => ctrl.abort(signal.reason);
  if (signal?.aborted) relay(); else signal?.addEventListener('abort', relay, { once: true });
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
    signal?.removeEventListener('abort', relay);
  }
}

export async function fetchJson(url, { retries = 2, backoffMs = 500, timeoutMs = 10_000, signal } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { timeoutMs, signal });
      if (!res.ok) throw new HttpError(res.status);
      return await res.json();
    } catch (err) {
      const retryable = !(err instanceof HttpError) || err.retryable;
      if (signal?.aborted || !retryable || attempt >= retries) throw err;
      await sleep(backoffMs * 2 ** attempt, signal);
    }
  }
}
