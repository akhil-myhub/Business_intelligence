import { describe, expect, it, vi } from 'vitest';
import { withRoute } from '@/lib/request';

const req = (headers = {}) => new Request('http://localhost/api/x', { headers });

describe('withRoute', () => {
  it('propagates a valid incoming request id and sets it on the response', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = await withRoute('t', async () => new Response('ok'))(req({ 'x-request-id': 'abc12345-def' }));
    expect(res.headers.get('x-request-id')).toBe('abc12345-def');
  });

  it('replaces a malformed id', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = await withRoute('t', async () => new Response('ok'))(req({ 'x-request-id': 'bad id!' }));
    expect(res.headers.get('x-request-id')).not.toBe('bad id!');
  });

  it('turns thrown errors into a safe 500 envelope without leaking details', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await withRoute('t', async () => { throw new Error('db password=hunter2'); })(req());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('INTERNAL');
    expect(JSON.stringify(body)).not.toContain('hunter2');
    expect(body.error.requestId).toBeTruthy();
  });
});
