import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError, fetchJson, withTimeout } from '@/lib/http';

afterEach(() => vi.restoreAllMocks());
const res = (status, body = {}) => new Response(JSON.stringify(body), { status });

describe('fetchJson', () => {
  it('retries retryable failures with backoff, then succeeds', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(res(503)).mockResolvedValueOnce(res(200, { ok: 1 }));
    await expect(fetchJson('/x', { retries: 2, backoffMs: 1 })).resolves.toEqual({ ok: 1 });
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('does not retry client errors', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(res(404));
    await expect(fetchJson('/x', { retries: 3, backoffMs: 1 })).rejects.toBeInstanceOf(HttpError);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('gives up after the retry budget', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(res(500));
    await expect(fetchJson('/x', { retries: 2, backoffMs: 1 })).rejects.toThrow();
    expect(f).toHaveBeenCalledTimes(3);
  });
});

describe('withTimeout', () => {
  it('rejects a hung promise instead of waiting forever', async () => {
    await expect(withTimeout(new Promise(() => {}), 20, 'stream')).rejects.toThrow('stream timed out');
  });
});
