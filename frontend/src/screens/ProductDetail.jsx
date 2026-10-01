'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useFilters } from '@/hooks/useFilters';
import { Data } from '@/components/DataState';
import { FilterSelects, money, num1 } from '@/components/Filters';
import { DataTable } from '@/components/Table';
import { AreaChart, BAR_COLORS, BarChart, Donut, Legend, MultiLine } from '@/components/charts';
import { Bottle, Growth, Panel, Select, Tabs } from '@/components/ui';
import { PRODUCT_OPTIONS } from '@/lib/catalog';

const TABS = ['Overview', 'Sales Trend', 'Market Share', 'Store Performance', 'Campaign Impact'];

const Stat = ({ value, label, growth }) => <Panel className="ph-stat"><b>{value}</b><small>{label}</small><Growth value={growth} /></Panel>;

export default function ProductDetailScreen({ id }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { filters, set, qs } = useFilters();
  const api = useApi(`/api/data/product?id=${id}&${qs}`, { live: true });
  const tab = TABS.includes(sp.get('tab')) ? sp.get('tab') : 'Overview';
  const setTab = t => { const n = new URLSearchParams(sp.toString()); n.set('tab', t); router.replace(`${pathname}?${n}`, { scroll: false }); };
  const me = PRODUCT_OPTIONS.find(p => p.id === id);

  return (
    <Data api={api}>
      {d => (
        <div className="page">
          <div className="row-between wrap crumbs">
            <span><Link href={`/products?${qs}`}>Products</Link> <ChevronRight size={14} /> <b>{d.product.name}</b></span>
            <div className="filters">
              <Select label="Product" value={me.name} options={PRODUCT_OPTIONS.map(p => p.name)} onChange={n => router.push(`/products/${PRODUCT_OPTIONS.find(p => p.name === n).id}?${qs}`)} />
              <FilterSelects filters={filters} set={set} />
            </div>
          </div>
          <div className="product-head">
            <Panel className="ph-name"><span className="pimg"><Bottle h={96} /></span><div><h2>{d.product.name}</h2><small>{d.product.category}</small></div></Panel>
            <Stat value={money(d.kpis.revenue.value)} label="Total Revenue" growth={d.kpis.revenue.growth} />
            <Stat value={`${num1(d.kpis.units.value)} M`} label="Units Sold" growth={d.kpis.units.growth} />
            <Stat value={`${num1(d.kpis.share.value)}%`} label="Market Share" growth={d.kpis.share.growth} />
          </div>
          <Tabs tabs={TABS} value={tab} onChange={setTab} />

          {tab === 'Overview' && (
            <div className="grid-2">
              <Panel title="Sales Trend"><AreaChart points={d.trend.points} months={d.trend.months} /></Panel>
              <Panel title="Channel Contribution"><Donut items={d.channels} total={Math.round(d.kpis.revenue.value)} /></Panel>
            </div>
          )}
          {tab === 'Sales Trend' && (
            <div className="grid-2">
              <Panel title="Weekly Revenue"><AreaChart points={d.trend.points} months={d.trend.months} height={240} /></Panel>
              <Panel title="Top States">
                <BarChart items={d.states.map((s, i) => ({ name: s.name, value: s.revenue, c: BAR_COLORS[i % 5] }))} height={240} onSelect={it => router.push(`/stores/${d.states.find(s => s.name === it.name).slug}?${qs}`)} />
              </Panel>
            </div>
          )}
          {tab === 'Market Share' && (
            <Panel title="Market Share vs Category">
              <MultiLine labels={d.share.map(s => s.label)} series={[d.share.map(s => s.ours), d.share.map(s => s.category)]} suffix="%" height={220} zoom />
              <Legend names={[d.product.name, 'All products (category)']} />
            </Panel>
          )}
          {tab === 'Store Performance' && (
            <Panel title="Performance by Store Type">
              <DataTable rowKey={r => r.type} initialSort={{ key: 'revenue', dir: 'desc' }} columns={[
                { key: 'type', label: 'Store Type' }, { key: 'revenue', label: 'Revenue', render: r => `₹ ${r.revenue.toFixed(1)} Cr` },
                { key: 'unitsLakh', label: 'Units Sold', render: r => `${r.unitsLakh} L` },
                { key: 'growth', label: 'Growth', render: r => `${r.growth >= 0 ? '↑' : '↓'} ${Math.abs(r.growth)}%`, tone: r => (r.growth >= 0 ? 'up' : 'down') }
              ]} rows={d.stores} />
            </Panel>
          )}
          {tab === 'Campaign Impact' && (
            <Panel title="Campaigns Supporting This Product">
              <DataTable rowKey={r => r.name} initialSort={{ key: 'revenue', dir: 'desc' }} columns={[
                { key: 'name', label: 'Campaign' }, { key: 'channel', label: 'Channel' }, { key: 'revenue', label: 'Revenue', render: r => `₹ ${r.revenue} Cr` },
                { key: 'uplift', label: 'Uplift', render: r => `${r.uplift}%`, tone: () => 'up' }, { key: 'reach', label: 'Reach', render: r => `${r.reach} M` }, { key: 'roi', label: 'ROI', render: r => `${r.roi}x`, tone: () => 'up' }
              ]} rows={d.campaigns} />
            </Panel>
          )}
        </div>
      )}
    </Data>
  );
}
