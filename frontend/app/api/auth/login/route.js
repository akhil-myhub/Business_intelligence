import { env } from '@/config/env';
import { createRateLimiter } from '@/lib/rateLimit';
import { jsonError, withRoute } from '@/lib/request';
import { authConfigured, checkCredentials, createSessionCookie, demoUser } from '@/server/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limiter = createRateLimiter({ limit: env.loginRatePerMin });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/login  { email, password }  ->  sets the HttpOnly session cookie
export const POST = withRoute('auth-login', async (request, { requestId, log, ip }) => {
  const rate = limiter.check(ip);
  if (!rate.allowed) {
    log.warn('login_rate_limited', { ip });
    return jsonError(429, 'RATE_LIMITED', 'Too many sign-in attempts. Try again in a minute.', requestId, { 'retry-after': String(rate.retryAfterSec) });
  }
  if (!authConfigured()) {
    log.error('auth_not_configured');
    return jsonError(503, 'AUTH_NOT_CONFIGURED', 'Sign-in is not configured on this server.', requestId);
  }

  let body;
  try { body = JSON.parse((await request.text()).slice(0, 4096)); } catch { return jsonError(400, 'BAD_JSON', 'Request body must be JSON.', requestId); }
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!EMAIL_RE.test(email) || email.length > 254) return jsonError(400, 'INVALID_EMAIL', 'Enter a valid email address.', requestId);
  if (!password || password.length > 200) return jsonError(400, 'INVALID_PASSWORD', 'Enter your password.', requestId);

  if (!(await checkCredentials(email, password))) {
    log.warn('login_failed', { ip }); // never log the email or password
    await new Promise(r => setTimeout(r, 400)); // blunt brute force
    return jsonError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.', requestId);
  }

  log.info('login_ok', { ip });
  const { id, ...user } = demoUser();
  return Response.json({ user }, { headers: { 'set-cookie': await createSessionCookie(body.remember === true), 'cache-control': 'no-store' } });
});
