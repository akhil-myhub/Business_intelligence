import { cookies } from 'next/headers';
import { authConfig } from '@/config/auth';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// The signed-in user for Server Components (the proxy already redirects signed-out visitors,
// this is the authoritative check next to the data it protects).
export async function getServerUser() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value, authConfig.secret);
  return session ? { name: session.name, email: session.email, role: session.role } : null;
}
