'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useFilters } from '@/hooks/useFilters';
import { Data } from '@/components/DataState';
import { FilterSelects, money, num1 } from '@/components/Filters';
import { DataTable } from '@/components/Table';
import { BAR_COLORS, BarChart, Donut } from '@/components/charts';
import { Bottle, Panel } from '@/components/ui';

export default function ProductsScreen() {
  const router = useRouter();
  const { filters, set, qs } = useFilters();
  const api = useApi(`/api/data/products?${qs}`, { live: true });

  return (
    <Data api={api}>
      {d => (
        <div className="page">
          <div className="row-between wrap">
            <h2 className="page-title">Top Performing Products <small>{d.range}</small></h2>
            <FilterSelects filters={filters} set={set} />
          </div>
          <div className="grid-2">
            <Panel title="Revenue by Product"><BarChart items={d.rows.map((p, i) => ({ name: p.name, value: p.revenue, c: BAR_COLORS[i % 5] }))} onSelect={it => router.push(`/products/${d.rows.find(r => r.name === it.name).id}?${qs}`)} /></Panel>
            <Panel title="Product Mix"><Donut items={d.rows.slice(0, 5).map(p => ({ name: p.name, value: p.revenue }))} total={Math.round(d.total)} /></Panel>
          </div>
          <Panel title="Product Ranking" action={<span className="range-note">Click a row for details</span>}>
            <DataTable rowKey={r => r.id} initialSort={{ key: 'revenue', dir: 'desc' }} onRow={r => router.push(`/products/${r.id}?${qs}`)} columns={[
              { key: 'name', label: 'Product', render: r => <span className="cell-prod"><Bottle h={28} />{r.name}<small>{r.category}</small></span> },
              { key: 'revenue', label: 'Revenue', render: r => money(r.revenue) },
              { key: 'growth', label: 'Growth', render: r => `${r.growth >= 0 ? '↑' : '↓'} ${Math.abs(r.growth)}%`, tone: r => (r.growth >= 0 ? 'up' : 'down') },
              { key: 'units', label: 'Units', render: r => `${num1(r.units)} M` },
              { key: 'share', label: 'Market share', render: r => `${num1(r.share)}%` },
              { key: 'mix', label: 'Portfolio mix', render: r => `${r.mix}%` }
            ]} rows={d.rows} />
          </Panel>
        </div>
      )}
    </Data>
  );
}
