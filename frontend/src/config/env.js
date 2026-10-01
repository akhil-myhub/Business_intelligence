// Server-side configuration. Every value is validated and clamped at startup so a bad
// environment variable degrades to a safe default instead of crashing or hanging a request.
// Never import this from client components (it reads process.env at runtime).

const num = (raw, fallback, min, max) => {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const oneOf = (raw, allowed, fallback) => (allowed.includes(raw) ? raw : fallback);

const nodeEnv = oneOf(process.env.NODE_ENV, ['development', 'production', 'test'], 'development');
const isProd = nodeEnv === 'production';

export const env = Object.freeze({
  service: 'lumen-bi',
  nodeEnv,
  isProd,
  version: process.env.APP_VERSION || 'dev',
  logLevel: oneOf(process.env.LOG_LEVEL, ['debug', 'info', 'warn', 'error', 'silent'], isProd ? 'info' : 'debug'),
  // Input limits
  queryMaxLength: num(process.env.QUERY_MAX_LENGTH, 500, 20, 5000),
  logBodyMaxBytes: num(process.env.LOG_BODY_MAX_BYTES, 16_384, 1024, 262_144),
  // Abuse protection (per client IP, per instance — use a shared store such as Redis when scaling out)
  queryRatePerMin: num(process.env.QUERY_RATE_PER_MIN, 30, 1, 10_000),
  logRatePerMin: num(process.env.LOG_RATE_PER_MIN, 120, 1, 10_000),
  // Streaming behaviour
  stepDelayMs: num(process.env.QUERY_STEP_DELAY_MS, isProd ? 700 : 900, 0, 10_000),
  heartbeatMs: num(process.env.SSE_HEARTBEAT_MS, 10_000, 1000, 60_000)
});
