import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseFrame, runQuery } from '@/services/queryClient';

afterEach(() => vi.restoreAllMocks());

const sse = (chunks, status = 200) => new Response(new ReadableStream({
  start(c) {
    chunks.forEach(x => c.enqueue(new TextEncoder().encode(x)));
    c.close();
  }
}), { status, headers: { 'x-request-id': 'req-123' } });

const quiet = () => { vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {}); };

describe('parseFrame', () => {
  it('parses events, ignores heartbeats and bad JSON', () => {
    expect(parseFrame('event: step\ndata: {"index":2}')).toEqual({ event: 'step', data: { index: 2 } });
    expect(parseFrame(': ping')).toBeNull();
    expect(parseFrame('event: x\ndata: {nope')).toBeNull();
  });
});

describe('runQuery', () => {
  it('streams steps and returns where the answer lives', async () => {
    quiet();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse([
      'event: step\ndata: {"index":0}\n\n: ping\n\n',
      'event: step\ndata: {"index":1}\n\nevent: res',
      'ult\ndata: {"intent":"dashboard","path":"/dashboard"}\n\n'
    ]));
    const steps = [];
    const out = await runQuery('q', { onStep: i => steps.push(i) });
    expect(steps).toEqual([0, 1]);
    expect(out).toMatchObject({ intent: 'dashboard', path: '/dashboard', requestId: 'req-123' });
  });

  it('rejects (no invented data) when the service is down', async () => {
    quiet();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network'));
    await expect(runQuery('q', { onStep() {} })).rejects.toThrow('network');
  });

  it('surfaces rate limiting with its status code', async () => {
    quiet();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 429 }));
    await expect(runQuery('q', { onStep() {} })).rejects.toMatchObject({ status: 429 });
  });

  it('rejects when the stream reports an error instead of hanging', async () => {
    quiet();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse(['event: error\ndata: {"message":"boom"}\n\n']));
    await expect(runQuery('q', { onStep() {} })).rejects.toThrow('boom');
  });

  it('rejects when the stream ends without a result', async () => {
    quiet();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse(['event: step\ndata: {"index":0}\n\n']));
    await expect(runQuery('q', { onStep() {} })).rejects.toThrow('without a result');
  });

  it('rejects promptly when the caller cancels', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
    }));
    const ctrl = new AbortController();
    const p = runQuery('q', { onStep() {}, signal: ctrl.signal });
    ctrl.abort(new Error('user'));
    await expect(p).rejects.toThrow('user');
  });
});
