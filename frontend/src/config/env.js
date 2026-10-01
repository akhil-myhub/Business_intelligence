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
  service: 'businessai',
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
  heartbeatMs: num(process.env.SSE_HEARTBEAT_MS, 10_000, 1000, 60_000),
  // Live sales simulator (replaced by the real event stream once the backend exists)
  liveTickMs: num(process.env.LIVE_TICK_MS, 2000, 200, 60_000),
  liveSpeedup: num(process.env.LIVE_SPEEDUP, 40, 1, 5000), // 1 = real time; >1 compresses business time so the demo visibly moves
  // Authentication
  sessionTtlSec: num(process.env.SESSION_TTL_SEC, 8 * 3600, 300, 30 * 86400),
  loginRatePerMin: num(process.env.LOGIN_RATE_PER_MIN, 10, 1, 1000)
});
