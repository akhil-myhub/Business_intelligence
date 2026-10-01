import { withRoute } from '@/lib/request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/auth/me — the signed-in user (401 when the session is missing or expired).
export const GET = withRoute('auth-me', async (_request, { session }) => (
  Response.json({ user: { name: session.name, email: session.email, role: session.role } }, { headers: { 'cache-control': 'no-store' } })
), { auth: true });
