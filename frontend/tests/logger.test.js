import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLogger, redact } from '@/lib/logger';

afterEach(() => vi.restoreAllMocks());

describe('redact', () => {
  it('masks sensitive keys at any depth and truncates long strings', () => {
    const out = redact({ user: { email: 'a@b.c', password: 'x', ok: 1 }, token: 't', note: 'n'.repeat(2000) });
    expect(out.user.email).toBe('[redacted]');
    expect(out.user.password).toBe('[redacted]');
    expect(out.user.ok).toBe(1);
    expect(out.token).toBe('[redacted]');
    expect(out.note.length).toBeLessThan(1100);
  });

  it('serialises errors and survives deep structures', () => {
    const deep = { a: { b: { c: { d: { e: 1 } } } } };
    expect(JSON.stringify(redact(deep))).toContain('depth-limit');
    expect(redact(new Error('boom')).message).toBe('boom');
  });
});

describe('server logger', () => {
  it('writes one JSON object per line with bindings and context', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    createLogger({ requestId: 'r-1' }).info('hello', { n: 1, password: 'nope' });
    const line = JSON.parse(spy.mock.calls[0][0]);
    expect(line).toMatchObject({ level: 'info', msg: 'hello', service: 'businessai', requestId: 'r-1', ctx: { n: 1, password: '[redacted]' } });
    expect(typeof line.ts).toBe('string');
  });

  it('routes warn/error to stderr', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    createLogger().error('bad', { err: new Error('x') });
    expect(JSON.parse(err.mock.calls[0][0]).level).toBe('error');
  });
});
