import { describe, expect, it } from 'vitest';
import { validateLogBatch, validateQuery } from '@/lib/validation';

describe('validateQuery', () => {
  it('rejects missing, empty and oversized input', () => {
    expect(validateQuery(null, 100).code).toBe('QUERY_REQUIRED');
    expect(validateQuery('   \n ', 100).code).toBe('QUERY_EMPTY');
    expect(validateQuery('x'.repeat(101), 100).code).toBe('QUERY_TOO_LONG');
  });

  it('normalises whitespace and strips control characters', () => {
    expect(validateQuery('  show\u0000  sales\t\ntrend ', 100)).toEqual({ ok: true, value: 'show sales trend' });
  });
});

describe('validateLogBatch', () => {
  it('accepts only warn/error entries and caps sizes', () => {
    const r = validateLogBatch({ entries: [{ level: 'info', message: 'no' }, { level: 'error', message: 'x'.repeat(900) }, null] });
    expect(r.ok).toBe(true);
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].message).toHaveLength(500);
  });

  it('rejects malformed bodies', () => {
    expect(validateLogBatch(null).ok).toBe(false);
    expect(validateLogBatch({ entries: [] }).ok).toBe(false);
  });
});
