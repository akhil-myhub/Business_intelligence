import { authConfig, authConfigured } from '@/config/auth';
import { env } from '@/config/env';
import { SESSION_COOKIE, cookieHeader, readCookie, signSession, verifySession } from '@/lib/session';

const enc = new TextEncoder();

// Compare two strings in constant time (hash both so length differences don't leak either).
async function safeEqual(a, b) {
  const [x, y] = await Promise.all([a, b].map(async s => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))));
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export { authConfigured };

export async function checkCredentials(email, password) {
  // evaluate both comparisons unconditionally so timing doesn't reveal which one failed
  const [okEmail, okPass] = await Promise.all([safeEqual(email.trim().toLowerCase(), authConfig.email.toLowerCase()), safeEqual(password, authConfig.password)]);
  return okEmail && okPass;
}

export const demoUser = () => ({ id: 'u1', name: 'Demo Analyst', email: authConfig.email, role: 'Analyst' });

const REMEMBER_TTL_SEC = 7 * 86400;

// `remember` keeps the user signed in for a week; otherwise the session lasts env.sessionTtlSec (default 8h).
export async function createSessionCookie(remember = false) {
  const user = demoUser();
  const ttl = remember ? REMEMBER_TTL_SEC : env.sessionTtlSec;
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const token = await signSession({ sub: user.id, name: user.name, email: user.email, role: user.role, exp }, authConfig.secret);
  return cookieHeader(token, { maxAge: ttl, secure: env.isProd });
}

export const clearSessionCookie = () => cookieHeader('', { maxAge: 0, secure: env.isProd });

export async function getSession(request) {
  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE);
  return verifySession(token, authConfig.secret);
}
