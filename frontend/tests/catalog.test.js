import { describe, expect, it } from 'vitest';
import { PAGES, PRODUCT_OPTIONS, STATE_OPTIONS } from '@/lib/catalog';
import { STATES, PRODUCT_DEFS } from '@/server/engine/geography';

describe('client catalog stays in sync with the engine', () => {
  it('lists exactly the engine states, in order, with matching slugs', () => {
    expect(STATE_OPTIONS.map(s => s.name)).toEqual(STATES.map(s => s.name));
    expect(STATE_OPTIONS.map(s => s.slug)).toEqual(STATES.map(s => s.slug));
  });
  it('lists exactly the engine products', () => {
    expect(PRODUCT_OPTIONS.map(p => p.name)).toEqual(PRODUCT_DEFS.map(p => p.name));
    expect(PRODUCT_OPTIONS.map(p => p.id)).toEqual(PRODUCT_DEFS.map(p => p.id));
  });
  it('every palette page path is unique', () => {
    expect(new Set(PAGES.map(p => p.path)).size).toBe(PAGES.length);
  });
});
