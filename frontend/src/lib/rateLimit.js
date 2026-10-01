// Fixed-window rate limiter. In-memory and per instance: fine for a single node and as a
// safety net behind a gateway; swap `store` for Redis (INCR + EXPIRE) when running many replicas.

const MAX_KEYS = 10_000; // hard memory cap so a flood of unique IPs cannot grow the map unbounded

export function createRateLimiter({ limit, windowMs = 60_000, now = Date.now } = {}) {
  const store = new Map();

  function sweep(t) {
    for (const [k, v] of store) if (t >= v.reset) store.delete(k);
  }

  return {
    check(key) {
      const t = now();
      let slot = store.get(key);
      if (!slot || t >= slot.reset) {
        if (store.size >= MAX_KEYS) { sweep(t); if (store.size >= MAX_KEYS) store.clear(); }
        slot = { count: 0, reset: t + windowMs };
        store.set(key, slot);
      }
      slot.count++;
      const allowed = slot.count <= limit;
      return { allowed, remaining: Math.max(0, limit - slot.count), retryAfterSec: allowed ? 0 : Math.max(1, Math.ceil((slot.reset - t) / 1000)) };
    },
    size: () => store.size
  };
}
