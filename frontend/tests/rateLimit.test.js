import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '@/lib/rateLimit';

describe('rate limiter', () => {
  it('blocks after the limit and recovers after the window', () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    expect(rl.check('a').allowed).toBe(true);
    expect(rl.check('a').allowed).toBe(true);
    const blocked = rl.check('a');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(rl.check('b').allowed).toBe(true); // other clients are unaffected
    t = 1001;
    expect(rl.check('a').allowed).toBe(true);
  });

  it('bounds memory under a flood of unique keys', () => {
    const rl = createRateLimiter({ limit: 1 });
    for (let i = 0; i < 25_000; i++) rl.check(`ip-${i}`);
    expect(rl.size()).toBeLessThanOrEqual(10_000);
  });
});
