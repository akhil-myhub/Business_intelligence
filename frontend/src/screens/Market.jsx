'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useFilters } from '@/hooks/useFilters';
import { Data } from '@/components/DataState';
import { FilterSelects, money, num1 } from '@/components/Filters';
import { DataTable } from '@/components/Table';
import { BAR_COLORS, BarChart, Donut, Legend, MultiLine } from '@/components/charts';
import { Panel, Tabs } from '@/components/ui';

const TABS = ['Market Analysis', 'Channel Share', 'Regional Trends', 'Product Mix', 'Competitive View'];
const CHANNEL_COLORS = [['#29c0ff', '#3b6bff'], ['#3fe0d0', '#14b8a6'], ['#a98aff', '#7a4dff'], ['#ff7ac8', '#ff3fa8'], ['#ffb066', '#ff8a3c']];
const tone = r => (r.growth >= 0 ? 'up' : 'down');
const arrow = v => `${v >= 0 ? '↑' : '↓'} ${Math.abs(v)}%`;

export default function MarketScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { filters, set, qs } = useFilters();
  const api = useApi(`/api/data/market?${qs}`, { live: true });
  const tab = TABS.includes(sp.get('tab')) ? sp.get('tab') : 'Market Analysis';
  const setTab = t => { const n = new URLSearchParams(sp.toString()); n.set('tab', t); router.replace(`${pathname}?${n}`, { scroll: false }); };

  return (
    <div className="page">
      <div className="row-between wrap"><Tabs tabs={TABS} value={tab} onChange={setTab} /><FilterSelects filters={filters} set={set} only={['region', 'period', 'product']} /></div>
      <Data api={api}>
        {d => (
          <>
            {tab === 'Market Analysis' && (
              <>
                <div className="grid-2">
                  <Panel title="Channel-wise Revenue"><BarChart items={d.channels.map((c, i) => ({ name: c.name, value: c.revenue, c: CHANNEL_COLORS[i] }))} /></Panel>
                  <Panel title="Channel Contribution"><Donut items={d.channels.map(c => ({ name: c.name, value: c.share }))} total={Math.round(d.total).toLocaleString('en-IN')} /></Panel>
                </div>
                <Panel>
                  <div className="panel-head inline"><h3>Channel Growth Trend</h3><Legend names={d.channels.map(c => c.name)} /><span className="range-note">YoY, last 6 months</span></div>
                  <MultiLine series={d.growthTrend.series} labels={d.growthTrend.labels} />
                </Panel>
              </>
            )}
            {tab === 'Channel Share' && (
              <div className="grid-2">
                <Panel title="Channel Share"><Donut items={d.channels.map(c => ({ name: c.name, value: c.share }))} total={Math.round(d.total).toLocaleString('en-IN')} /></Panel>
                <Panel title="Channel Detail">
                  <DataTable rowKey={r => r.name} initialSort={{ key: 'revenue', dir: 'desc' }} columns={[
                    { key: 'name', label: 'Channel' }, { key: 'revenue', label: 'Revenue', render: r => money(r.revenue) },
                    { key: 'share', label: 'Share', render: r => `${r.share}%` }, { key: 'growth', label: 'Growth', render: r => arrow(r.growth), tone }
                  ]} rows={d.channels} />
                </Panel>
              </div>
            )}
            {tab === 'Regional Trends' && (
              <Panel title="Monthly Revenue by Region" action={<Legend names={d.regional.series.map(s => s.name)} />}>
                <MultiLine series={d.regional.series.map(s => s.values)} labels={d.regional.labels} suffix="" height={260} />
                <p className="range-note">₹ Cr per month</p>
              </Panel>
            )}
            {tab === 'Product Mix' && (
              <div className="grid-2">
                <Panel title="Product Mix"><Donut items={d.productMix.slice(0, 5).map(p => ({ name: p.name, value: p.revenue }))} total={Math.round(d.total).toLocaleString('en-IN')} /></Panel>
                <Panel title="Product Detail">
                  <DataTable rowKey={r => r.id} initialSort={{ key: 'revenue', dir: 'desc' }} onRow={r => router.push(`/products/${r.id}?${qs}`)} columns={[
                    { key: 'name', label: 'Product' }, { key: 'revenue', label: 'Revenue', render: r => money(r.revenue) },
                    { key: 'mix', label: 'Mix', render: r => `${r.mix}%` }, { key: 'growth', label: 'Growth', render: r => arrow(r.growth), tone }
                  ]} rows={d.productMix} />
                </Panel>
              </div>
            )}
            {tab === 'Competitive View' && (
              <div className="grid-2">
                <Panel title="Market Share by Brand">
                  <BarChart unit="" suffix="%" items={d.competitive.map((c, i) => ({ name: c.name, value: c.share, c: BAR_COLORS[i % 5] }))} />
                </Panel>
                <Panel title="Share Movement">
                  <DataTable rowKey={r => r.name} columns={[
                    { key: 'name', label: 'Brand' }, { key: 'share', label: 'Share', render: r => `${num1(r.share)}%` },
                    { key: 'change', label: 'Change (pp)', render: r => `${r.change >= 0 ? '+' : ''}${r.change}`, tone: r => (r.change >= 0 ? 'up' : 'down') }
                  ]} rows={d.competitive} />
                </Panel>
              </div>
            )}
          </>
        )}
      </Data>
    </div>
  );
}
