import { describe, expect, it } from 'vitest';
import { cookieHeader, readCookie, signSession, verifySession } from '@/lib/session';
import { interpret } from '@/server/nlq';
import { getView } from '@/server/analytics';
import { DEFAULT_FILTERS, parseFilters } from '@/lib/filters';

const SECRET = 'a'.repeat(40);
const future = () => Math.floor(Date.now() / 1000) + 600;

describe('session tokens', () => {
  it('round-trips a valid token', async () => {
    const token = await signSession({ sub: 'u1', exp: future() }, SECRET);
    expect(await verifySession(token, SECRET)).toMatchObject({ sub: 'u1' });
  });

  it('rejects tampering, wrong secret, expiry and garbage', async () => {
    const token = await signSession({ sub: 'u1', role: 'Analyst', exp: future() }, SECRET);
    const [body, sig] = token.split('.');
    const forged = btoa(JSON.stringify({ sub: 'u1', role: 'Admin', exp: future() })).replace(/=+$/, '');
    expect(await verifySession(`${forged}.${sig}`, SECRET)).toBeNull();
    expect(await verifySession(token, 'b'.repeat(40))).toBeNull();
    expect(await verifySession(await signSession({ sub: 'u1', exp: 1 }, SECRET), SECRET)).toBeNull();
    expect(await verifySession('nope', SECRET)).toBeNull();
    expect(await verifySession(`${body}.`, SECRET)).toBeNull();
    expect(await verifySession(undefined, SECRET)).toBeNull();
  });

  it('parses cookies and builds a hardened Set-Cookie', () => {
    expect(readCookie('a=1; businessai_session=tok; b=2', 'businessai_session')).toBe('tok');
    const c = cookieHeader('tok', { maxAge: 60, secure: true });
    expect(c).toContain('HttpOnly');
    expect(c).toContain('SameSite=Lax');
    expect(c).toContain('Secure');
  });
});

describe('filters', () => {
  it('falls back to defaults for unknown values', () => {
    const f = parseFilters(k => ({ region: 'Mars', period: 'Last Year', product: 'Product Z' })[k]);
    expect(f).toEqual({ ...DEFAULT_FILTERS, period: 'Last Year' });
  });
});

describe('question understanding', () => {
  const go = q => interpret(q).path;
  it('routes questions to the screen that answers them', () => {
    expect(go('Show sales trend')).toMatch(/^\/dashboard/);
    expect(go('Top performing products')).toBe('/products');
    expect(go('Market analysis')).toMatch(/^\/market/);
    expect(go('Campaign ROI analysis')).toMatch(/^\/campaigns/);
    expect(go('Export a pdf report')).toBe('/reports');
  });
  it('extracts region, period, product and state', () => {
    expect(go('Show sales in North India last 6 months')).toMatch(/region=North\+India/);
    expect(go('Show sales in North India last 6 months')).toMatch(/period=Last\+6\+Months/);
    expect(go('How is Product C doing')).toBe('/products/c');
    expect(go('How is Karnataka performing?')).toBe('/stores/karnataka');
  });
  it('treats "why" questions as a diagnosis', () => {
    const r = interpret('Why did sales drop in West India?');
    expect(r.intent).toBe('diagnosis');
    expect(r.path).toMatch(/region=West\+India/);
    expect(r.path).toMatch(/q=/);
  });
});

describe('analytics views', () => {
  it('overview diagnosis explains movement with drivers', () => {
    const v = getView('overview', DEFAULT_FILTERS, { q: 'why did sales drop' });
    expect(v.insight.headline).toMatch(/Why sales/);
    expect(v.insight.drivers.length).toBeGreaterThan(2);
  });
  it('returns null for unknown state/product ids', () => {
    expect(getView('drill', DEFAULT_FILTERS, { state: 'atlantis' })).toBeNull();
    expect(getView('product', DEFAULT_FILTERS, { id: 'zz' })).toBeNull();
  });
  it('drill-down parts reconcile with the state total', () => {
    const v = getView('drill', DEFAULT_FILTERS, { state: 'tamil-nadu' });
    expect(v.stores.reduce((a, s) => a + s.revenue, 0)).toBeCloseTo(v.total, 1);
    expect(v.channels.reduce((a, c) => a + c.value, 0)).toBeGreaterThan(99);
  });
  it('dashboard states cover the map and the region ranking', () => {
    const v = getView('dashboard', { ...DEFAULT_FILTERS, period: 'Last 6 Months' });
    expect(v.states).toHaveLength(30);
    expect(v.top).toHaveLength(5);
    expect(v.top.every(s => s.inRegion)).toBe(true);
  });
});
