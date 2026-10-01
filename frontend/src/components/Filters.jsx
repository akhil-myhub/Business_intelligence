'use client';

import React from 'react';
import { PERIODS, PRODUCTS, REGIONS } from '@/lib/filters';
import { Select } from './ui';

// The three filters every analytics screen understands. `only` picks which to show.
export function FilterSelects({ filters, set, only = ['region', 'period'] }) {
  return (
    <div className="filters">
      {only.includes('region') && <Select label="Region" value={filters.region} options={REGIONS} onChange={v => set({ region: v })} />}
      {only.includes('period') && <Select label="Time period" value={filters.period} options={PERIODS} onChange={v => set({ period: v })} />}
      {only.includes('product') && <Select label="Product" value={filters.product} options={PRODUCTS} onChange={v => set({ product: v })} />}
    </div>
  );
}

export const money = v => `₹ ${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`;
export const num1 = v => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
