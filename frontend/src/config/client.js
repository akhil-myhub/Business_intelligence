// Client-side tunables. Centralised so timeouts and cadences are reviewed in one place.
export const clientConfig = Object.freeze({
  query: {
    totalTimeoutMs: 25_000, // hard ceiling for one question, then the UI shows an error with retry
    idleTimeoutMs: 8_000 // max silence between stream events (server heartbeats every 10s keep proxies alive)
  },
  geo: { timeoutMs: 10_000, retries: 2, backoffMs: 600 }
});
