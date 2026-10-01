// Signed session tokens: base64url(payload).HMAC-SHA256. Uses Web Crypto only, so the same code
// runs in route handlers (Node) and in proxy.js (edge). Verification is constant-time.

export const SESSION_COOKIE = 'businessai_session';

const enc = new TextEncoder();

const toB64u = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64u = str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

const hmacKey = (secret, usages) => crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usages);

export async function signSession(payload, secret) {
  const body = toB64u(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret, ['sign']), enc.encode(body));
  return `${body}.${toB64u(new Uint8Array(sig))}`;
}

// Returns the payload, or null for anything missing, tampered with, malformed or expired.
export async function verifySession(token, secret) {
  try {
    if (!token || !secret) return null;
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret, ['verify']), fromB64u(sig), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64u(body)));
    return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

export function readCookie(header, name) {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

export function cookieHeader(value, { maxAge, secure }) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}
