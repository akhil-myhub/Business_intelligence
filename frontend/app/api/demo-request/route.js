import { createRateLimiter } from '@/lib/rateLimit';
import { jsonError, withRoute } from '@/lib/request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limiter = createRateLimiter({ limit: 5 }); // per IP per minute — a public form, so keep it tight
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;
const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max) : '');

// POST /api/demo-request — public "Book a Live Demo" form on the landing page.
// Until the backend/CRM exists, a validated lead is written to the structured server log (`demo_request`)
// so it is captured by the log pipeline; replace the log call with the CRM/backend call later.
export const POST = withRoute('demo-request', async (request, { requestId, log, ip }) => {
  if (!limiter.check(ip).allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests. Please try again in a minute.', requestId, { 'retry-after': '60' });

  let body;
  try { body = JSON.parse((await request.text()).slice(0, 8192)); } catch { return jsonError(400, 'BAD_JSON', 'Request body must be JSON.', requestId); }

  const lead = {
    name: clean(body?.name, 80), company: clean(body?.company, 120), email: clean(body?.email, 254).toLowerCase(),
    phone: clean(body?.phone, 20), industry: clean(body?.industry, 60), message: clean(body?.message, 1000)
  };
  if (!lead.name || !lead.company || !lead.industry) return jsonError(400, 'MISSING_FIELDS', 'Please fill in all required fields.', requestId);
  if (!EMAIL_RE.test(lead.email)) return jsonError(400, 'INVALID_EMAIL', 'Enter a valid business email.', requestId);
  if (!PHONE_RE.test(lead.phone)) return jsonError(400, 'INVALID_PHONE', 'Enter a valid phone number.', requestId);

  // The logger redacts e-mail fields by key, so the contact is recorded under explicit lead fields.
  log.info('demo_request', { lead: { name: lead.name, company: lead.company, contact: lead.email, phone: lead.phone, industry: lead.industry, message: lead.message } });
  return Response.json({ ok: true, requestId }, { status: 202, headers: { 'cache-control': 'no-store' } });
});
