import { describe, expect, it } from 'vitest';
import { aggregate, channelRevenue, indexes, periodRange } from '@/server/engine/model';
import { PRODUCT_DEFS } from '@/server/engine/geography';

const view = (f, period = 'Last Quarter') => {
  const { stateIdx, prodIdx } = indexes(f);
  const r = periodRange(period);
  return { cur: aggregate(stateIdx, prodIdx, r.w0, r.w1), prev: aggregate(stateIdx, prodIdx, r.pw0, r.pw1), stateIdx, prodIdx, r };
};
const growth = (a, b) => (a / b - 1) * 100;

describe('engine calibration (South India · Last Quarter · All Products)', () => {
  const { cur, prev } = view({ region: 'South India', product: 'All Products' });

  it('reproduces the headline KPIs', () => {
    expect(cur.rev).toBeCloseTo(892, 0);
    expect(cur.units).toBeCloseTo(8.4, 1);
    expect(cur.share).toBeCloseTo(12.8, 1);
    expect(cur.conv).toBeCloseTo(3.6, 1);
  });

  it('reproduces the headline growth rates', () => {
    expect(growth(cur.rev, prev.rev)).toBeCloseTo(14.2, 0);
    expect(growth(cur.units, prev.units)).toBeCloseTo(11.6, 0);
    expect(growth(cur.share, prev.share)).toBeCloseTo(2.4, 0);
    expect(growth(cur.conv, prev.conv)).toBeCloseTo(1.9, 0);
  });
});

describe('engine consistency', () => {
  it('filters change the numbers and parts add up to the whole', () => {
    const all = view({ region: 'All Regions', product: 'All Products' }).cur.rev;
    const regions = ['South India', 'North India', 'West India', 'East India'].map(region => view({ region, product: 'All Products' }).cur.rev);
    expect(regions.reduce((a, b) => a + b, 0)).toBeCloseTo(all, 6);

    const products = PRODUCT_DEFS.map(p => view({ region: 'South India', product: p.name }).cur.rev);
    expect(products.reduce((a, b) => a + b, 0)).toBeCloseTo(892, 0);
    expect(new Set(products.map(x => Math.round(x))).size).toBeGreaterThan(3);
  });

  it('longer periods cover more revenue', () => {
    const q = view({ region: 'South India', product: 'All Products' }, 'Last Quarter').cur.rev;
    const h = view({ region: 'South India', product: 'All Products' }, 'Last 6 Months').cur.rev;
    const y = view({ region: 'South India', product: 'All Products' }, 'Last Year').cur.rev;
    expect(h).toBeGreaterThan(q * 1.8);
    expect(y).toBeGreaterThan(h * 1.5);
  });

  it('channel revenue sums to total revenue', () => {
    const { stateIdx, prodIdx, r, cur } = view({ region: 'West India', product: 'Product B' });
    const ch = channelRevenue(stateIdx, prodIdx, r.w0, r.w1);
    expect(ch.reduce((a, b) => a + b, 0)).toBeCloseTo(cur.rev, 4);
  });

  it('every sensible metric is positive and finite', () => {
    const { cur } = view({ region: 'East India', product: 'Product F' }, 'Last Year');
    for (const v of Object.values(cur)) expect(Number.isFinite(v) && v > 0).toBe(true);
  });
});
