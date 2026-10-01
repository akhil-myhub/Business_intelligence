import { withRoute } from '@/lib/request';
import { clearSessionCookie } from '@/server/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/auth/logout — clears the session cookie (idempotent).
export const POST = withRoute('auth-logout', async (_request, { log }) => {
  log.info('logout');
  return new Response(null, { status: 204, headers: { 'set-cookie': clearSessionCookie(), 'cache-control': 'no-store' } });
});
