// Client-side tunables. Centralised so timeouts and cadences are reviewed in one place.
export const clientConfig = Object.freeze({
  query: {
    totalTimeoutMs: 25_000, // hard ceiling for one question, then we fall back to local insights
    idleTimeoutMs: 8_000 // max silence between stream events (server heartbeats every 10s keep proxies alive)
  },
  live: { intervalMs: 2_500 },
  geo: { timeoutMs: 10_000, retries: 2, backoffMs: 600 },
  logs: { endpoint: '/api/logs', flushMs: 5_000, maxBatch: 20, maxPerMinute: 30, dedupeMs: 10_000 }
});
