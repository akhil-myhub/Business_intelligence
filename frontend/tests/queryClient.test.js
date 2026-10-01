import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseFrame, runQuery } from '@/services/queryClient';

afterEach(() => vi.restoreAllMocks());

const sse = chunks => new Response(new ReadableStream({
  start(c) {
    chunks.forEach(x => c.enqueue(new TextEncoder().encode(x)));
    c.close();
  }
}), { status: 200, headers: { 'x-request-id': 'req-123' } });

describe('parseFrame', () => {
  it('parses events, ignores heartbeats and bad JSON', () => {
    expect(parseFrame('event: step\ndata: {"index":2}')).toEqual({ event: 'step', data: { index: 2 } });
    expect(parseFrame(': ping')).toBeNull();
    expect(parseFrame('event: x\ndata: {nope')).toBeNull();
  });
});

describe('runQuery', () => {
  it('streams steps and returns the live result', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse([
      'event: step\ndata: {"index":0}\n\n: ping\n\n',
      'event: step\ndata: {"index":1}\n\nevent: res',
      'ult\ndata: {"region":"South India"}\n\n'
    ]));
    const steps = [];
    const out = await runQuery('q', { onStep: i => steps.push(i) });
    expect(steps).toEqual([0, 1]);
    expect(out).toMatchObject({ source: 'stream', requestId: 'req-123', data: { region: 'South India' } });
  });

  it('degrades to local insights (and says so) when the service is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network'));
    const out = await runQuery('q', { onStep() {} });
    expect(out.source).toBe('fallback');
    expect(out.data.kpis.revenue).toBeGreaterThan(0);
  });

  it('flags rate limiting distinctly', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 429 }));
    expect((await runQuery('q', { onStep() {} })).reason).toBe('rate_limited');
  });

  it('degrades when the stream errors mid-way instead of hanging', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse(['event: error\ndata: {"message":"boom"}\n\n']));
    expect((await runQuery('q', { onStep() {} })).source).toBe('fallback');
  });

  it('rejects (does not fall back) when the caller cancels', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
    }));
    const ctrl = new AbortController();
    const p = runQuery('q', { onStep() {}, signal: ctrl.signal });
    ctrl.abort(new Error('user'));
    await expect(p).rejects.toThrow('user');
  });
});
